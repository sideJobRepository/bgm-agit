package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitUrlRolePostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitUrlRoleResponse;
import com.bgmagitapi.origin.entity.BgmAgitRole;
import com.bgmagitapi.origin.entity.BgmAgitUrlResources;
import com.bgmagitapi.origin.entity.BgmAgitUrlResourcesRole;
import com.bgmagitapi.origin.repository.BgmAgitRoleRepository;
import com.bgmagitapi.origin.repository.BgmAgitUrlResourcesRepository;
import com.bgmagitapi.origin.repository.BgmAgitUrlResourcesRoleRepository;
import com.bgmagitapi.origin.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.origin.service.BgmAgitUrlRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitUrlRoleServiceImpl implements BgmAgitUrlRoleService {

    private final BgmAgitUrlResourcesRepository urlResourcesRepository;
    private final BgmAgitUrlResourcesRoleRepository urlResourcesRoleRepository;
    private final BgmAgitRoleRepository roleRepository;
    private final BgmAgitAuthorizationManager authorizationManager;

    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitUrlRoleResponse> getUrlRoles() {
        return urlResourcesRoleRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparingInt((BgmAgitUrlResourcesRole item) -> methodOrder(item.getBgmAgitUrlResources().getBgmAgitUrlHttpMethod()))
                        .thenComparing(item -> item.getBgmAgitUrlResources().getBgmAgitUrlResourcesPath())
                        .thenComparing(item -> item.getBgmAgitRole().getBgmAgitRoleName()))
                .map(BgmAgitUrlRoleResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitRoleOptionResponse> getRoleOptions() {
        return roleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BgmAgitRole::getBgmAgitRoleId))
                .map(BgmAgitRoleOptionResponse::from)
                .toList();
    }

    @Override
    public ApiResponse createUrlRole(BgmAgitUrlRolePostRequest request) {
        String path = normalizePath(request.getPath());
        String httpMethod = request.getHttpMethod().trim().toUpperCase();

        BgmAgitRole role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 역할입니다."));

        BgmAgitUrlResources resources = urlResourcesRepository
                .findByBgmAgitUrlHttpMethodAndBgmAgitUrlResourcesPath(httpMethod, path)
                .orElseGet(() -> urlResourcesRepository.save(BgmAgitUrlResources.create(path, httpMethod)));

        boolean exists = urlResourcesRoleRepository
                .existsByBgmAgitRole_BgmAgitRoleIdAndBgmAgitUrlResources_BgmAgitUrlResourcesId(
                        role.getBgmAgitRoleId(),
                        resources.getBgmAgitUrlResourcesId()
                );

        if (exists) {
            return new ApiResponse(200, true, "이미 등록된 URL 권한입니다.");
        }

        urlResourcesRoleRepository.save(BgmAgitUrlResourcesRole.create(role, resources));
        authorizationManager.reload();
        return new ApiResponse(200, true, "URL 권한이 저장되었습니다.");
    }

    private String normalizePath(String path) {
        String trimmed = path.trim();
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }

    private int methodOrder(String httpMethod) {
        return switch (httpMethod) {
            case "GET" -> 1;
            case "POST" -> 2;
            case "PUT" -> 3;
            case "DELETE" -> 4;
            default -> 99;
        };
    }
}
