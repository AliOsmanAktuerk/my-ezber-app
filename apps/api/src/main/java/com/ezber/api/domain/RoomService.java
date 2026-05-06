package com.ezber.api.domain;

import com.ezber.api.domain.dto.RoomRequest;
import com.ezber.api.domain.dto.RoomResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RoomService {
    private final RoomRepository repository;
    private final DomainLookupService lookup;

    public RoomService(RoomRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<RoomResponse> findAll(String ownerEmail) {
        return repository.findByOwnerEmailIgnoreCase(ownerEmail).stream().map(DomainMapper::toResponse).toList();
    }

    public RoomResponse findById(Integer id, String ownerEmail) {
        var room = lookup.room(id);

        if (!room.getOwner().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }

        return DomainMapper.toResponse(room);
    }

    @Transactional
    public RoomResponse create(RoomRequest request) {
        return DomainMapper.toResponse(repository.save(new RoomEntity(lookup.account(request.ownerId()), request.description().trim())));
    }

    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        var room = lookup.room(id);
        room.update(lookup.account(request.ownerId()), request.description().trim());
        return DomainMapper.toResponse(room);
    }

    public void delete(Integer id) {
        repository.delete(lookup.room(id));
    }
}
