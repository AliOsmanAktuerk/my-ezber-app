package com.ezber.api.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KursItemRepository extends JpaRepository<KursItemEntity, Integer> {
    List<KursItemEntity> findByKursId(Integer kursId);
}
