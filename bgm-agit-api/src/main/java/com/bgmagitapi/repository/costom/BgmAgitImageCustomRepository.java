package com.bgmagitapi.repository.costom;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitImageCustomRepository {
    List<BgmAgitMainMenuImageResponse> getMainMenuImage(Long labelGb, String link);
    Page<BgmAgitMainMenuImageResponse> getDetailImage(Long labelGb, String link, Pageable pageable,String category,String name);
    
}
