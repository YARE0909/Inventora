package com.techify.Inventora.services.Transaction;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.techify.Inventora.models.Transaction.Transaction;
import com.techify.Inventora.repositories.TransactionRepository;

@Service
public class TransactionService {
  
    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public boolean deleteTransaction(Long id) {
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction existingTransaction = transactionRepository.findById(id).orElse(null);

        if (existingTransaction != null) {
            if (updatedTransaction.getAmountPaid() != null) {
                existingTransaction.setAmountPaid(updatedTransaction.getAmountPaid());
            }
            if (updatedTransaction.getPaymentStatus() != null) {
                existingTransaction.setPaymentStatus(updatedTransaction.getPaymentStatus());
            }
            if (updatedTransaction.getPaymentMethod() != null) {
                existingTransaction.setPaymentMethod(updatedTransaction.getPaymentMethod());
            }

            return transactionRepository.save(existingTransaction);
        }
        return null;
    }
}
