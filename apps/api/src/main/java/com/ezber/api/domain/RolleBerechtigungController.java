package com.ezber.api.domain;

import com.ezber.api.domain.dto.RolleBerechtigungRequest;
import com.ezber.api.domain.dto.RolleBerechtigungResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/role-permissions")
public class RolleBerechtigungController {
    private final RolleBerechtigungService service;

    public RolleBerechtigungController(RolleBerechtigungService service) {
        this.service = service;
    }

    @GetMapping
    public List<RolleBerechtigungResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RolleBerechtigungResponse create(@Valid @RequestBody RolleBerechtigungRequest request) {
        return service.create(request);
    }
}
