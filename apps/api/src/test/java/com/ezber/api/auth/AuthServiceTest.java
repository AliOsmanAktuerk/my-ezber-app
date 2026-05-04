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
import com.ezber.api.security.AppUserDetailsService;
import com.ezber.api.security.JwtService;
import com.ezber.api.user.AppUser;
import com.ezber.api.user.Role;
import com.ezber.api.user.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
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
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AppUserDetailsService userDetailsService;
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
            userRepository,
            passwordEncoder,
            authenticationManager,
            userDetailsService,
            jwtService,
            googleTokenVerifier,
            tokenService,
            authMailService,
            "http://localhost:3000"
        );
    }

    @Test
    void registerCreatesUnverifiedUserAndSendsVerificationMail() {
        when(userRepository.existsByEmail("ada@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(tokenService.createToken()).thenReturn("email-token");
        when(tokenService.hash("email-token")).thenReturn("email-token-hash");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            var user = (AppUser) invocation.getArgument(0);
            user.assignAccountHashIfMissing();
            return user;
        });

        var response = service.register(new RegisterRequest(" Ada Lovelace ", "ADA@Example.COM", "password123"));

        var userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());
        var user = userCaptor.getValue();
        assertThat(response.token()).isEmpty();
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.getEmailVerificationTokenHash()).isEqualTo("email-token-hash");
        verify(authMailService).sendEmailVerification(
            "ada@example.com",
            "Ada Lovelace",
            "http://localhost:3000/verify-email?token=email-token"
        );
    }

    @Test
    void googleLoginCreatesLocalUserAndReturnsJwt() {
        var userDetails = User.withUsername("ada@example.com")
            .password("hashed-google-password")
            .authorities("ROLE_USER")
            .build();

        when(googleTokenVerifier.verify("google-id-token"))
            .thenReturn(new GoogleUser(" Ada Lovelace ", "ADA@Example.COM"));
        when(userRepository.findByEmail("ada@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-google-password");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            var user = (AppUser) invocation.getArgument(0);
            user.assignAccountHashIfMissing();
            return user;
        });
        when(userDetailsService.loadUserByUsername("ada@example.com")).thenReturn(userDetails);
        when(jwtService.createToken(userDetails)).thenReturn("local-jwt");

        var response = service.googleLogin(new GoogleLoginRequest("google-id-token"));

        assertThat(response.token()).isEqualTo("local-jwt");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.name()).isEqualTo("Ada Lovelace");
        assertThat(response.accountHash()).isNotBlank();
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void googleLoginReusesExistingUser() {
        var user = new AppUser("Existing User", "existing@example.com", "hash", Set.of(Role.USER));
        user.assignAccountHashIfMissing();
        var userDetails = User.withUsername("existing@example.com")
            .password("hash")
            .authorities("ROLE_USER")
            .build();

        when(googleTokenVerifier.verify("google-id-token"))
            .thenReturn(new GoogleUser("Existing User", "existing@example.com"));
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("existing@example.com")).thenReturn(userDetails);
        when(jwtService.createToken(userDetails)).thenReturn("local-jwt");

        var response = service.googleLogin(new GoogleLoginRequest("google-id-token"));

        assertThat(response.token()).isEqualTo("local-jwt");
        assertThat(response.email()).isEqualTo("existing@example.com");
        assertThat(response.name()).isEqualTo("Existing User");
    }

    @Test
    void resetPasswordUpdatesPasswordAndClearsToken() {
        var user = new AppUser("Existing User", "existing@example.com", "old-hash", Set.of(Role.USER));
        user.setPasswordResetToken("reset-token-hash", Instant.now().plusSeconds(60));

        when(tokenService.hash("reset-token")).thenReturn("reset-token-hash");
        when(userRepository.findByPasswordResetTokenHash("reset-token-hash")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        var response = service.resetPassword(new PasswordResetRequest("reset-token", "new-password"));

        assertThat(response.message()).isEqualTo("Passwort wurde aktualisiert");
        assertThat(user.getPassword()).isEqualTo("new-hash");
        assertThat(user.getPasswordResetTokenHash()).isNull();
    }
}
