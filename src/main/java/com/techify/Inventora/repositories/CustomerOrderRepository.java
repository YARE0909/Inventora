package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.CustomerOrder.CustomerOrder;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
  
}
