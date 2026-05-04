package com.ezber.api.domain;

import com.ezber.api.domain.dto.KursItemRequest;
import com.ezber.api.domain.dto.KursItemResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/course-items")
public class KursItemController {
    private final KursItemService service;

    public KursItemController(KursItemService service) {
        this.service = service;
    }

    @GetMapping
    public List<KursItemResponse> findAll(@RequestParam(required = false) Integer kursId) {
        return service.findAll(kursId);
    }

    @GetMapping("/{id}")
    public KursItemResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KursItemResponse create(@Valid @RequestBody KursItemRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public KursItemResponse update(@PathVariable Integer id, @Valid @RequestBody KursItemRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
