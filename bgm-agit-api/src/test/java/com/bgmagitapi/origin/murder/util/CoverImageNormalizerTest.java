package com.bgmagitapi.origin.murder.util;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class CoverImageNormalizerTest {

    // 흰 여백 한가운데 작은 상자가 있는 상품 사진 흉내
    private static BufferedImage productPhoto() {
        BufferedImage img = new BufferedImage(1000, 1000, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 1000, 1000);
        g.setColor(new Color(20, 60, 140));
        g.fillRect(350, 300, 300, 400); // 3:4 상자
        g.dispose();
        return img;
    }

    @Test
    void 흰_여백을_걷어내면_상자만_남는다() {
        BufferedImage trimmed = CoverImageNormalizer.trimBorder(productPhoto());
        assertThat(trimmed.getWidth()).isEqualTo(300);
        assertThat(trimmed.getHeight()).isEqualTo(400);
    }

    @Test
    void 결과는_항상_600x800_JPG이고_상자가_꽉_찬다() throws IOException {
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(productPhoto(), "png", png);

        CoverImageNormalizer.NormalizedImage result = new CoverImageNormalizer().normalize(png.toByteArray());

        assertThat(result).isNotNull();
        assertThat(result.contentType()).isEqualTo("image/jpeg");
        BufferedImage out = ImageIO.read(new ByteArrayInputStream(result.bytes()));
        assertThat(out.getWidth()).isEqualTo(600);
        assertThat(out.getHeight()).isEqualTo(800);
        // 모서리까지 상자 색(흰 여백이 남지 않음)
        Color corner = new Color(out.getRGB(5, 5));
        assertThat(corner.getRed()).isLessThan(80);
    }

    @Test
    void 정사각형_그림은_가운데를_3대4로_자른다() {
        BufferedImage square = new BufferedImage(900, 900, BufferedImage.TYPE_INT_RGB);
        BufferedImage out = CoverImageNormalizer.coverFit(square, 600, 800);
        assertThat(out.getWidth()).isEqualTo(600);
        assertThat(out.getHeight()).isEqualTo(800);
    }

    @Test
    void 이미지가_아니면_null() {
        assertThat(new CoverImageNormalizer().normalize("not an image".getBytes())).isNull();
    }

    @Test
    void 머미로그_webp도_읽는다() throws IOException {
        // TwelveMonkeys 플러그인이 붙어 있어야 webp 를 읽는다
        assertThat(ImageIO.getImageReadersByFormatName("webp").hasNext()).isTrue();
    }
}
