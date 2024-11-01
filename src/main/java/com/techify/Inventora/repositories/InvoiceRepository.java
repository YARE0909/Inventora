package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.Invoice.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
  
}
