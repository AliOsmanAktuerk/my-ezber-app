package com.ezber.api.user;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserAccountHashBackfill implements ApplicationRunner {
    private final UserRepository userRepository;

    public UserAccountHashBackfill(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findAll().forEach(AppUser::assignAccountHashIfMissing);
    }
}
