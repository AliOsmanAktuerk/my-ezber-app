package com.ezber.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ezber.api.domain.dto.AccountRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock
    private AccountRepository repository;

    @Mock
    private DomainLookupService lookup;

    @InjectMocks
    private AccountService service;

    @Test
    void createNormalizesEmailAndReturnsRoleData() {
        var rolle = new RolleEntity("ADMIN");
        var saved = new AccountEntity("admin@example.com", "password123", rolle);

        when(lookup.rolle(1)).thenReturn(rolle);
        when(repository.save(any(AccountEntity.class))).thenReturn(saved);

        var response = service.create(new AccountRequest("  ADMIN@Example.COM ", "password123", 1));

        assertThat(response.email()).isEqualTo("admin@example.com");
        assertThat(response.hash()).isNotBlank();
        assertThat(response.rolleName()).isEqualTo("ADMIN");
        verify(repository).save(any(AccountEntity.class));
    }

    @Test
    void findAllMapsAccounts() {
        var rolle = new RolleEntity("USER");
        when(repository.findAll()).thenReturn(List.of(new AccountEntity("user@example.com", "password123", rolle)));

        var responses = service.findAll();

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().email()).isEqualTo("user@example.com");
    }
}
