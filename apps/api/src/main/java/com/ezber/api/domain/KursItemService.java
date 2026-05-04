package com.ezber.api.domain;

import com.ezber.api.domain.dto.KursItemRequest;
import com.ezber.api.domain.dto.KursItemResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KursItemService {
    private final KursItemRepository repository;
    private final DomainLookupService lookup;

    public KursItemService(KursItemRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<KursItemResponse> findAll(Integer kursId) {
        var items = kursId == null ? repository.findAll() : repository.findByKursId(kursId);
        return items.stream().map(DomainMapper::toResponse).toList();
    }

    public KursItemResponse findById(Integer id) {
        return DomainMapper.toResponse(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    @Transactional
    public KursItemResponse create(KursItemRequest request) {
        return DomainMapper.toResponse(repository.save(new KursItemEntity(request.name().trim(), request.state(), lookup.kurs(request.kursId()))));
    }

    @Transactional
    public KursItemResponse update(Integer id, KursItemRequest request) {
        var item = repository.findById(id).orElseThrow(() -> notFound(id));
        item.update(request.name().trim(), request.state(), lookup.kurs(request.kursId()));
        return DomainMapper.toResponse(item);
    }

    public void delete(Integer id) {
        repository.delete(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    private ResponseStatusException notFound(Integer id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "KursItem " + id + " wurde nicht gefunden");
    }
}
