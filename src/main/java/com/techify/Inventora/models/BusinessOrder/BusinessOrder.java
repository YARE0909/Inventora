package com.techify.Inventora.models.BusinessOrder;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.techify.Inventora.models.Business.Business;
import com.techify.Inventora.models.OrderItem.OrderItem;
import com.techify.Inventora.models.OrderItem.OrderStatus;

@Entity
@Table(name = "business_orders")
public class BusinessOrder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "business_id", nullable = false)
  private Business business;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OrderStatus status;

  @OneToMany(mappedBy = "businessOrder")
  private List<OrderItem> items;

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

  // Getters and Setters

  public Long getId() {
    return id;
  }

  public Business getBusiness() {
    return business;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public List<OrderItem> getItems() {
    return items;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setBusiness(Business business) {
    this.business = business;
  }

  public void setStatus(OrderStatus status) {
    this.status = status;
  }

  public void setItems(List<OrderItem> items) {
    this.items = items;
  }

  public void setId(Long id) {
    this.id = id;
  }
}
