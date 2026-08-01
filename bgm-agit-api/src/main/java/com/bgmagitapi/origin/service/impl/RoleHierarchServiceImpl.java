package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.entity.BgmAgitRoleHierarchy;
import com.bgmagitapi.origin.repository.BgmAgitRoleHierarchyRepository;
import com.bgmagitapi.origin.service.BgmAgitRoleHierarchyService;
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
    @Transactional(readOnly = true)
    public String findAllHierarchy() {
        List<BgmAgitRoleHierarchy> roleHierarchiesList = bgmAgitRoleHierarchyRepository.findAll();
        StringBuilder hierarchy = new StringBuilder();
        
        for (BgmAgitRoleHierarchy relation : roleHierarchiesList) {
            BgmAgitRoleHierarchy parent = relation.getParent();
            if (parent == null) continue; // 부모가 없으면 스킵
            hierarchy.append("ROLE_")
                    .append(relation.getParent() != null ? relation.getParent().getBgmAgitRoleName() : relation.getBgmAgitRoleName())
                    .append(" > ROLE_")
                    .append(relation.getBgmAgitRoleName())
                    .append("\n");
        }
        
        return hierarchy.toString();
    }
}
