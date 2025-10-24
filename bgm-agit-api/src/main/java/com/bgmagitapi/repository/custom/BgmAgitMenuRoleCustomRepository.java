package com.bgmagitapi.repository.custom;

import java.util.List;

public interface BgmAgitMenuRoleCustomRepository {
    
    List<Long> findMenuIdByRoleNames(List<String> roles);
}
