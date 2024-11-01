package com.techify.Inventora.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.techify.Inventora.models.Transaction.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  
}
