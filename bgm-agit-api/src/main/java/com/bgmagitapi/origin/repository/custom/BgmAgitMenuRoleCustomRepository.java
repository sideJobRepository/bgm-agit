package com.bgmagitapi.origin.repository.custom;

import java.util.List;

public interface BgmAgitMenuRoleCustomRepository {
    
    List<Long> findMenuIdByRoleNames(List<String> roles);
}
