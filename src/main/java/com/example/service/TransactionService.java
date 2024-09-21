package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.model.Transaction;
import com.example.model.User;
import com.example.repository.TransactionRepository;
import com.example.repository.UserRepository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Transaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Optional<Transaction> transactionOptional = transactionRepository.findById(id);
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            User user = transaction.getUser();

            // Restaurar el balance del usuario
            if (transaction.getType().equalsIgnoreCase("Ingreso")) {
                user.setBalance(user.getBalance() - transaction.getAmount());
            } else if (transaction.getType().equalsIgnoreCase("Gasto")) {
                user.setBalance(user.getBalance() + transaction.getAmount());
            }

            userRepository.save(user);
            transactionRepository.delete(transaction);
        } else {
            throw new IllegalArgumentException("Transacción no encontrada");
        }
    }

    @Transactional
    public Transaction saveTransaction(Transaction transaction) {
        // Verificar si el usuario existe
        Optional<User> userOptional = userRepository.findById(transaction.getUser().getId());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            transaction.setUser(user);

            // Actualizar el balance del usuario
            if (transaction.getType().equalsIgnoreCase("Ingreso")) {
                user.setBalance(user.getBalance() + transaction.getAmount());
            } else if (transaction.getType().equalsIgnoreCase("Gasto")) {
                user.setBalance(user.getBalance() - transaction.getAmount());
            }

            userRepository.save(user);
            return transactionRepository.save(transaction);
        } else {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
    }
}
