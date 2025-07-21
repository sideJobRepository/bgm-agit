package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "BGM_AGIT_ROLE_HIERARCHY")
@Getter
public class BgmAgitRoleHierarchy extends DateSuperClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_ROLE_HIERARCHY_ID")
    private Long bgmAgitRoleHierarchyId;
    
    @Column(name = "BGM_AGIT_ROLE_NAME")
    private String bgmAgitRoleName;
    
    // 단방향 자기참조 매핑: 상위 권한
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_PARENT_ROLE_ID")
    private BgmAgitRoleHierarchy parent;
}
