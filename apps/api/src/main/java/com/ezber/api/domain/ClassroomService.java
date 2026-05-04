package com.ezber.api.domain;

import com.ezber.api.domain.dto.ClassroomRequest;
import com.ezber.api.domain.dto.ClassroomResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassroomService {
    private final ClassroomRepository repository;
    private final DomainLookupService lookup;

    public ClassroomService(ClassroomRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<ClassroomResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public ClassroomResponse findById(Integer id) {
        return DomainMapper.toResponse(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    @Transactional
    public ClassroomResponse create(ClassroomRequest request) {
        return DomainMapper.toResponse(repository.save(new ClassroomEntity(
            lookup.account(request.accountId()),
            lookup.room(request.roomId()),
            lookup.kurs(request.kursId())
        )));
    }

    @Transactional
    public ClassroomResponse update(Integer id, ClassroomRequest request) {
        var classroom = repository.findById(id).orElseThrow(() -> notFound(id));
        classroom.update(lookup.account(request.accountId()), lookup.room(request.roomId()), lookup.kurs(request.kursId()));
        return DomainMapper.toResponse(classroom);
    }

    public void delete(Integer id) {
        repository.delete(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    private ResponseStatusException notFound(Integer id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Classroom " + id + " wurde nicht gefunden");
    }
}
