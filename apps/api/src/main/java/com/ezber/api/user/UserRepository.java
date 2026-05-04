package com.ezber.api.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByEmailVerificationTokenHash(String tokenHash);

    Optional<AppUser> findByPasswordResetTokenHash(String tokenHash);

    boolean existsByEmail(String email);

    boolean existsByRolesContaining(Role role);
}
