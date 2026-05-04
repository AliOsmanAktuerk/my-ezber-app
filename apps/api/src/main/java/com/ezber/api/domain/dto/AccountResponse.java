package com.ezber.api.domain.dto;

public record AccountResponse(Integer id, String email, String hash, Integer rolleId, String rolleName) {
}
