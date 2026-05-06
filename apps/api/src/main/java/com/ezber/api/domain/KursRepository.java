package com.ezber.api.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface KursRepository extends JpaRepository<KursEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = "account")
    List<KursEntity> findAll();

    @Override
    @EntityGraph(attributePaths = "account")
    Optional<KursEntity> findById(Integer id);

    @EntityGraph(attributePaths = "account")
    @Query("""
        select kurs
        from KursEntity kurs
        where kurs.publicCourse = true
           or lower(kurs.account.email) = lower(:accountEmail)
        """)
    List<KursEntity> findVisibleForAccount(@Param("accountEmail") String accountEmail);
}
