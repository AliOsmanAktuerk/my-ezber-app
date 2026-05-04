package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoomRequest(@NotNull Integer ownerId, @NotBlank @Size(max = 255) String description) {
}
