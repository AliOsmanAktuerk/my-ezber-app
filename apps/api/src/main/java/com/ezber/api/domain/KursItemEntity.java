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
@Table(name = "kurs_item")
public class KursItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean state;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kurse_id", nullable = false)
    private KursEntity kurs;

    protected KursItemEntity() {
    }

    public KursItemEntity(String name, boolean state, KursEntity kurs) {
        this.name = name;
        this.state = state;
        this.kurs = kurs;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isState() {
        return state;
    }

    public KursEntity getKurs() {
        return kurs;
    }

    public void update(String name, boolean state, KursEntity kurs) {
        this.name = name;
        this.state = state;
        this.kurs = kurs;
    }
}
