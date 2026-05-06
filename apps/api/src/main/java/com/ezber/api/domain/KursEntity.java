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

@Entity
@Table(name = "kurse")
public class KursEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "public", nullable = false)
    private boolean publicCourse;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    protected KursEntity() {
    }

    public KursEntity(boolean publicCourse, String name, String description, AccountEntity account) {
        this.publicCourse = publicCourse;
        this.name = name;
        this.description = description;
        this.account = account;
    }

    public Integer getId() {
        return id;
    }

    public boolean isPublicCourse() {
        return publicCourse;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public AccountEntity getAccount() {
        return account;
    }

    public void update(boolean publicCourse, String name, String description) {
        this.publicCourse = publicCourse;
        this.name = name;
        this.description = description;
    }
}
