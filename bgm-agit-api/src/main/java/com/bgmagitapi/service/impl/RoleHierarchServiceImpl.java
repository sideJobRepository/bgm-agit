package com.bgmagitapi.service.impl;

import com.bgmagitapi.entity.BgmAgitRoleHierarchy;
import com.bgmagitapi.repository.BgmAgitRoleHierarchyRepository;
import com.bgmagitapi.service.BgmAgitRoleHierarchyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleHierarchServiceImpl implements BgmAgitRoleHierarchyService {

    private final BgmAgitRoleHierarchyRepository bgmAgitRoleHierarchyRepository;
    
    @Override
    public String findAllHierarchy() {
        List<BgmAgitRoleHierarchy> roleHierarchiesList = bgmAgitRoleHierarchyRepository.findAll();
        StringBuilder hierarchy = new StringBuilder();
        
        for (BgmAgitRoleHierarchy relation : roleHierarchiesList) {
            hierarchy.append("ROLE_")
                    .append(relation.getParent().getBgmAgitRoleName())
                    .append(" > ROLE_")
                    .append(relation.getBgmAgitRoleName())
                    .append("\n");
        }
        
        return hierarchy.toString();
    }
}
