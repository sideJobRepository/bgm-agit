package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마도서 임시저장(진행 중인 판). 진행 상태는 원래 이야기꾼 기기에만 두지만,
 * 기기를 바꾸거나 나중에 이어서 하려고 이야기꾼이 직접 [임시저장]을 누른 판만 서버에 둔다.
 * 누가 악마인지 다 들어 있어 저장한 회원·관리자만 연다(서비스에서 확인).
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerGrimoireSave extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_ID")
    private Long id;

    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long memberId;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private Long gameId;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_TITLE")
    private String title;

    // 마도서 상태 JSON(스크립트 데이터 포함). 화면이 그대로 다시 연다
    @Column(name = "BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_STATE", columnDefinition = "LONGTEXT")
    private String state;

    public BgmAgitClockTowerGrimoireSave(Long memberId, Long gameId, String title, String state) {
        this.memberId = memberId;
        this.gameId = gameId;
        this.title = title;
        this.state = state;
    }

    public void overwrite(Long gameId, String title, String state) {
        this.gameId = gameId;
        this.title = title;
        this.state = state;
    }
}
