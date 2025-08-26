package com.bgmagitapi.repository.costom;

import java.util.List;

public interface BgmAgitMenuRoleCustomRepository {
    
    List<Long> findMenuIdByRoleNames(List<String> roles);
}
