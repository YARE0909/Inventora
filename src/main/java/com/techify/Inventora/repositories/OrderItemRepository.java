package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.OrderItem.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
  
}
