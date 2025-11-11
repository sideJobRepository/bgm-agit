package com.bgmagitapi.entity;

import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BGM_AGIT_INQUIRY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BgmAgitInquiry extends DateSuperClass {
        
 
        
        /** 문의 ID (PK) */
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       @Column(name = "BGM_AGIT_INQUIRY_ID")
       private Long bgmAgitInquiryId;
   
       /** 부모 문의 ID (답변일 경우 원글 ID 참조) */
       @Column(name = "BGM_AGIT_INQUIRY_HIERARCHY_ID")
       private Long bgmAgitInquiryHierarchyId;
   
       /** 회원 ID (작성자) */
       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
       private BgmAgitMember bgmAgitMember;
   
       /** 문의 제목 */
       @Column(name = "BGM_AGIT_INQUIRY_TITLE")
       private String bgmAgitInquiryTitle;
   
       /** 문의 내용 */
       @Column(name = "BGM_AGIT_INQUIRY_CONT")
       private String bgmAgitInquiryCont;
   
       /** 답변 여부 (Y/N) */
       @Column(name = "BGM_AGIT_INQUIRY_ANSWER_STATUS")
       private String bgmAgitInquiryAnswerStatus;
       
       public void modify(BgmAgitInquiryPutRequest request) {
              this.bgmAgitInquiryTitle = request.getTitle();
              this.bgmAgitInquiryCont = request.getCont();
       }
       
       public void modifyAnswerStatus(String value) {
              this.bgmAgitInquiryAnswerStatus = value;
       }
}
