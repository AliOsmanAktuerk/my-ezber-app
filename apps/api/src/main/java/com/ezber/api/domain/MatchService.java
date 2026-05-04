package com.ezber.api.domain;

import com.ezber.api.domain.dto.AccountMatchRequest;
import com.ezber.api.domain.dto.AccountMatchResponse;
import com.ezber.api.domain.dto.MatchRequest;
import com.ezber.api.domain.dto.MatchResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MatchService {
    private final MatchRepository matchRepository;
    private final AccountMatchRepository accountMatchRepository;
    private final DomainLookupService lookup;

    public MatchService(MatchRepository matchRepository, AccountMatchRepository accountMatchRepository, DomainLookupService lookup) {
        this.matchRepository = matchRepository;
        this.accountMatchRepository = accountMatchRepository;
        this.lookup = lookup;
    }

    public List<MatchResponse> findAll() {
        return matchRepository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    public MatchResponse findById(Integer id) {
        return DomainMapper.toResponse(lookup.match(id));
    }

    @Transactional
    public MatchResponse create(MatchRequest request) {
        return DomainMapper.toResponse(matchRepository.save(new MatchEntity(lookup.account(request.accountId()))));
    }

    public void delete(Integer id) {
        matchRepository.delete(lookup.match(id));
    }

    public List<AccountMatchResponse> findLinks() {
        return accountMatchRepository.findAll().stream().map(DomainMapper::toResponse).toList();
    }

    @Transactional
    public AccountMatchResponse createLink(AccountMatchRequest request) {
        return DomainMapper.toResponse(accountMatchRepository.save(new AccountMatchEntity(
            lookup.account(request.accountId()),
            lookup.match(request.matchId())
        )));
    }
}
