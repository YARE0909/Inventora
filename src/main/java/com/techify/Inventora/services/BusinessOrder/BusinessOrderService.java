package com.techify.Inventora.services.BusinessOrder;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.BusinessOrder.BusinessOrder;
import com.techify.Inventora.models.OrderItem.OrderItem;
import com.techify.Inventora.repositories.BusinessOrderRepository;

@Service
public class BusinessOrderService {

  @Autowired
  private BusinessOrderRepository businessOrderRepository;

  public List<BusinessOrder> getAllBusinessOrders() {
    return businessOrderRepository.findAll();
  }

  public BusinessOrder getBusinessOrderById(Long id) {
    return businessOrderRepository.findById(id).orElse(null);
  }

  public BusinessOrder createBusinessOrder(BusinessOrder businessOrder) {
    return businessOrderRepository.save(businessOrder);
  }

  public boolean deleteBusinessOrder(Long id) {
    if (businessOrderRepository.existsById(id)) {
      businessOrderRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public BusinessOrder updateBusinessOrder(Long id, BusinessOrder updatedBusinessOrder) {
    Optional<BusinessOrder> optionalBusinessOrder = businessOrderRepository.findById(id);

    if (optionalBusinessOrder.isPresent()) {
      BusinessOrder existingBusinessOrder = optionalBusinessOrder.get();

      if (updatedBusinessOrder.getBusiness() != null) {
        existingBusinessOrder.setBusiness(updatedBusinessOrder.getBusiness());
      }
      if (updatedBusinessOrder.getStatus() != null) {
        existingBusinessOrder.setStatus(updatedBusinessOrder.getStatus());
      }
      if (updatedBusinessOrder.getItems() != null) {
        List<OrderItem> existingOrderItem = existingBusinessOrder.getItems();

        for (OrderItem updatedOrderItem : updatedBusinessOrder.getItems()) {
          if (existingOrderItem.contains(updatedOrderItem)) {
            OrderItem order = existingOrderItem.get(existingOrderItem.indexOf(updatedOrderItem));

            if (updatedOrderItem.getQuantity() != null) {
              order.setQuantity(updatedOrderItem.getQuantity());
            }
            if (updatedOrderItem.getProduct() != null) {
              order.setProduct(updatedOrderItem.getProduct());
            }
            if (updatedOrderItem.getBusinessOrder() != null) {
              order.setBusinessOrder(updatedOrderItem.getBusinessOrder());
            }
            if (updatedOrderItem.getCustomerOrder() != null) {
              order.setCustomerOrder(updatedOrderItem.getCustomerOrder());
            }
            if (updatedOrderItem.getPrice() != null) {
              order.setPrice(updatedOrderItem.getPrice());
            }
          } else {
            existingOrderItem.add(updatedOrderItem);
          }
        }
      }
      return businessOrderRepository.save(existingBusinessOrder);
    }
    return null;
  }
}
