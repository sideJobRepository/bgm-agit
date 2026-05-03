package com.bgmagitapi.kml.password.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.password.dto.request.BgmAgitPasswordRequest;
import com.bgmagitapi.kml.password.entity.BgmAgitPassword;
import com.bgmagitapi.kml.password.repository.BgmAgitPasswordRepository;
import com.bgmagitapi.kml.password.service.BgmAgitPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitPasswordServiceImpl implements BgmAgitPasswordService {

    private final BgmAgitPasswordRepository bgmAgitPasswordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public void verify(String rawPassword) {
        Optional<BgmAgitPassword> stored = bgmAgitPasswordRepository.findById(BgmAgitPassword.SINGLETON_ID);

        if (stored.isEmpty() || stored.get().getScoreInputsPassword() == null
                || stored.get().getScoreInputsPassword().isBlank()) {
            return;
        }

        if (rawPassword == null || rawPassword.isBlank()
                || !passwordEncoder.matches(rawPassword, stored.get().getScoreInputsPassword())) {
            throw new ValidException("비밀번호가 일치하지 않습니다.");
        }
    }

    @Override
    public ApiResponse changePassword(BgmAgitPasswordRequest request) {
        String hashed = passwordEncoder.encode(request.getPassword());

        BgmAgitPassword entity = bgmAgitPasswordRepository.findById(BgmAgitPassword.SINGLETON_ID)
                .orElseGet(() -> BgmAgitPassword.ofSingleton(hashed));

        if (entity.getScoreInputsPassword() != null) {
            entity.changePassword(hashed);
        }
        bgmAgitPasswordRepository.save(entity);

        return new ApiResponse(200, true, "비밀번호가 변경되었습니다.");
    }
}
