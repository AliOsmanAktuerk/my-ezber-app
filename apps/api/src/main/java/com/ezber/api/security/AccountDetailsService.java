package com.ezber.api.security;

import com.ezber.api.domain.AccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountDetailsService implements UserDetailsService {
    private final AccountRepository accountRepository;

    public AccountDetailsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var account = accountRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Account not found"));

        return User.withUsername(account.getEmail())
            .password(account.getPassword())
            .authorities("ROLE_" + account.getRolle().getName().toUpperCase())
            .build();
    }
}
