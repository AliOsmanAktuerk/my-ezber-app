package com.ezber.api.user;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, length = 36)
    private String accountHash;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(length = 64)
    private String emailVerificationTokenHash;

    private Instant emailVerificationTokenExpiresAt;

    @Column(length = 64)
    private String passwordResetTokenHash;

    private Instant passwordResetTokenExpiresAt;

    protected AppUser() {
    }

    public AppUser(String name, String email, String password, Set<Role> roles) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }

    @PrePersist
    void beforeCreate() {
        assignAccountHashIfMissing();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAccountHash() {
        return accountHash;
    }

    public void assignAccountHashIfMissing() {
        if (accountHash == null || accountHash.isBlank()) {
            accountHash = UUID.randomUUID().toString();
        }
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void markEmailVerified() {
        emailVerified = true;
        clearEmailVerificationToken();
    }

    public void markEmailVerifiedForTrustedProvider() {
        emailVerified = true;
    }

    public String getEmailVerificationTokenHash() {
        return emailVerificationTokenHash;
    }

    public Instant getEmailVerificationTokenExpiresAt() {
        return emailVerificationTokenExpiresAt;
    }

    public void setEmailVerificationToken(String tokenHash, Instant expiresAt) {
        emailVerificationTokenHash = tokenHash;
        emailVerificationTokenExpiresAt = expiresAt;
    }

    public void clearEmailVerificationToken() {
        emailVerificationTokenHash = null;
        emailVerificationTokenExpiresAt = null;
    }

    public String getPasswordResetTokenHash() {
        return passwordResetTokenHash;
    }

    public Instant getPasswordResetTokenExpiresAt() {
        return passwordResetTokenExpiresAt;
    }

    public void setPasswordResetToken(String tokenHash, Instant expiresAt) {
        passwordResetTokenHash = tokenHash;
        passwordResetTokenExpiresAt = expiresAt;
    }

    public void clearPasswordResetToken() {
        passwordResetTokenHash = null;
        passwordResetTokenExpiresAt = null;
    }

    public void changePassword(String password) {
        this.password = password;
        clearPasswordResetToken();
    }
}
