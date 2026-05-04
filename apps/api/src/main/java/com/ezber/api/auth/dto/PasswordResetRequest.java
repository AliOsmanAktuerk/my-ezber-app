package com.ezber.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(
    @NotBlank String token,
    @Size(min = 8, max = 128) String password
) {
}
