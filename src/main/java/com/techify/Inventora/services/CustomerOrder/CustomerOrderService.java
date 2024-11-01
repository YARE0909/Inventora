package com.techify.Inventora.services.CustomerOrder;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.CustomerOrder.CustomerOrder;
import com.techify.Inventora.repositories.CustomerOrderRepository;

@Service
public class CustomerOrderService {

  @Autowired
  private CustomerOrderRepository customerOrderRepository;

  public List<CustomerOrder> getAllCustomerOrders() {
    return customerOrderRepository.findAll();
  }

  public CustomerOrder getCustomerOrderById(Long id) {
    return customerOrderRepository.findById(id).orElse(null);
  }

  public CustomerOrder createCustomerOrder(CustomerOrder customerOrder) {
    return customerOrderRepository.save(customerOrder);
  }

  public boolean deleteCustomerOrder(Long id) {
    if (customerOrderRepository.existsById(id)) {
      customerOrderRepository.deleteById(id);
      return true;
    }
    return false;
  }

    public CustomerOrder updateBusinessOrder(Long id, CustomerOrder updatedCustomerOrder) {
    Optional<CustomerOrder> optionalBusinessOrder = customerOrderRepository.findById(id);

    if (optionalBusinessOrder.isPresent()) {
      CustomerOrder existingCustomerOrder = optionalBusinessOrder.get();

      if (updatedCustomerOrder.getBusiness() != null) {
        existingCustomerOrder.setBusiness(updatedCustomerOrder.getBusiness());
      }
      if (updatedCustomerOrder.getStatus() != null) {
        existingCustomerOrder.setStatus(updatedCustomerOrder.getStatus());
      }
      if (updatedCustomerOrder.getUser() != null) {
        existingCustomerOrder.setUser(updatedCustomerOrder.getUser());
      }
      return customerOrderRepository.save(existingCustomerOrder);
    }
    return null;
  }
  
}
