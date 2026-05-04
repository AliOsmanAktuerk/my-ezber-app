package com.ezber.api.domain.dto;

public record AccountResponse(Integer id, String email, String name, String hash, Integer rolleId, String rolleName) {
}
