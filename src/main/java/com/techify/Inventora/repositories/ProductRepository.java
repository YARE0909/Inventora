package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.Product.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
  
}
