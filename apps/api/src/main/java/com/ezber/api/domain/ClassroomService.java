package com.ezber.api.domain;

import com.ezber.api.domain.dto.ClassroomRequest;
import com.ezber.api.domain.dto.ClassroomAccountResponse;
import com.ezber.api.domain.dto.ClassroomInviteRequest;
import com.ezber.api.domain.dto.ClassroomResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassroomService {
    private final ClassroomRepository repository;
    private final DomainLookupService lookup;
    private final AccountRepository accountRepository;

    public ClassroomService(ClassroomRepository repository, DomainLookupService lookup, AccountRepository accountRepository) {
        this.repository = repository;
        this.lookup = lookup;
        this.accountRepository = accountRepository;
    }

    public List<ClassroomResponse> findAll(String accountEmail) {
        return repository.findByAccountEmailIgnoreCase(accountEmail).stream().map(DomainMapper::toResponse).toList();
    }

    public ClassroomResponse findById(Integer id, String accountEmail) {
        var classroom = repository.findById(id).orElseThrow(() -> notFound(id));

        if (!canAccess(classroom, accountEmail)) {
            throw notFound(id);
        }

        return DomainMapper.toResponse(classroom);
    }

    public List<ClassroomAccountResponse> findAccounts(Integer id, String accountEmail) {
        var classroom = repository.findById(id).orElseThrow(() -> notFound(id));

        if (!canAccess(classroom, accountEmail)) {
            throw notFound(id);
        }

        return repository.findByRoomIdAndKursId(classroom.getRoom().getId(), classroom.getKurs().getId()).stream()
            .map(ClassroomEntity::getAccount)
            .distinct()
            .map(account -> repository.findByRoomIdAndKursIdAndAccountEmailIgnoreCase(
                    classroom.getRoom().getId(),
                    classroom.getKurs().getId(),
                    account.getEmail()
                )
                .map(link -> new ClassroomAccountResponse(account.getId(), account.getName(), account.getEmail(), link.getStatus().name()))
                .orElseGet(() -> new ClassroomAccountResponse(account.getId(), account.getName(), account.getEmail(), ClassroomStatus.JOINED.name())))
            .toList();
    }

    @Transactional
    public ClassroomResponse invite(Integer id, ClassroomInviteRequest request, String accountEmail) {
        var classroom = repository.findById(id).orElseThrow(() -> notFound(id));

        if (!canAccess(classroom, accountEmail)) {
            throw notFound(id);
        }

        var invitee = accountRepository.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        var roomId = classroom.getRoom().getId();
        var kursId = classroom.getKurs().getId();
        var existing = repository.findByRoomIdAndKursIdAndAccountEmailIgnoreCase(roomId, kursId, invitee.getEmail());

        if (existing.isPresent()) {
            var link = existing.get();
            if (link.getStatus() != ClassroomStatus.JOINED) {
                link.setStatus(ClassroomStatus.INVITED);
            }
            return DomainMapper.toResponse(link);
        }

        return DomainMapper.toResponse(repository.save(new ClassroomEntity(
            invitee,
            classroom.getRoom(),
            classroom.getKurs(),
            ClassroomStatus.INVITED
        )));
    }

    @Transactional
    public ClassroomResponse create(ClassroomRequest request, String accountEmail) {
        var account = accountRepository.findByEmail(accountEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        var room = lookup.room(request.roomId());
        var kurs = lookup.kurs(request.kursId());

        if (!room.getOwner().getEmail().equalsIgnoreCase(accountEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }

        if (!kurs.isPublicCourse() && !kurs.getAccount().getEmail().equalsIgnoreCase(accountEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kurs not found");
        }

        return DomainMapper.toResponse(repository.save(new ClassroomEntity(
            account,
            room,
            kurs
        )));
    }

    @Transactional
    public ClassroomResponse update(Integer id, ClassroomRequest request) {
        var classroom = repository.findById(id).orElseThrow(() -> notFound(id));
        classroom.update(lookup.account(request.accountId()), lookup.room(request.roomId()), lookup.kurs(request.kursId()));
        return DomainMapper.toResponse(classroom);
    }

    public void delete(Integer id) {
        repository.delete(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    private ResponseStatusException notFound(Integer id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Classroom " + id + " wurde nicht gefunden");
    }

    private boolean canAccess(ClassroomEntity classroom, String accountEmail) {
        return classroom.getAccount().getEmail().equalsIgnoreCase(accountEmail)
            || classroom.getRoom().getOwner().getEmail().equalsIgnoreCase(accountEmail);
    }
}
