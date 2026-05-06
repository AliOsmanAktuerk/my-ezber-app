package com.ezber.api.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClassroomInviteRequest(@NotBlank @Email String email) {
}
