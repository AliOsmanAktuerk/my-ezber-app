package com.ezber.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "`match`")
public class MatchEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Account_id", nullable = false)
    private AccountEntity account;

    protected MatchEntity() {
    }

    public MatchEntity(AccountEntity account) {
        this.account = account;
    }

    public Integer getId() {
        return id;
    }

    public AccountEntity getAccount() {
        return account;
    }
}
