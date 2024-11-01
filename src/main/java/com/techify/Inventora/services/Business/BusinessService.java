package com.techify.Inventora.services.Business;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.Business.Business;
import com.techify.Inventora.repositories.BusinessRepository;

@Service
public class BusinessService {

  @Autowired
  private BusinessRepository businessRepository;

  public List<Business> getAllBusinesses() {
    return businessRepository.findAll();
  }

  public Optional<Business> getBusinessById(Long id) {
    return businessRepository.findById(id);
  }

  public Business createBusiness(Business business) {
    return businessRepository.save(business);
  }

  public boolean deleteBusiness(Long id) {
    Optional<Business> businessOptional = businessRepository.findById(id);
    if (businessOptional.isPresent()) {
      businessRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public Business updateBusiness(Long id, Business updatedBusiness) {
    Optional<Business> optionalBusiness = businessRepository.findById(id);

    if (optionalBusiness.isPresent()) {
      Business existingBusiness = optionalBusiness.get();

      if (updatedBusiness.getName() != null) {
        existingBusiness.setName(updatedBusiness.getName());
      }
      if (updatedBusiness.getDescription() != null) {
        existingBusiness.setDescription(updatedBusiness.getDescription());
      }
      if (updatedBusiness.getOwner() != null) {
        existingBusiness.setOwner(updatedBusiness.getOwner());
      }

      return businessRepository.save(existingBusiness);
    }
    return null;
  }

}
