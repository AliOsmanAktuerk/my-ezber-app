package com.ezber.api.domain;

import com.ezber.api.domain.dto.AccountRequest;
import com.ezber.api.domain.dto.AccountResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final AccountRepository repository;
    private final DomainLookupService lookup;

    public AccountService(AccountRepository repository, DomainLookupService lookup) {
        this.repository = repository;
        this.lookup = lookup;
    }

    public List<AccountResponse> findAll() {
        return repository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public AccountResponse findById(Integer id) {
        return DomainMapper.toResponse(lookup.account(id));
    }

    @Transactional
    public AccountResponse create(AccountRequest request) {
        var rolle = lookup.rolle(request.rolleId());
        return DomainMapper.toResponse(repository.save(new AccountEntity(normalizeEmail(request.email()), request.password(), rolle)));
    }

    @Transactional
    public AccountResponse update(Integer id, AccountRequest request) {
        var account = lookup.account(id);
        var rolle = lookup.rolle(request.rolleId());
        account.update(normalizeEmail(request.email()), request.password(), rolle);
        return DomainMapper.toResponse(account);
    }

    public void delete(Integer id) {
        repository.delete(lookup.account(id));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
