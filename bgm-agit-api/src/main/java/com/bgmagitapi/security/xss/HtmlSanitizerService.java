package com.bgmagitapi.security.xss;


import org.apache.commons.text.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizerService {
    // 허용할 태그와 속성 정의
     private static final Safelist ALLOWED = Safelist.basicWithImages()
             // 기본 텍스트 태그
             .addTags("p", "br", "b", "i", "strong", "em", "ul", "ol", "li", "a", "img")
 
             // figure 태그 (CKEditor, Toast UI 등에서 자동 추가됨)
             .addTags("figure")
             .addAttributes("figure", "class", "style")
 
             // 링크 관련 속성
             .addAttributes("a", "href", "title", "target")
             .addProtocols("a", "href", "http", "https")
 
             // 이미지 관련 속성
             .addAttributes("img", "src", "alt", "title", "width", "height", "style")
             .addProtocols("img", "src", "http", "https")
 
             // iframe (YouTube 등 허용용 — 옵션)
             .addTags("iframe")
             .addAttributes("iframe", "width", "height", "src", "frameborder", "allow", "allowfullscreen", "style")
             .addProtocols("iframe", "src", "https")
 
             // paragraph 등에도 style/class 허용 (에디터 포맷 유지용)
             .addAttributes("p", "class", "style")
             .addAttributes("ul", "class", "style")
             .addAttributes("ol", "class", "style")
             .addAttributes("li", "class", "style");
 
     /**
      * HTML 내용을 정화 (악성 스크립트, 이벤트 제거)
      * @param html 사용자 입력 HTML
      * @return 안전한 HTML
      */
     public String sanitize(String html) {
         if (html == null || html.isBlank()) return html;
              // 1&lt;script&gt; 같은 HTML 엔티티를 실제 태그로 변환
              String unescaped = StringEscapeUtils.unescapeHtml4(html);
              // 2JSoup으로 허용 태그만 남기고 나머지는 제거
              String cleaned = Jsoup.clean(unescaped, ALLOWED);
      
              // non-breaking space → 일반 공백 정리 (선택)
              cleaned = cleaned.replace("\u00A0", " ");
      
              return cleaned;
     }
}