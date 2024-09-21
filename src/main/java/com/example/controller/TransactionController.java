package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.model.Transaction;
import com.example.model.User;
import com.example.service.TransactionService;
import com.example.service.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public List<Transaction> getUserTransactions(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            return transactionService.getUserTransactions(user.get().getId());
        } else {
            throw new IllegalArgumentException("User not found");
        }
    }
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }
    
    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        Optional<User> user = userService.findByUsername(transaction.getUser().getUsername());
        if (user.isPresent()) {
            transaction.setUser(user.get());
            return transactionService.saveTransaction(transaction);
        } else {
            throw new IllegalArgumentException("User not found");
        }
    }
}
