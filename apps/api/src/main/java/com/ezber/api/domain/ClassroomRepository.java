package com.ezber.api.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomRepository extends JpaRepository<ClassroomEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = {"account", "room", "room.owner", "kurs", "kurs.account"})
    List<ClassroomEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"account", "room", "room.owner", "kurs", "kurs.account"})
    Optional<ClassroomEntity> findById(Integer id);

    @EntityGraph(attributePaths = {"account", "room", "room.owner", "kurs", "kurs.account"})
    List<ClassroomEntity> findByAccountEmailIgnoreCase(String accountEmail);

    @EntityGraph(attributePaths = {"account", "room", "room.owner", "kurs", "kurs.account"})
    List<ClassroomEntity> findByRoomIdAndKursId(Integer roomId, Integer kursId);

    @EntityGraph(attributePaths = {"account", "room", "room.owner", "kurs", "kurs.account"})
    Optional<ClassroomEntity> findByRoomIdAndKursIdAndAccountEmailIgnoreCase(Integer roomId, Integer kursId, String accountEmail);
}
