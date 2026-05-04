package com.ezber.api.domain.dto;

import jakarta.validation.constraints.NotNull;

public record RolleBerechtigungRequest(@NotNull Integer rolleId, @NotNull Integer berechtigungId) {
}
