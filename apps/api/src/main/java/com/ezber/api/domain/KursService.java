package com.ezber.api.domain;

import com.ezber.api.domain.dto.KursRequest;
import com.ezber.api.domain.dto.KursResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KursService {
    private final KursRepository repository;
    private final DomainLookupService lookup;

    public KursService(KursRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<KursResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public KursResponse findById(Integer id) {
        return DomainMapper.toResponse(lookup.kurs(id));
    }

    @Transactional
    public KursResponse create(KursRequest request) {
        return DomainMapper.toResponse(repository.save(new KursEntity(request.publicCourse(), request.name().trim(), request.description().trim())));
    }

    @Transactional
    public KursResponse update(Integer id, KursRequest request) {
        var kurs = lookup.kurs(id);
        kurs.update(request.publicCourse(), request.name().trim(), request.description().trim());
        return DomainMapper.toResponse(kurs);
    }

    public void delete(Integer id) {
        repository.delete(lookup.kurs(id));
    }
}
