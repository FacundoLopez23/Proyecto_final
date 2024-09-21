package com.example.service;

import com.example.model.Category;
import com.example.model.User;
import com.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Método para obtener categorías por usuario
    public List<Category> getCategoriesByUser(User user) {
        return categoryRepository.findByUser(user);
    }

    // Método para crear una nueva categoría
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
}
