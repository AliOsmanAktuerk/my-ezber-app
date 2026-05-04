package com.ezber.api.auth.dto;

import java.util.Set;

public record CurrentUserResponse(Long id, String accountHash, String email, String name, Set<String> roles) {
}
