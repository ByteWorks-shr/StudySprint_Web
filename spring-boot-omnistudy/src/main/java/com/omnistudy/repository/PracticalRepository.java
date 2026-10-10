package com.omnistudy.repository;

import com.omnistudy.model.PracticalExperiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PracticalRepository extends JpaRepository<PracticalExperiment, String> {
    List<PracticalExperiment> findByUserId(String userId);
}
