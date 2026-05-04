package com.ezber.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "Account")
public class AccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String hash = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rolle", nullable = false)
    private RolleEntity rolle;

    protected AccountEntity() {
    }

    public AccountEntity(String email, String password, RolleEntity rolle) {
        this.email = email;
        this.password = password;
        this.rolle = rolle;
    }

    public Integer getId() {
        return id;
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

    public RolleEntity getRolle() {
        return rolle;
    }

    public void update(String email, String password, RolleEntity rolle) {
        this.email = email;
        this.password = password;
        this.rolle = rolle;
    }
}
