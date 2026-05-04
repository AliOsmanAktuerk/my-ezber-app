package com.ezber.api.domain;

import com.ezber.api.domain.dto.RolleRequest;
import com.ezber.api.domain.dto.RolleResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RolleService {
    private final RolleRepository repository;
    private final DomainLookupService lookup;

    public RolleService(RolleRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<RolleResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public RolleResponse findById(Integer id) {
        return DomainMapper.toResponse(lookup.rolle(id));
    }

    @Transactional
    public RolleResponse create(RolleRequest request) {
        return DomainMapper.toResponse(repository.save(new RolleEntity(request.name().trim())));
    }

    @Transactional
    public RolleResponse update(Integer id, RolleRequest request) {
        var rolle = lookup.rolle(id);
        rolle.update(request.name().trim());
        return DomainMapper.toResponse(rolle);
    }

    public void delete(Integer id) {
        repository.delete(lookup.rolle(id));
    }
}
