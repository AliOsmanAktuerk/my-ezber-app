package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record KursItemRequest(@NotBlank @Size(max = 255) String name, boolean state, @NotNull Integer kursId) {
}
