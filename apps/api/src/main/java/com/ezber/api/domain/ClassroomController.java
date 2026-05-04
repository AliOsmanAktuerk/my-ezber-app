package com.ezber.api.domain;

import com.ezber.api.domain.dto.ClassroomRequest;
import com.ezber.api.domain.dto.ClassroomResponse;
import jakarta.validation.Valid;
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
    public List<ClassroomResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ClassroomResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassroomResponse create(@Valid @RequestBody ClassroomRequest request) {
        return service.create(request);
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
