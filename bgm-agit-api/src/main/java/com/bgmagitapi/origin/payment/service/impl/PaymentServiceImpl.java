package com.bgmagitapi.origin.payment.service.impl;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;

    // 토스 clientKey는 공개키(프론트 전달용). secretKey는 STEP 2 승인부터 사용
    @Value("${toss.client-key}")
    private String tossClientKey;

    @Override
    public PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재 하지 않은 회원입니다."));
        
        String orderNo = "bgmagit_" + reservationNo + "_" + System.currentTimeMillis();

        BgmAgitPayment payment = new BgmAgitPayment(member, reservationNo, orderNo, amount);
        bgmAgitPaymentRepository.save(payment);

        return new PaymentOrderResponse(orderNo, amount, orderName, tossClientKey);
    }
}
