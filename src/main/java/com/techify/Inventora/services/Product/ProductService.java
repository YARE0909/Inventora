package com.techify.Inventora.services.Product;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.Product.Product;
import com.techify.Inventora.repositories.ProductRepository;

@Service
public class ProductService {
  
  @Autowired
  private ProductRepository productRepository;

  public List<Product> getAllProducts() {
    return productRepository.findAll();
  }
  
  public Product getProductById(Long id) {
    return productRepository.findById(id).orElse(null);
  }

  public Product createProduct(Product product) {
    return productRepository.save(product);
  }

  public boolean deleteProduct(Long id) {
    if (productRepository.existsById(id)) {
      productRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public Product updateProduct(Long id, Product updatedProduct) {
    Product existingProduct = productRepository.findById(id).orElse(null);

    if (existingProduct != null) {
      if (updatedProduct.getName() != null) {
        existingProduct.setName(updatedProduct.getName());
      }
      if (updatedProduct.getDescription() != null) {
        existingProduct.setDescription(updatedProduct.getDescription());
      }
      if (updatedProduct.getQuantity() != null) {
        existingProduct.setQuantity(updatedProduct.getQuantity());
      }
      if (updatedProduct.getIsAvailable() != null) {
        existingProduct.setIsAvailable(updatedProduct.getIsAvailable());
      }

      return productRepository.save(existingProduct);
    }
    return null;
  }
  
}
