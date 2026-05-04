package com.ezber.api.domain.dto;

public record RoomResponse(Integer id, Integer ownerId, String ownerEmail, String description) {
}
