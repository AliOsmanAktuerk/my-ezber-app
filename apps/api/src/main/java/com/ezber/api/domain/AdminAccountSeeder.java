package com.ezber.api.domain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountSeeder implements ApplicationRunner {
    private final AccountRepository accountRepository;
    private final RolleRepository rolleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminAccountSeeder(
        AccountRepository accountRepository,
        RolleRepository rolleRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.admin.email}") String adminEmail,
        @Value("${app.admin.password}") String adminPassword,
        @Value("${app.admin.name}") String adminName
    ) {
        this.accountRepository = accountRepository;
        this.rolleRepository = rolleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var adminRole = rolleRepository.findByNameIgnoreCase("ADMIN")
            .orElseGet(() -> rolleRepository.save(new RolleEntity("ADMIN")));

        if (accountRepository.existsByRolle_NameIgnoreCase("ADMIN")) {
            return;
        }

        var normalizedEmail = adminEmail.trim().toLowerCase();
        if (accountRepository.existsByEmail(normalizedEmail)) {
            return;
        }

        var admin = new AccountEntity(
            normalizedEmail,
            adminName.trim(),
            passwordEncoder.encode(adminPassword),
            adminRole
        );
        admin.markEmailVerifiedForTrustedProvider();
        accountRepository.save(admin);
    }
}
