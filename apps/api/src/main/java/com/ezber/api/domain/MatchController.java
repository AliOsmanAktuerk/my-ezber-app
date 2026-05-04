package com.ezber.api.domain;

import com.ezber.api.domain.dto.AccountMatchRequest;
import com.ezber.api.domain.dto.AccountMatchResponse;
import com.ezber.api.domain.dto.MatchRequest;
import com.ezber.api.domain.dto.MatchResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final MatchService service;

    public MatchController(MatchService service) {
        this.service = service;
    }

    @GetMapping
    public List<MatchResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public MatchResponse findById(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatchResponse create(@Valid @RequestBody MatchRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/links")
    public List<AccountMatchResponse> findLinks() {
        return service.findLinks();
    }

    @PostMapping("/links")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountMatchResponse createLink(@Valid @RequestBody AccountMatchRequest request) {
        return service.createLink(request);
    }
}
