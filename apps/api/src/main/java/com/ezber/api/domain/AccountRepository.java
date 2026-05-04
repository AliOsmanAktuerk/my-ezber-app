package com.ezber.api.domain;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<AccountEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = "rolle")
    List<AccountEntity> findAll();

    @Override
    @EntityGraph(attributePaths = "rolle")
    Optional<AccountEntity> findById(Integer id);

    @EntityGraph(attributePaths = "rolle")
    Optional<AccountEntity> findByEmail(String email);

    Optional<AccountEntity> findByEmailVerificationTokenHash(String tokenHash);

    Optional<AccountEntity> findByPasswordResetTokenHash(String tokenHash);

    boolean existsByEmail(String email);

    boolean existsByRolle_NameIgnoreCase(String roleName);
}
