package com.bgmagitapi.kml.menu.repository.query;

import com.bgmagitapi.kml.menu.entity.KmlMenu;

import java.util.List;

public interface KmlMenuQueryRepository {

    List<KmlMenu> findAllMenuOrders();
}
