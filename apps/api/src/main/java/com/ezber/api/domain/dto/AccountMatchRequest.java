package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotNull;

public record AccountMatchRequest(@NotNull Integer accountId, @NotNull Integer matchId) {
}
