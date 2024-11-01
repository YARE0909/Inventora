package com.techify.Inventora.models.Transaction;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.techify.Inventora.models.BusinessOrder.BusinessOrder;
import com.techify.Inventora.models.CustomerOrder.CustomerOrder;
import com.techify.Inventora.models.Invoice.Invoice;

@Entity
@Table(name = "transactions")
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "invoice_id")
  private Invoice invoice;

  @ManyToOne
  @JoinColumn(name = "customer_order_id")
  private CustomerOrder customerOrder;

  @ManyToOne
  @JoinColumn(name = "business_order_id")
  private BusinessOrder businessOrder;

  @Column(nullable = false)
  private Double amountPaid;

  @Enumerated(EnumType.STRING)
  private PaymentStatus paymentStatus;

  @Column(name = "payment_method", nullable = false)
  private String paymentMethod;

  @Column(name = "due_date", nullable = false)
  private LocalDateTime dueDate;

  @Column(name = "transaction_date", nullable = false)
  private LocalDateTime transactionDate;

  @PrePersist
  protected void onCreate() {
    transactionDate = LocalDateTime.now();
  }

  // Getters and Setters

  public Long getId() {
    return id;
  }

  public Invoice getInvoice() {
    return invoice;
  }

  public CustomerOrder getCustomerOrder() {
    return customerOrder;
  }

  public BusinessOrder getBusinessOrder() {
    return businessOrder;
  }

  public Double getAmountPaid() {
    return amountPaid;
  }

  public PaymentStatus getPaymentStatus() {
    return paymentStatus;
  }

  public String getPaymentMethod() {
    return paymentMethod;
  }

  public LocalDateTime getDueDate() {
    return dueDate;
  }

  public LocalDateTime getTransactionDate() {
    return transactionDate;
  }

  public void setInvoice(Invoice invoice) {
    this.invoice = invoice;
  }

  public void setCustomerOrder(CustomerOrder customerOrder) {
    this.customerOrder = customerOrder;
  }

  public void setBusinessOrder(BusinessOrder businessOrder) {
    this.businessOrder = businessOrder;
  }

  public void setAmountPaid(Double amountPaid) {
    this.amountPaid = amountPaid;
  }

  public void setPaymentStatus(PaymentStatus paymentStatus) {
    this.paymentStatus = paymentStatus;
  }

  public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  public void setDueDate(LocalDateTime dueDate) {
    this.dueDate = dueDate;
  }

  public void setTransactionDate(LocalDateTime transactionDate) {
    this.transactionDate = transactionDate;
  }

  public void setId(Long id) {
    this.id = id;
  }
}
