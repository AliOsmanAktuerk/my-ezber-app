package com.ezber.api.domain.dto;

public record ClassroomResponse(
    Integer id,
    Integer accountId,
    String accountName,
    String accountEmail,
    Integer roomId,
    String roomDescription,
    Integer kursId,
    String kursName,
    String status
) {
}
