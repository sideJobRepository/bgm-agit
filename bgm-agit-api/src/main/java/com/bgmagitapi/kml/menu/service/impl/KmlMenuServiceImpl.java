package com.bgmagitapi.kml.menu.service.impl;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.KmlMenuRepository;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class KmlMenuServiceImpl implements KmlMenuService {
    
    
    private final KmlMenuRepository kmlMenuRepository;
    
    @Override
    public List<KmlMenuGetResponse> findByKmlMenu() {
        List<KmlMenu> findAllMenu = kmlMenuRepository.findAll();
        return findAllMenu
                .stream()
                .map(item ->
                        KmlMenuGetResponse.builder()
                                .id(item.getId())
                                .menuName(item.getMenuName())
                                .menuLink(item.getMenuLink())
                                .menuOrders(item.getOrders())
                                .icon(item.getIcon())
                                .build()
                ).sorted(Comparator.comparing(KmlMenuGetResponse::getMenuOrders))
                .toList();
    }
}
