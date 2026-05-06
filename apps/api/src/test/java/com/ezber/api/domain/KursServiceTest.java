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
class KursServiceTest {
    @Mock
    private KursRepository repository;

    @Mock
    private DomainLookupService lookup;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private KursService service;

    @Test
    void findAllReturnsVisibleCoursesForCurrentAccount() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        var publicCourse = new KursEntity(true, "Public", "Open", owner);
        var privateCourse = new KursEntity(false, "Private", "Mine", owner);
        when(repository.findVisibleForAccount("owner@example.com")).thenReturn(List.of(publicCourse, privateCourse));

        var responses = service.findAll("owner@example.com");

        assertThat(responses).extracting("name").containsExactly("Public", "Private");
        verify(repository).findVisibleForAccount("owner@example.com");
    }

    @Test
    void findByIdRejectsPrivateCourseForOtherAccount() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        when(lookup.kurs(5)).thenReturn(new KursEntity(false, "Private", "Mine", owner));

        assertThatThrownBy(() -> service.findById(5, "other@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void findByIdAllowsPublicCourseForOtherAccount() {
        var owner = new AccountEntity("owner@example.com", "Owner", "password123", new RolleEntity("USER"));
        when(lookup.kurs(5)).thenReturn(new KursEntity(true, "Public", "Open", owner));

        var response = service.findById(5, "other@example.com");

        assertThat(response.name()).isEqualTo("Public");
    }
}
