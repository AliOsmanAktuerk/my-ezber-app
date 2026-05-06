package com.ezber.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ezber.api.domain.dto.ClassroomInviteRequest;
import com.ezber.api.domain.dto.ClassroomRequest;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ClassroomServiceTest {
    @Mock
    private ClassroomRepository repository;

    @Mock
    private DomainLookupService lookup;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private ClassroomService service;

    @Test
    void findAllReturnsClassroomsForCurrentOwner() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var room = new RoomEntity(owner, "Room 1");
        var kurs = new KursEntity(true, "Course", "Public", owner);
        when(repository.findByAccountEmailIgnoreCase("owner@example.com")).thenReturn(List.of(new ClassroomEntity(owner, room, kurs)));

        var responses = service.findAll("owner@example.com");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().accountEmail()).isEqualTo("owner@example.com");
        assertThat(responses.getFirst().roomDescription()).isEqualTo("Room 1");
        assertThat(responses.getFirst().kursName()).isEqualTo("Course");
        verify(repository).findByAccountEmailIgnoreCase("owner@example.com");
    }

    @Test
    void findByIdRejectsClassroomForOtherOwner() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var room = new RoomEntity(owner, "Room 1");
        var kurs = new KursEntity(true, "Course", "Public", owner);
        when(repository.findById(9)).thenReturn(Optional.of(new ClassroomEntity(owner, room, kurs)));

        assertThatThrownBy(() -> service.findById(9, "other@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void createLinksCurrentAccountRoomAndVisibleCourse() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var room = new RoomEntity(owner, "Room 1");
        var kurs = new KursEntity(true, "Course", "Public", owner);
        when(accountRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(lookup.room(2)).thenReturn(room);
        when(lookup.kurs(3)).thenReturn(kurs);
        when(repository.save(any(ClassroomEntity.class))).thenReturn(new ClassroomEntity(owner, room, kurs));

        var response = service.create(new ClassroomRequest(1, 2, 3), "owner@example.com");

        assertThat(response.accountId()).isEqualTo(owner.getId());
        assertThat(response.roomId()).isEqualTo(room.getId());
        assertThat(response.kursId()).isEqualTo(kurs.getId());
    }

    @Test
    void createRejectsRoomOwnedByAnotherAccount() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var other = new AccountEntity("other@example.com", "Other", "password123", new RolleEntity("USER"));
        when(accountRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(lookup.room(2)).thenReturn(new RoomEntity(other, "Other room"));
        when(lookup.kurs(3)).thenReturn(new KursEntity(true, "Course", "Public", owner));

        assertThatThrownBy(() -> service.create(new ClassroomRequest(1, 2, 3), "owner@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void inviteCreatesInvitedClassroomLink() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var invitee = new AccountEntity("invitee@example.com", "Invitee", "password123", new RolleEntity("USER"));
        var room = new RoomEntity(owner, "Room 1");
        var kurs = new KursEntity(true, "Course", "Public", owner);
        var classroom = new ClassroomEntity(owner, room, kurs);
        var invited = new ClassroomEntity(invitee, room, kurs, ClassroomStatus.INVITED);
        when(repository.findById(9)).thenReturn(Optional.of(classroom));
        when(accountRepository.findByEmail("invitee@example.com")).thenReturn(Optional.of(invitee));
        when(repository.findByRoomIdAndKursIdAndAccountEmailIgnoreCase(room.getId(), kurs.getId(), "invitee@example.com"))
            .thenReturn(Optional.empty());
        when(repository.save(any(ClassroomEntity.class))).thenReturn(invited);

        var response = service.invite(9, new ClassroomInviteRequest("invitee@example.com"), "owner@example.com");

        assertThat(response.accountEmail()).isEqualTo("invitee@example.com");
        assertThat(response.status()).isEqualTo(ClassroomStatus.INVITED.name());
    }
}
