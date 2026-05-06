package com.ezber.api.domain;

import com.ezber.api.domain.dto.ClassroomAccountResponse;
import com.ezber.api.domain.dto.ClassroomInviteRequest;
import com.ezber.api.domain.dto.ClassroomRequest;
import com.ezber.api.domain.dto.ClassroomResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {
    private final ClassroomService service;

    public ClassroomController(ClassroomService service) {
        this.service = service;
    }

    @GetMapping
    public List<ClassroomResponse> findAll(Principal principal) {
        return service.findAll(principal.getName());
    }

    @GetMapping("/{id}")
    public ClassroomResponse findById(@PathVariable Integer id, Principal principal) {
        return service.findById(id, principal.getName());
    }

    @GetMapping("/{id}/accounts")
    public List<ClassroomAccountResponse> findAccounts(@PathVariable Integer id, Principal principal) {
        return service.findAccounts(id, principal.getName());
    }

    @PostMapping("/{id}/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public ClassroomResponse invite(
        @PathVariable Integer id,
        @Valid @RequestBody ClassroomInviteRequest request,
        Principal principal
    ) {
        return service.invite(id, request, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassroomResponse create(@Valid @RequestBody ClassroomRequest request, Principal principal) {
        return service.create(request, principal.getName());
    }

    @PutMapping("/{id}")
    public ClassroomResponse update(@PathVariable Integer id, @Valid @RequestBody ClassroomRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
