package com.ezber.api.domain;

import com.ezber.api.domain.dto.RolleBerechtigungRequest;
import com.ezber.api.domain.dto.RolleBerechtigungResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RolleBerechtigungService {
    private final RolleBerechtigungRepository repository;
    private final DomainLookupService lookup;

    public RolleBerechtigungService(RolleBerechtigungRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<RolleBerechtigungResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    @Transactional
    public RolleBerechtigungResponse create(RolleBerechtigungRequest request) {
        return DomainMapper.toResponse(repository.save(new RolleBerechtigungEntity(
            lookup.rolle(request.rolleId()),
            lookup.berechtigung(request.berechtigungId())
        )));
    }
}
