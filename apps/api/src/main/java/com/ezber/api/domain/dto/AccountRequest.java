package com.ezber.api.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AccountRequest(
    @Email @NotBlank String email,
    @NotBlank @Size(min = 8, max = 255) String password,
    @NotNull Integer rolleId
) {
}
