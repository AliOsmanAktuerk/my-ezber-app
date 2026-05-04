package com.ezber.api.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolleRepository extends JpaRepository<RolleEntity, Integer> {
    Optional<RolleEntity> findByNameIgnoreCase(String name);
}
