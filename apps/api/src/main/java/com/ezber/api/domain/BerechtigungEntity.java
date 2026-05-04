package com.ezber.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "berechtigungen")
public class BerechtigungEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String berechtigung;

    protected BerechtigungEntity() {
    }

    public BerechtigungEntity(String berechtigung) {
        this.berechtigung = berechtigung;
    }

    public Integer getId() {
        return id;
    }

    public String getBerechtigung() {
        return berechtigung;
    }

    public void update(String berechtigung) {
        this.berechtigung = berechtigung;
    }
}
