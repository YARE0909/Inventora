package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.BusinessOrder.BusinessOrder;

public interface BusinessOrderRepository extends JpaRepository<BusinessOrder, Long> {
  
}
