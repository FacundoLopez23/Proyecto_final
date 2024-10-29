package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.model.Transaction;
import com.example.model.User;
import com.example.service.TransactionService;
import com.example.service.UserService;

import java.time.LocalDate;
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

    @GetMapping("/{username}/{period}")
    public List<Transaction> getUserTransactionsByPeriod(
            @PathVariable String username,
            @PathVariable String period) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            return transactionService.getUserTransactionsByPeriod(user.get().getId(), period);
        } else {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
    }

    @GetMapping("/{username}/filtered")
    public List<Transaction> getFilteredTransactions(
            @PathVariable String username,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            return transactionService.getTransactionsBetweenDates(
                user.get().getId(), 
                startDate, 
                endDate
            );
        } else {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
    }
}
