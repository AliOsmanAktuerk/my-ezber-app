package com.ezber.api.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<RoomEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = "owner")
    List<RoomEntity> findAll();

    @Override
    @EntityGraph(attributePaths = "owner")
    Optional<RoomEntity> findById(Integer id);
}
