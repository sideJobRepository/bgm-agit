package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "BGM_AGIT_ROLE")
@Getter
public class BgmAgitRole extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_ROLE_ID")
    private Long bgmAgitRoleId;
    
    @Column(name = "BGM_AGIT_ROLE_NAME")
    private String bgmAgitRoleName;
}
