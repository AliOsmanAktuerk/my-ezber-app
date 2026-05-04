package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BerechtigungRequest(@NotBlank @Size(max = 255) String berechtigung) {
}
