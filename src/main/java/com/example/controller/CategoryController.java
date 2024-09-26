package com.example.controller;
//Vamos a agregar un comentario
import com.example.model.Category;
import com.example.model.User;
import com.example.service.CategoryService;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    // Obtener categorías por nombre de usuario
    @GetMapping("/{username}")
    public ResponseEntity<List<Category>> getCategoriesByUser(@PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isPresent()) {
            List<Category> categories = categoryService.getCategoriesByUser(userOptional.get());
            return ResponseEntity.ok(categories);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

// Crear categoría
@PostMapping
public ResponseEntity<Category> createCategory(@RequestBody Map<String, Object> request) {
    System.out.println("Received request: " + request); // Agrega esta línea para verificar lo que llega

    String username = (String) request.get("username"); // Obtener el nombre de usuario del cuerpo
    Category category = new Category(); // Crear una nueva instancia de Category

    // Obtener el nombre y el tipo de la categoría desde el cuerpo de la solicitud
    String categoryName = (String) request.get("name");
    String categoryType = (String) request.get("type"); 

    // Asegúrate de que el tipo de categoría esté en minúsculas
    if (categoryType != null) {
        categoryType = categoryType.toLowerCase(); // Convertir a minúsculas
    }

    // Validar que el tipo de categoría sea válido
    if (categoryType == null || (!categoryType.equals("gasto") && !categoryType.equals("ingreso"))) {
        return ResponseEntity.badRequest().body(null); // Tipo de categoría no válido
    }

    category.setName(categoryName); // Establecer el nombre
    category.setType(categoryType); // Establecer el tipo

    if (username == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Usuario no autenticado
    }

    try {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isPresent()) {
            category.setUser(userOptional.get()); // Establecer el objeto User
            Category savedCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(savedCategory);
        } else {
            return ResponseEntity.notFound().build(); // Usuario no encontrado
        }
    } catch (Exception e) {
        e.printStackTrace(); // Log de la excepción
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}


}
