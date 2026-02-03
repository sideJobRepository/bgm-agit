package com.bgmagitapi.kml.menurole.repository.query;

import java.util.List;

public interface KmlMenuRoleQueryRepository {

    List<Long> findMenuIdByRoleNames(List<String> roles);
}
