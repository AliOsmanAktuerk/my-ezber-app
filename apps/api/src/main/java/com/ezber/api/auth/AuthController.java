package com.ezber.api.auth;

import com.ezber.api.auth.dto.AuthResponse;
import com.ezber.api.auth.dto.CurrentUserResponse;
import com.ezber.api.auth.dto.EmailRequest;
import com.ezber.api.auth.dto.GoogleLoginRequest;
import com.ezber.api.auth.dto.LoginRequest;
import com.ezber.api.auth.dto.MessageResponse;
import com.ezber.api.auth.dto.PasswordResetRequest;
import com.ezber.api.auth.dto.RegisterRequest;
import com.ezber.api.auth.dto.TokenRequest;
import com.ezber.api.user.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody TokenRequest request) {
        return authService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(@Valid @RequestBody EmailRequest request) {
        return authService.resendVerification(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody EmailRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        return authService.resetPassword(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new CurrentUserResponse(
            user.getId(),
            user.getAccountHash(),
            user.getEmail(),
            user.getName(),
            user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
