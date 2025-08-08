package com.bgmagitapi.entity;


import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "BGM_AGIT_RSA")
@Getter
public class BgmAgitRsa extends DateSuperClass {
    
    // BGM 아지트 RSA ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RSA_ID")
    private Long bgmAgitRsaId;
    
    // BGM 아지트 RSA 개인 키
    @Column(name = "BGM_AGIT_RSA_PRIVATE_KEY")
    private String bgmAgitRsaPrivateKey;
}
