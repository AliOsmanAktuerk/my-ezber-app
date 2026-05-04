package com.ezber.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ezber.api.auth.GoogleTokenVerifier.GoogleUser;
import com.ezber.api.auth.dto.GoogleLoginRequest;
import com.ezber.api.auth.dto.PasswordResetRequest;
import com.ezber.api.auth.dto.RegisterRequest;
import com.ezber.api.domain.AccountEntity;
import com.ezber.api.domain.AccountRepository;
import com.ezber.api.domain.RolleEntity;
import com.ezber.api.domain.RolleRepository;
import com.ezber.api.security.AccountDetailsService;
import com.ezber.api.security.JwtService;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RolleRepository rolleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AccountDetailsService accountDetailsService;
    @Mock
    private JwtService jwtService;
    @Mock
    private GoogleTokenVerifier googleTokenVerifier;
    @Mock
    private TokenService tokenService;
    @Mock
    private AuthMailService authMailService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(
            accountRepository,
            rolleRepository,
            passwordEncoder,
            authenticationManager,
            accountDetailsService,
            jwtService,
            googleTokenVerifier,
            tokenService,
            authMailService,
            "http://localhost:3000"
        );
    }

    @Test
    void registerCreatesUnverifiedAccountAndSendsVerificationMail() {
        var userRole = new RolleEntity("USER");
        when(accountRepository.existsByEmail("ada@example.com")).thenReturn(false);
        when(rolleRepository.findByNameIgnoreCase("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(tokenService.createToken()).thenReturn("email-token");
        when(tokenService.hash("email-token")).thenReturn("email-token-hash");
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> {
            var account = (AccountEntity) invocation.getArgument(0);
            account.assignHashIfMissing();
            return account;
        });

        var response = service.register(new RegisterRequest(" Ada Lovelace ", "ADA@Example.COM", "password123"));

        var accountCaptor = ArgumentCaptor.forClass(AccountEntity.class);
        verify(accountRepository).save(accountCaptor.capture());
        var account = accountCaptor.getValue();
        assertThat(response.token()).isEmpty();
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.name()).isEqualTo("Ada Lovelace");
        assertThat(account.isEmailVerified()).isFalse();
        assertThat(account.getEmailVerificationTokenHash()).isEqualTo("email-token-hash");
        verify(authMailService).sendEmailVerification(
            "ada@example.com",
            "Ada Lovelace",
            "http://localhost:3000/verify-email?token=email-token"
        );
    }

    @Test
    void googleLoginCreatesAccountAndReturnsJwt() {
        var userRole = new RolleEntity("USER");
        var userDetails = User.withUsername("ada@example.com")
            .password("hashed-google-password")
            .authorities("ROLE_USER")
            .build();

        when(googleTokenVerifier.verify("google-id-token"))
            .thenReturn(new GoogleUser(" Ada Lovelace ", "ADA@Example.COM"));
        when(accountRepository.findByEmail("ada@example.com")).thenReturn(Optional.empty());
        when(rolleRepository.findByNameIgnoreCase("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-google-password");
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> {
            var account = (AccountEntity) invocation.getArgument(0);
            account.assignHashIfMissing();
            return account;
        });
        when(accountDetailsService.loadUserByUsername("ada@example.com")).thenReturn(userDetails);
        when(jwtService.createToken(userDetails)).thenReturn("local-jwt");

        var response = service.googleLogin(new GoogleLoginRequest("google-id-token"));

        assertThat(response.token()).isEqualTo("local-jwt");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.name()).isEqualTo("Ada Lovelace");
        assertThat(response.accountHash()).isNotBlank();
        verify(accountRepository).save(any(AccountEntity.class));
    }

    @Test
    void googleLoginReusesExistingAccount() {
        var account = new AccountEntity("existing@example.com", "Existing User", "hash", new RolleEntity("USER"));
        account.assignHashIfMissing();
        var userDetails = User.withUsername("existing@example.com")
            .password("hash")
            .authorities("ROLE_USER")
            .build();

        when(googleTokenVerifier.verify("google-id-token"))
            .thenReturn(new GoogleUser("Existing User", "existing@example.com"));
        when(accountRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(account));
        when(accountDetailsService.loadUserByUsername("existing@example.com")).thenReturn(userDetails);
        when(jwtService.createToken(userDetails)).thenReturn("local-jwt");

        var response = service.googleLogin(new GoogleLoginRequest("google-id-token"));

        assertThat(response.token()).isEqualTo("local-jwt");
        assertThat(response.email()).isEqualTo("existing@example.com");
        assertThat(response.name()).isEqualTo("Existing User");
    }

    @Test
    void resetPasswordUpdatesPasswordAndClearsToken() {
        var account = new AccountEntity("existing@example.com", "Existing User", "old-hash", new RolleEntity("USER"));
        account.setPasswordResetToken("reset-token-hash", Instant.now().plusSeconds(60));

        when(tokenService.hash("reset-token")).thenReturn("reset-token-hash");
        when(accountRepository.findByPasswordResetTokenHash("reset-token-hash")).thenReturn(Optional.of(account));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        var response = service.resetPassword(new PasswordResetRequest("reset-token", "new-password"));

        assertThat(response.message()).isEqualTo("Passwort wurde aktualisiert");
        assertThat(account.getPassword()).isEqualTo("new-hash");
        assertThat(account.getPasswordResetTokenHash()).isNull();
    }
}
