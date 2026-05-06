package com.ezber.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "classroom")
public class ClassroomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private AccountEntity account;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomEntity room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kurse_id", nullable = false)
    private KursEntity kurs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassroomStatus status = ClassroomStatus.JOINED;

    protected ClassroomEntity() {
    }

    public ClassroomEntity(AccountEntity account, RoomEntity room, KursEntity kurs) {
        this(account, room, kurs, ClassroomStatus.JOINED);
    }

    public ClassroomEntity(AccountEntity account, RoomEntity room, KursEntity kurs, ClassroomStatus status) {
        this.account = account;
        this.room = room;
        this.kurs = kurs;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public AccountEntity getAccount() {
        return account;
    }

    public RoomEntity getRoom() {
        return room;
    }

    public KursEntity getKurs() {
        return kurs;
    }

    public ClassroomStatus getStatus() {
        return status;
    }

    public void setStatus(ClassroomStatus status) {
        this.status = status;
    }

    public void update(AccountEntity account, RoomEntity room, KursEntity kurs) {
        this.account = account;
        this.room = room;
        this.kurs = kurs;
    }
}
