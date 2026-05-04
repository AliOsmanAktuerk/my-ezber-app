package com.ezber.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank
    @Size(min = 2, max = 80)
    @Pattern(
        regexp = "^[\\p{L}\\p{M}0-9 ._'-]+$",
        message = "Name darf nur Buchstaben, Zahlen, Leerzeichen und ._'- enthalten"
    )
    String name,
    @Email @NotBlank String email,
    @Size(min = 8, max = 128) String password
) {
}
