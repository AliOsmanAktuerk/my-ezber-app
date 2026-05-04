package com.ezber.api.auth;

import com.ezber.api.auth.GoogleTokenVerifier.GoogleUser;
import com.ezber.api.auth.dto.AuthResponse;
import com.ezber.api.auth.dto.EmailRequest;
import com.ezber.api.auth.dto.GoogleLoginRequest;
import com.ezber.api.auth.dto.LoginRequest;
import com.ezber.api.auth.dto.MessageResponse;
import com.ezber.api.auth.dto.PasswordResetRequest;
import com.ezber.api.auth.dto.RegisterRequest;
import com.ezber.api.auth.dto.TokenRequest;
import com.ezber.api.domain.AccountEntity;
import com.ezber.api.domain.AccountRepository;
import com.ezber.api.domain.RolleEntity;
import com.ezber.api.domain.RolleRepository;
import com.ezber.api.security.AccountDetailsService;
import com.ezber.api.security.JwtService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final String DEFAULT_ROLE_NAME = "USER";

    private final AccountRepository accountRepository;
    private final RolleRepository rolleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AccountDetailsService accountDetailsService;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final TokenService tokenService;
    private final AuthMailService authMailService;
    private final String frontendBaseUrl;

    public AuthService(
        AccountRepository accountRepository,
        RolleRepository rolleRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        AccountDetailsService accountDetailsService,
        JwtService jwtService,
        GoogleTokenVerifier googleTokenVerifier,
        TokenService tokenService,
        AuthMailService authMailService,
        @Value("${app.frontend.base-url}") String frontendBaseUrl
    ) {
        this.accountRepository = accountRepository;
        this.rolleRepository = rolleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.accountDetailsService = accountDetailsService;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.tokenService = tokenService;
        this.authMailService = authMailService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        var normalizedEmail = normalizeEmail(request.email());
        var displayName = normalizeDisplayName(request.name());

        if (accountRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail wird bereits verwendet");
        }

        var account = new AccountEntity(
            normalizedEmail,
            displayName,
            passwordEncoder.encode(request.password()),
            defaultRole()
        );
        sendEmailVerification(account);
        accountRepository.save(account);

        return new AuthResponse("", account.getHash(), account.getEmail(), account.getName());
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        var googleUser = googleTokenVerifier.verify(request.credential());
        var normalizedEmail = normalizeEmail(googleUser.email());
        var account = accountRepository.findByEmail(normalizedEmail)
            .orElseGet(() -> createGoogleAccount(googleUser, normalizedEmail));
        account.markEmailVerifiedForTrustedProvider();
        var accountDetails = accountDetailsService.loadUserByUsername(account.getEmail());

        return toAuthResponse(account, jwtService.createToken(accountDetails));
    }

    public AuthResponse login(LoginRequest request) {
        var normalizedEmail = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-Mail oder Passwort ist falsch");
        }

        var account = accountRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ungültige Zugangsdaten"));
        if (!account.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bitte bestätige zuerst deine E-Mail-Adresse");
        }
        var accountDetails = accountDetailsService.loadUserByUsername(account.getEmail());

        return toAuthResponse(account, jwtService.createToken(accountDetails));
    }

    @Transactional
    public AuthResponse verifyEmail(TokenRequest request) {
        var account = accountRepository.findByEmailVerificationTokenHash(tokenService.hash(request.token()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bestätigungslink ist ungültig"));

        if (account.getEmailVerificationTokenExpiresAt() == null || account.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bestätigungslink ist abgelaufen");
        }

        account.markEmailVerified();
        var accountDetails = accountDetailsService.loadUserByUsername(account.getEmail());
        return toAuthResponse(account, jwtService.createToken(accountDetails));
    }

    @Transactional
    public MessageResponse resendVerification(EmailRequest request) {
        accountRepository.findByEmail(normalizeEmail(request.email()))
            .filter(account -> !account.isEmailVerified())
            .ifPresent(this::sendEmailVerification);

        return new MessageResponse("Wenn die E-Mail existiert und noch nicht bestätigt ist, wurde ein neuer Link versendet");
    }

    @Transactional
    public MessageResponse forgotPassword(EmailRequest request) {
        accountRepository.findByEmail(normalizeEmail(request.email()))
            .filter(AccountEntity::isEmailVerified)
            .ifPresent(this::sendPasswordReset);

        return new MessageResponse("Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen versendet");
    }

    @Transactional
    public MessageResponse resetPassword(PasswordResetRequest request) {
        var account = accountRepository.findByPasswordResetTokenHash(tokenService.hash(request.token()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset-Link ist ungültig"));

        if (account.getPasswordResetTokenExpiresAt() == null || account.getPasswordResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset-Link ist abgelaufen");
        }

        account.changePassword(passwordEncoder.encode(request.password()));
        return new MessageResponse("Passwort wurde aktualisiert");
    }

    private AuthResponse toAuthResponse(AccountEntity account, String token) {
        return new AuthResponse(token, account.getHash(), account.getEmail(), account.getName());
    }

    private AccountEntity createGoogleAccount(GoogleUser googleUser, String normalizedEmail) {
        var displayName = googleUser.name() == null || googleUser.name().isBlank()
            ? normalizedEmail.substring(0, normalizedEmail.indexOf('@'))
            : normalizeDisplayName(googleUser.name());
        var account = new AccountEntity(
            normalizedEmail,
            displayName,
            passwordEncoder.encode(UUID.randomUUID().toString()),
            defaultRole()
        );
        account.markEmailVerifiedForTrustedProvider();

        return accountRepository.save(account);
    }

    private RolleEntity defaultRole() {
        return rolleRepository.findByNameIgnoreCase(DEFAULT_ROLE_NAME)
            .orElseGet(() -> rolleRepository.save(new RolleEntity(DEFAULT_ROLE_NAME)));
    }

    private String normalizeDisplayName(String name) {
        return name.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void sendEmailVerification(AccountEntity account) {
        var token = tokenService.createToken();
        account.setEmailVerificationToken(tokenService.hash(token), Instant.now().plusSeconds(86400));
        authMailService.sendEmailVerification(
            account.getEmail(),
            account.getName(),
            frontendBaseUrl + "/verify-email?token=" + token
        );
    }

    private void sendPasswordReset(AccountEntity account) {
        var token = tokenService.createToken();
        account.setPasswordResetToken(tokenService.hash(token), Instant.now().plusSeconds(3600));
        authMailService.sendPasswordReset(
            account.getEmail(),
            account.getName(),
            frontendBaseUrl + "/reset-password?token=" + token
        );
    }
}
