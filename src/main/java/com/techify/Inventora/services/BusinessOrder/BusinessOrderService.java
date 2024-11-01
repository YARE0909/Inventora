package com.techify.Inventora.services.BusinessOrder;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.BusinessOrder.BusinessOrder;
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
      return businessOrderRepository.save(existingBusinessOrder);
    }
    return null;
  }

}
