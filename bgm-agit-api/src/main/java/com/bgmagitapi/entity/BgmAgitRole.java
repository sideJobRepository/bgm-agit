package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_ROLE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitRole extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_ROLE_ID")
    private Long bgmAgitRoleId;
    
    @Column(name = "BGM_AGIT_ROLE_NAME")
    private String bgmAgitRoleName;
    
    public BgmAgitRole(Long bgmAgitRoleId) {
        this.bgmAgitRoleId =bgmAgitRoleId;
    }
}
