package com.bgmagitapi.repository.costom;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;

import java.util.List;

public interface BgmAgitImageCustomRepository {
    List<BgmAgitMainMenuImageResponse> getMainMenuImage(Long labelGb, String link);
}
