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
@Table(name = "account_match")
public class AccountMatchEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private MatchEntity match;

    protected AccountMatchEntity() {
    }

    public AccountMatchEntity(AccountEntity account, MatchEntity match) {
        this.account = account;
        this.match = match;
    }

    public Integer getId() {
        return id;
    }

    public AccountEntity getAccount() {
        return account;
    }

    public MatchEntity getMatch() {
        return match;
    }
}
