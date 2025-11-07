package com.bgmagitapi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitInquiryPutRequest {

    private Long id;
    
    private String title;
    
    private String cont;
}
