package com.ezber.api.domain;

import com.ezber.api.domain.dto.BerechtigungRequest;
import com.ezber.api.domain.dto.BerechtigungResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/permissions")
public class BerechtigungController {
    private final BerechtigungService service;

    public BerechtigungController(BerechtigungService service) {
        this.service = service;
    }

    @GetMapping
    public List<BerechtigungResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public BerechtigungResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BerechtigungResponse create(@Valid @RequestBody BerechtigungRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public BerechtigungResponse update(@PathVariable Integer id, @Valid @RequestBody BerechtigungRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
