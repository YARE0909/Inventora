package com.techify.Inventora.models.Invoice;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.techify.Inventora.models.CustomerOrder.CustomerOrder;
import com.techify.Inventora.models.Transaction.Transaction;
import com.techify.Inventora.models.User.User;

@Entity
@Table(name = "invoices")
public class Invoice {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "customer_order_id", nullable = false)
  private CustomerOrder customerOrder;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private Double amountDue;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private InvoiceStatus status;

  @Column(name="due_date", nullable = false)
  private LocalDateTime dueDate;

  @OneToOne
  @JoinColumn(name = "transaction_id", updatable = false)
  private Transaction transaction;

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

  public CustomerOrder getCustomerOrder() {
    return customerOrder;
  }

  public User getUser() {
    return user;
  }

  public Double getAmountDue() {
    return amountDue;
  }

  public InvoiceStatus getStatus() {
    return status;
  }

  public LocalDateTime getDueDate() {
    return dueDate;
  }

  public Transaction getTransaction() {
    return transaction;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setCustomerOrder(CustomerOrder customerOrder) {
    this.customerOrder = customerOrder;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public void setAmountDue(Double amountDue) {
    this.amountDue = amountDue;
  }

  public void setDueDate(LocalDateTime dueDate) {
    this.dueDate = dueDate;
  }

  public void setTransaction(Transaction transaction) {
    this.transaction = transaction;
  }

  public void setStatus(InvoiceStatus status) {
    this.status = status;
  }

  public void setId(Long id) {
    this.id = id;
  }
}
