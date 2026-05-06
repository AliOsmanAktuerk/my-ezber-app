package com.ezber.api.domain;

import com.ezber.api.domain.dto.*;

final class DomainMapper {
    private DomainMapper() {
    }

    static AccountResponse toResponse(AccountEntity account) {
        return new AccountResponse(
            account.getId(),
            account.getEmail(),
            account.getName(),
            account.getHash(),
            account.getRolle().getId(),
            account.getRolle().getName()
        );
    }

    static RolleResponse toResponse(RolleEntity rolle) {
        return new RolleResponse(rolle.getId(), rolle.getName());
    }

    static BerechtigungResponse toResponse(BerechtigungEntity berechtigung) {
        return new BerechtigungResponse(berechtigung.getId(), berechtigung.getBerechtigung());
    }

    static RoomResponse toResponse(RoomEntity room) {
        return new RoomResponse(room.getId(), room.getOwner().getId(), room.getOwner().getEmail(), room.getDescription());
    }

    static KursResponse toResponse(KursEntity kurs) {
        return new KursResponse(
            kurs.getId(),
            kurs.isPublicCourse(),
            kurs.getName(),
            kurs.getDescription(),
            kurs.getAccount().getId(),
            kurs.getAccount().getEmail(),
            kurs.getAccount().getName()
        );
    }

    static KursItemResponse toResponse(KursItemEntity item) {
        return new KursItemResponse(item.getId(), item.getName(), item.isState(), item.getKurs().getId());
    }

    static ClassroomResponse toResponse(ClassroomEntity classroom) {
        return new ClassroomResponse(
            classroom.getId(),
            classroom.getAccount().getId(),
            classroom.getAccount().getName(),
            classroom.getAccount().getEmail(),
            classroom.getRoom().getId(),
            classroom.getRoom().getDescription(),
            classroom.getKurs().getId(),
            classroom.getKurs().getName(),
            classroom.getStatus().name()
        );
    }

    static MatchResponse toResponse(MatchEntity match) {
        return new MatchResponse(match.getId(), match.getAccount().getId());
    }

    static AccountMatchResponse toResponse(AccountMatchEntity accountMatch) {
        return new AccountMatchResponse(accountMatch.getId(), accountMatch.getAccount().getId(), accountMatch.getMatch().getId());
    }

    static RolleBerechtigungResponse toResponse(RolleBerechtigungEntity entity) {
        return new RolleBerechtigungResponse(entity.getId(), entity.getRolle().getId(), entity.getBerechtigung().getId());
    }
}
