package com.ezber.api.domain;

import com.ezber.api.domain.dto.BerechtigungRequest;
import com.ezber.api.domain.dto.BerechtigungResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BerechtigungService {
    private final BerechtigungRepository repository;
    private final DomainLookupService lookup;

    public BerechtigungService(BerechtigungRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<BerechtigungResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public BerechtigungResponse findById(Integer id) {
        return DomainMapper.toResponse(lookup.berechtigung(id));
    }

    @Transactional
    public BerechtigungResponse create(BerechtigungRequest request) {
        return DomainMapper.toResponse(repository.save(new BerechtigungEntity(request.berechtigung().trim())));
    }

    @Transactional
    public BerechtigungResponse update(Integer id, BerechtigungRequest request) {
        var entity = lookup.berechtigung(id);
        entity.update(request.berechtigung().trim());
        return DomainMapper.toResponse(entity);
    }

    public void delete(Integer id) {
        repository.delete(lookup.berechtigung(id));
    }
}
