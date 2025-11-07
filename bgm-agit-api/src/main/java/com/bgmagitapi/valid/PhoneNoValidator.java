package com.bgmagitapi.valid;

import com.bgmagitapi.annotation.PhoneValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNoValidator implements ConstraintValidator<PhoneValid, String> {
    private static final String PHONE_REGEX = "^01[0-9]-[0-9]{3,4}-[0-9]{4}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // null은 별도 @NotBlank로 검증
        }
        return value.matches(PHONE_REGEX);
    }
}