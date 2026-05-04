package com.ezber.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.ezber.api.domain.dto.KursItemRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class KursItemServiceTest {
    @Mock
    private KursItemRepository repository;

    @Mock
    private DomainLookupService lookup;

    @InjectMocks
    private KursItemService service;

    @Test
    void findAllCanFilterByCourseId() {
        var kurs = new KursEntity(true, "Java", "Basics");
        when(repository.findByKursId(3)).thenReturn(List.of(new KursItemEntity("Intro", false, kurs)));

        var responses = service.findAll(3);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().name()).isEqualTo("Intro");
    }

    @Test
    void createUsesReferencedCourse() {
        var kurs = new KursEntity(true, "Java", "Basics");
        when(lookup.kurs(3)).thenReturn(kurs);
        when(repository.save(any(KursItemEntity.class))).thenReturn(new KursItemEntity("Intro", true, kurs));

        var response = service.create(new KursItemRequest(" Intro ", true, 3));

        assertThat(response.name()).isEqualTo("Intro");
        assertThat(response.state()).isTrue();
    }
}
