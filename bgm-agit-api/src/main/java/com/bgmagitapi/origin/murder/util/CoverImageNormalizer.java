package com.bgmagitapi.origin.murder.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 머더 게임 표지를 S3 에 올리기 전에 크기를 맞춘다.
 * 표지 출처(머미로그·판매처)마다 흰 여백이 넓은 상품 사진, 정사각형 그림 등 제각각이라
 * 목록 카드(3:4)에 넣으면 상자가 작게 보이거나 위아래가 비었다.
 *
 * 1. 둘레의 배경(네 모서리 색과 비슷한 줄)을 잘라낸다 — 상품 사진의 흰 여백
 * 2. 3:4 로 가운데를 잘라낸다(카드를 꽉 채운다. 정사각형 그림은 양옆이 조금 잘린다)
 * 3. 600×800 JPG 로 저장한다(투명 배경은 흰색으로)
 *
 * 읽지 못하는 형식이면 null — 호출부가 원본 그대로 올린다(표지 저장을 막지 않는다)
 */
@Slf4j
@Component
public class CoverImageNormalizer {

    static final int WIDTH = 600;
    static final int HEIGHT = 800;
    // 배경으로 볼 색 차이(채널별). JPG 잡티·그림자 끝자락까지 배경으로 본다
    private static final int TOLERANCE = 28;
    // 잘라낸 뒤 이보다 작으면(거의 단색 이미지) 자르지 않는다
    private static final double MIN_KEEP_RATIO = 0.2;

    public record NormalizedImage(byte[] bytes, String contentType, String ext) {
    }

    public NormalizedImage normalize(byte[] original) {
        try {
            BufferedImage source = ImageIO.read(new ByteArrayInputStream(original));
            if (source == null) return null;
            BufferedImage flat = flatten(source);
            BufferedImage trimmed = trimBorder(flat);
            BufferedImage fitted = coverFit(trimmed, WIDTH, HEIGHT);
            return new NormalizedImage(toJpeg(fitted), "image/jpeg", "jpg");
        } catch (IOException | RuntimeException e) {
            log.warn("[표지] 크기 맞추기 실패 — 원본으로 저장 : {}", e.getMessage());
            return null;
        }
    }

    // 투명 배경을 흰색으로 깔고 RGB 로 바꾼다(JPG 는 투명이 없다)
    static BufferedImage flatten(BufferedImage source) {
        BufferedImage rgb = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
        g.drawImage(source, 0, 0, null);
        g.dispose();
        return rgb;
    }

    /** 네 모서리 평균색을 배경으로 보고, 바깥에서부터 배경뿐인 줄을 걷어낸다 */
    static BufferedImage trimBorder(BufferedImage img) {
        int w = img.getWidth();
        int h = img.getHeight();
        int bg = averageCorner(img);

        int top = 0;
        while (top < h - 1 && rowIsBackground(img, top, bg)) top++;
        int bottom = h - 1;
        while (bottom > top && rowIsBackground(img, bottom, bg)) bottom--;
        int left = 0;
        while (left < w - 1 && columnIsBackground(img, left, top, bottom, bg)) left++;
        int right = w - 1;
        while (right > left && columnIsBackground(img, right, top, bottom, bg)) right--;

        int newW = right - left + 1;
        int newH = bottom - top + 1;
        if (newW < w * MIN_KEEP_RATIO || newH < h * MIN_KEEP_RATIO) return img;
        if (newW == w && newH == h) return img;
        return img.getSubimage(left, top, newW, newH);
    }

    /** 비율을 지키며 target 을 꽉 채우게 키우고 넘치는 쪽을 가운데 기준으로 자른다(CSS object-fit: cover) */
    static BufferedImage coverFit(BufferedImage img, int targetW, int targetH) {
        double scale = Math.max((double) targetW / img.getWidth(), (double) targetH / img.getHeight());
        int scaledW = (int) Math.ceil(img.getWidth() * scale);
        int scaledH = (int) Math.ceil(img.getHeight() * scale);
        int offsetX = (targetW - scaledW) / 2;
        int offsetY = (targetH - scaledH) / 2;

        BufferedImage out = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(img, offsetX, offsetY, scaledW, scaledH, null);
        g.dispose();
        return out;
    }

    private static int averageCorner(BufferedImage img) {
        int w = img.getWidth() - 1;
        int h = img.getHeight() - 1;
        int[] corners = {img.getRGB(0, 0), img.getRGB(w, 0), img.getRGB(0, h), img.getRGB(w, h)};
        int r = 0, g = 0, b = 0;
        for (int c : corners) {
            r += (c >> 16) & 0xff;
            g += (c >> 8) & 0xff;
            b += c & 0xff;
        }
        return ((r / 4) << 16) | ((g / 4) << 8) | (b / 4);
    }

    private static boolean rowIsBackground(BufferedImage img, int y, int bg) {
        for (int x = 0; x < img.getWidth(); x++) {
            if (!similar(img.getRGB(x, y), bg)) return false;
        }
        return true;
    }

    private static boolean columnIsBackground(BufferedImage img, int x, int top, int bottom, int bg) {
        for (int y = top; y <= bottom; y++) {
            if (!similar(img.getRGB(x, y), bg)) return false;
        }
        return true;
    }

    private static boolean similar(int a, int b) {
        return Math.abs(((a >> 16) & 0xff) - ((b >> 16) & 0xff)) <= TOLERANCE
                && Math.abs(((a >> 8) & 0xff) - ((b >> 8) & 0xff)) <= TOLERANCE
                && Math.abs((a & 0xff) - (b & 0xff)) <= TOLERANCE;
    }

    private static byte[] toJpeg(BufferedImage img) throws IOException {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.88f);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(img, null, null), param);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }
}
