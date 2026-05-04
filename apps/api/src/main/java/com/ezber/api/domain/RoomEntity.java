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
@Table(name = "Room")
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_owner_id", nullable = false)
    private AccountEntity owner;

    @Column(nullable = false)
    private String description;

    protected RoomEntity() {
    }

    public RoomEntity(AccountEntity owner, String description) {
        this.owner = owner;
        this.description = description;
    }

    public Integer getId() {
        return id;
    }

    public AccountEntity getOwner() {
        return owner;
    }

    public String getDescription() {
        return description;
    }

    public void update(AccountEntity owner, String description) {
        this.owner = owner;
        this.description = description;
    }
}
