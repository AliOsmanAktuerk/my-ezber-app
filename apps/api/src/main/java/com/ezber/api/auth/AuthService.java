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
import com.ezber.api.security.AppUserDetailsService;
import com.ezber.api.security.JwtService;
import com.ezber.api.user.AppUser;
import com.ezber.api.user.Role;
import com.ezber.api.user.UserRepository;
import java.util.Set;
import java.util.UUID;
import java.time.Instant;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final TokenService tokenService;
    private final AuthMailService authMailService;
    private final String frontendBaseUrl;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        AppUserDetailsService userDetailsService,
        JwtService jwtService,
        GoogleTokenVerifier googleTokenVerifier,
        TokenService tokenService,
        AuthMailService authMailService,
        @Value("${app.frontend.base-url}") String frontendBaseUrl
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.tokenService = tokenService;
        this.authMailService = authMailService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        var normalizedEmail = request.email().trim().toLowerCase();
        var displayName = normalizeDisplayName(request.name());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail wird bereits verwendet");
        }

        var user = new AppUser(
            displayName,
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            Set.of(Role.USER)
        );
        sendEmailVerification(user);
        userRepository.save(user);

        return new AuthResponse("", user.getAccountHash(), user.getEmail(), user.getName());
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        var googleUser = googleTokenVerifier.verify(request.credential());
        var normalizedEmail = googleUser.email().trim().toLowerCase();
        var user = userRepository.findByEmail(normalizedEmail)
            .orElseGet(() -> createGoogleUser(googleUser, normalizedEmail));
        user.markEmailVerifiedForTrustedProvider();
        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        return toAuthResponse(user, jwtService.createToken(userDetails));
    }

    public AuthResponse login(LoginRequest request) {
        var normalizedEmail = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-Mail oder Passwort ist falsch");
        }

        var user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ungültige Zugangsdaten"));
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bitte bestätige zuerst deine E-Mail-Adresse");
        }
        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        return toAuthResponse(user, jwtService.createToken(userDetails));
    }

    @Transactional
    public AuthResponse verifyEmail(TokenRequest request) {
        var user = userRepository.findByEmailVerificationTokenHash(tokenService.hash(request.token()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bestätigungslink ist ungültig"));

        if (user.getEmailVerificationTokenExpiresAt() == null || user.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bestätigungslink ist abgelaufen");
        }

        user.markEmailVerified();
        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return toAuthResponse(user, jwtService.createToken(userDetails));
    }

    @Transactional
    public MessageResponse resendVerification(EmailRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email()))
            .filter(user -> !user.isEmailVerified())
            .ifPresent(this::sendEmailVerification);

        return new MessageResponse("Wenn die E-Mail existiert und noch nicht bestätigt ist, wurde ein neuer Link versendet");
    }

    @Transactional
    public MessageResponse forgotPassword(EmailRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email()))
            .filter(AppUser::isEmailVerified)
            .ifPresent(this::sendPasswordReset);

        return new MessageResponse("Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen versendet");
    }

    @Transactional
    public MessageResponse resetPassword(PasswordResetRequest request) {
        var user = userRepository.findByPasswordResetTokenHash(tokenService.hash(request.token()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset-Link ist ungültig"));

        if (user.getPasswordResetTokenExpiresAt() == null || user.getPasswordResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset-Link ist abgelaufen");
        }

        user.changePassword(passwordEncoder.encode(request.password()));
        return new MessageResponse("Passwort wurde aktualisiert");
    }

    private AuthResponse toAuthResponse(AppUser user, String token) {
        return new AuthResponse(token, user.getAccountHash(), user.getEmail(), user.getName());
    }

    private AppUser createGoogleUser(GoogleUser googleUser, String normalizedEmail) {
        var displayName = googleUser.name() == null || googleUser.name().isBlank()
            ? normalizedEmail.substring(0, normalizedEmail.indexOf('@'))
            : normalizeDisplayName(googleUser.name());
        var user = new AppUser(
            displayName,
            normalizedEmail,
            passwordEncoder.encode(UUID.randomUUID().toString()),
            Set.of(Role.USER)
        );
        user.markEmailVerifiedForTrustedProvider();

        return userRepository.save(user);
    }

    private String normalizeDisplayName(String name) {
        return name.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void sendEmailVerification(AppUser user) {
        var token = tokenService.createToken();
        user.setEmailVerificationToken(tokenService.hash(token), Instant.now().plusSeconds(86400));
        authMailService.sendEmailVerification(
            user.getEmail(),
            user.getName(),
            frontendBaseUrl + "/verify-email?token=" + token
        );
    }

    private void sendPasswordReset(AppUser user) {
        var token = tokenService.createToken();
        user.setPasswordResetToken(tokenService.hash(token), Instant.now().plusSeconds(3600));
        authMailService.sendPasswordReset(
            user.getEmail(),
            user.getName(),
            frontendBaseUrl + "/reset-password?token=" + token
        );
    }
}
