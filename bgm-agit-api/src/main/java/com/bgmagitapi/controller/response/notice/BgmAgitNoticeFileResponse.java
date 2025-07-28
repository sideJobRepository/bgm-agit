package com.bgmagitapi.controller.response.notice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitNoticeFileResponse {
    private Long id;
    private String fileName;
    private String uuidName;
    private String url;
}
