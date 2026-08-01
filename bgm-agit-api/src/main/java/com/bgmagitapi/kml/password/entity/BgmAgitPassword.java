package com.bgmagitapi.kml.password.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "BGM_AGIT_PASSWORD")
@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class BgmAgitPassword extends DateSuperClass {

    public static final Long SINGLETON_ID = 1L;

    // BGM 아지트 점수 입력 ID
    @Id
    @Column(name = "BGM_AGIT_SCORE_INPUTS_ID")
    private Long id;

    // BGM 아지트 점수 입력 비밀번호 (BCrypt 해시)
    @Column(name = "BGM_AGIT_SCORE_INPUTS_PASSWORD")
    private String scoreInputsPassword;

    public static BgmAgitPassword ofSingleton(String hashedPassword) {
        return BgmAgitPassword.builder()
                .id(SINGLETON_ID)
                .scoreInputsPassword(hashedPassword)
                .build();
    }

    public void changePassword(String hashedPassword) {
        this.scoreInputsPassword = hashedPassword;
    }
}
