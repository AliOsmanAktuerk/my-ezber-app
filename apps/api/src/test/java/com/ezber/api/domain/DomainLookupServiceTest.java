package com.ezber.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DomainLookupServiceTest {
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RolleRepository rolleRepository;
    @Mock
    private BerechtigungRepository berechtigungRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private KursRepository kursRepository;
    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private DomainLookupService service;

    @Test
    void roleReturnsEntityWhenFound() {
        var rolle = new RolleEntity("USER");
        when(rolleRepository.findById(7)).thenReturn(Optional.of(rolle));

        assertThat(service.rolle(7)).isSameAs(rolle);
    }

    @Test
    void roleThrowsNotFoundWhenMissing() {
        when(rolleRepository.findById(7)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.rolle(7))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
