package com.ezber.api.auth.dto;

public record AuthResponse(String token, String accountHash, String email, String name) {
}
