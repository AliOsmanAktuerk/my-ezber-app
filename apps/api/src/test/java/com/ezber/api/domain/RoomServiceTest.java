package com.ezber.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {
    @Mock
    private RoomRepository repository;

    @Mock
    private DomainLookupService lookup;

    @InjectMocks
    private RoomService service;

    @Test
    void findAllReturnsRoomsForCurrentOwner() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        when(repository.findByOwnerEmailIgnoreCase("owner@example.com")).thenReturn(List.of(new RoomEntity(owner, "Room 1")));

        var responses = service.findAll("owner@example.com");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().ownerEmail()).isEqualTo("owner@example.com");
        verify(repository).findByOwnerEmailIgnoreCase("owner@example.com");
    }

    @Test
    void findByIdRejectsRoomForOtherOwner() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        when(lookup.room(7)).thenReturn(new RoomEntity(owner, "Room 1"));

        assertThatThrownBy(() -> service.findById(7, "other@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void findByIdAllowsRoomForOwner() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        when(lookup.room(7)).thenReturn(new RoomEntity(owner, "Room 1"));

        var response = service.findById(7, "owner@example.com");

        assertThat(response.ownerEmail()).isEqualTo("owner@example.com");
        assertThat(response.description()).isEqualTo("Room 1");
    }
}
