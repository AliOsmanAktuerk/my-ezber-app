package com.ezber.api.domain;

import com.ezber.api.domain.dto.RolleRequest;
import com.ezber.api.domain.dto.RolleResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
public class RolleController {
    private final RolleService service;

    public RolleController(RolleService service) {
        this.service = service;
    }

    @GetMapping
    public List<RolleResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public RolleResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RolleResponse create(@Valid @RequestBody RolleRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public RolleResponse update(@PathVariable Integer id, @Valid @RequestBody RolleRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
