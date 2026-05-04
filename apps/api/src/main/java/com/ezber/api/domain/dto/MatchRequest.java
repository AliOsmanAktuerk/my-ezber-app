package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotNull;

public record MatchRequest(@NotNull Integer accountId) {
}
