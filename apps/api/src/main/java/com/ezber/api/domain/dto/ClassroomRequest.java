package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotNull;

public record ClassroomRequest(@NotNull Integer accountId, @NotNull Integer roomId, @NotNull Integer kursId) {
}
