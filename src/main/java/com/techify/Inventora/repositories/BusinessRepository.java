package com.techify.Inventora.repositories;

import com.techify.Inventora.models.Business.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {
}
