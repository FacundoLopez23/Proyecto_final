package com.example.service;

import com.example.model.Category;
import com.example.model.Transaction;
import com.example.model.User;
import com.example.repository.CategoryRepository;
import com.example.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Método para obtener categorías por usuario
    public List<Category> getCategoriesByUser(User user) {
        return categoryRepository.findByUser(user);
    }

    // Método para crear una nueva categoría
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            // Primero eliminamos todas las transacciones asociadas
            List<Transaction> transactions = transactionRepository.findByDescription(category.getName());
            for (Transaction transaction : transactions) {
                // Revertir el balance del usuario
                User user = transaction.getUser();
                if (transaction.getType().equalsIgnoreCase("Ingreso")) {
                    user.setBalance(user.getBalance() - transaction.getAmount());
                } else if (transaction.getType().equalsIgnoreCase("Gasto")) {
                    user.setBalance(user.getBalance() + transaction.getAmount());
                }
            }
            transactionRepository.deleteAll(transactions);
            // Luego eliminamos la categoría
            categoryRepository.delete(category);
        }
    }
}
