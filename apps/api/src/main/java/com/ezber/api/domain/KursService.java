package com.ezber.api.domain;

import com.ezber.api.domain.dto.KursRequest;
import com.ezber.api.domain.dto.KursResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KursService {
    private final KursRepository repository;
    private final DomainLookupService lookup;
    private final AccountRepository accountRepository;

    public KursService(KursRepository repository, DomainLookupService lookup, AccountRepository accountRepository) {
        this.repository = repository;
        this.lookup = lookup;
        this.accountRepository = accountRepository;
    }

    public List<KursResponse> findAll(String accountEmail) {
        return repository.findVisibleForAccount(accountEmail).stream().map(DomainMapper::toResponse).toList();
    }

    public KursResponse findById(Integer id, String accountEmail) {
        var kurs = lookup.kurs(id);

        if (!kurs.isPublicCourse() && !kurs.getAccount().getEmail().equalsIgnoreCase(accountEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kurs not found");
        }

        return DomainMapper.toResponse(kurs);
    }

    @Transactional
    public KursResponse create(KursRequest request, String accountEmail) {
        var account = accountRepository.findByEmail(accountEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        return DomainMapper.toResponse(repository.save(new KursEntity(
            request.publicCourse(),
            request.name().trim(),
            request.description().trim(),
            account
        )));
    }

    @Transactional
    public KursResponse update(Integer id, KursRequest request) {
        var kurs = lookup.kurs(id);
        kurs.update(request.publicCourse(), request.name().trim(), request.description().trim());
        return DomainMapper.toResponse(kurs);
    }

    public void delete(Integer id) {
        repository.delete(lookup.kurs(id));
    }
}
