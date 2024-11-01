package com.techify.Inventora.models.OrderItem;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.techify.Inventora.models.BusinessOrder.BusinessOrder;
import com.techify.Inventora.models.CustomerOrder.CustomerOrder;
import com.techify.Inventora.models.Product.Product;

@Entity
@Table(name = "order_items")
public class OrderItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @ManyToOne
  @JoinColumn(name = "customer_order_id")
  private CustomerOrder customerOrder;

  @ManyToOne
  @JoinColumn(name = "business_order_id")
  private BusinessOrder businessOrder;

  @Column(nullable = false)
  private Integer quantity;

  @Column(nullable = false)
  private Double price;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public Product getProduct() {
    return product;
  }

  public CustomerOrder getCustomerOrder() {
    return customerOrder;
  }

  public BusinessOrder getBusinessOrder() {
    return businessOrder;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public Double getPrice() {
    return price;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public void setProduct(Product product) {
    this.product = product;
  }

  public void setCustomerOrder(CustomerOrder customerOrder) {
    this.customerOrder = customerOrder;
  }

  public void setBusinessOrder(BusinessOrder businessOrder) {
    this.businessOrder = businessOrder;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public void setPrice(Double price) {
    this.price = price;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
