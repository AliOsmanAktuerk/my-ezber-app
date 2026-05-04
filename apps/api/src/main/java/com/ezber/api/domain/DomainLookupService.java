package com.ezber.api.domain;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DomainLookupService {
    private final AccountRepository accountRepository;
    private final RolleRepository rolleRepository;
    private final BerechtigungRepository berechtigungRepository;
    private final RoomRepository roomRepository;
    private final KursRepository kursRepository;
    private final MatchRepository matchRepository;

    public DomainLookupService(
        AccountRepository accountRepository,
        RolleRepository rolleRepository,
        BerechtigungRepository berechtigungRepository,
        RoomRepository roomRepository,
        KursRepository kursRepository,
        MatchRepository matchRepository
    ) {
        this.accountRepository = accountRepository;
        this.rolleRepository = rolleRepository;
        this.berechtigungRepository = berechtigungRepository;
        this.roomRepository = roomRepository;
        this.kursRepository = kursRepository;
        this.matchRepository = matchRepository;
    }

    public AccountEntity account(Integer id) {
        return accountRepository.findById(id).orElseThrow(() -> notFound("Account", id));
    }

    public RolleEntity rolle(Integer id) {
        return rolleRepository.findById(id).orElseThrow(() -> notFound("Rolle", id));
    }

    public BerechtigungEntity berechtigung(Integer id) {
        return berechtigungRepository.findById(id).orElseThrow(() -> notFound("Berechtigung", id));
    }

    public RoomEntity room(Integer id) {
        return roomRepository.findById(id).orElseThrow(() -> notFound("Room", id));
    }

    public KursEntity kurs(Integer id) {
        return kursRepository.findById(id).orElseThrow(() -> notFound("Kurs", id));
    }

    public MatchEntity match(Integer id) {
        return matchRepository.findById(id).orElseThrow(() -> notFound("Match", id));
    }

    private ResponseStatusException notFound(String type, Integer id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, type + " " + id + " wurde nicht gefunden");
    }
}
