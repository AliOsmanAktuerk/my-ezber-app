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
@Table(name = "Rolle_Berechtigungen")
public class RolleBerechtigungEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Rolle_id", nullable = false)
    private RolleEntity rolle;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Berechtigungen_id", nullable = false)
    private BerechtigungEntity berechtigung;

    protected RolleBerechtigungEntity() {
    }

    public RolleBerechtigungEntity(RolleEntity rolle, BerechtigungEntity berechtigung) {
        this.rolle = rolle;
        this.berechtigung = berechtigung;
    }

    public Integer getId() {
        return id;
    }

    public RolleEntity getRolle() {
        return rolle;
    }

    public BerechtigungEntity getBerechtigung() {
        return berechtigung;
    }
}
