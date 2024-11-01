package com.techify.Inventora.services.OrderItem;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.OrderItem.OrderItem;
import com.techify.Inventora.repositories.OrderItemRepository;

@Service
public class OrderItemService {
  
  @Autowired
  private OrderItemRepository orderItemRepository;

  public List<OrderItem> getAllOrderItems() {
    return orderItemRepository.findAll();
  }

  public OrderItem getOrderItemById(Long id) {
    return orderItemRepository.findById(id).orElse(null);
  }

  public OrderItem createOrderItem(OrderItem orderItem) {
    return orderItemRepository.save(orderItem);
  }

  public boolean deleteOrderItem(Long id) {
    if (orderItemRepository.existsById(id)) {
      orderItemRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public OrderItem updateOrderItem(Long id, OrderItem updatedOrderItem) {
    OrderItem existingOrderItem = orderItemRepository.findById(id).orElse(null);

    if (existingOrderItem != null) {
      if (updatedOrderItem.getQuantity() != null) {
        existingOrderItem.setQuantity(updatedOrderItem.getQuantity());
      }
      if (updatedOrderItem.getPrice() != null) {
        existingOrderItem.setPrice(updatedOrderItem.getPrice());
      }

      return orderItemRepository.save(existingOrderItem);
    }
    return null;
  }
  
}
