package com.techify.Inventora.services.Invoice;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.Invoice.Invoice;
import com.techify.Inventora.repositories.InvoiceRepository;

@Service
public class InvoiceService {

  @Autowired
  private InvoiceRepository invoiceRepository;

  public List<Invoice> getAllInvoices() {
    return invoiceRepository.findAll();
  }

  public Invoice getInvoiceById(Long id) {
    return invoiceRepository.findById(id).orElse(null);
  }

  public Invoice createInvoice(Invoice invoice) {
    return invoiceRepository.save(invoice);
  }

  public boolean deleteInvoice(Long id) {
    if (invoiceRepository.existsById(id)) {
      invoiceRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
    Invoice existingInvoice = invoiceRepository.findById(id).orElse(null);

    if (existingInvoice != null) {
      if (updatedInvoice.getUser() != null) {
        existingInvoice.setUser(updatedInvoice.getUser());
      }
      if (updatedInvoice.getCustomerOrder() != null) {
        existingInvoice.setCustomerOrder(updatedInvoice.getCustomerOrder());
      }
      if (updatedInvoice.getId() != null) {
        existingInvoice.setId(updatedInvoice.getId());
      }
      if (updatedInvoice.getAmountDue() != null) {
        existingInvoice.setAmountDue(updatedInvoice.getAmountDue());
      }
      if (updatedInvoice.getTransaction() != null) {
        existingInvoice.setTransaction(updatedInvoice.getTransaction());
      }
      if (updatedInvoice.getStatus() != null) {
        existingInvoice.setStatus(updatedInvoice.getStatus());
      }

      return invoiceRepository.save(existingInvoice);
    }
    return null;
  }

}
