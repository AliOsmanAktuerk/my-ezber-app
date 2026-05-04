package com.ezber.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account")
public class AccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String hash = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rolle", nullable = false)
    private RolleEntity rolle;

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

    protected AccountEntity() {
    }

    public AccountEntity(String email, String password, RolleEntity rolle) {
        this(email, email.substring(0, email.indexOf('@')), password, rolle);
    }

    public AccountEntity(String email, String name, String password, RolleEntity rolle) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.rolle = rolle;
    }

    @PrePersist
    void beforeCreate() {
        assignHashIfMissing();
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getHash() {
        return hash;
    }

    public void assignHashIfMissing() {
        if (hash == null || hash.isBlank()) {
            hash = UUID.randomUUID().toString();
        }
    }

    public RolleEntity getRolle() {
        return rolle;
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

    public void update(String email, String password, RolleEntity rolle) {
        this.name = email.substring(0, email.indexOf('@'));
        this.email = email;
        this.password = password;
        this.rolle = rolle;
    }
}
