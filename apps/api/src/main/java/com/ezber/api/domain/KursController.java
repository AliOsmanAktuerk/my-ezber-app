package com.ezber.api.domain;

import com.ezber.api.domain.dto.KursRequest;
import com.ezber.api.domain.dto.KursResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class KursController {
    private final KursService service;

    public KursController(KursService service) {
        this.service = service;
    }

    @GetMapping
    public List<KursResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public KursResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KursResponse create(@Valid @RequestBody KursRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public KursResponse update(@PathVariable Integer id, @Valid @RequestBody KursRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
