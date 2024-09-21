package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.model.User;
import com.example.service.UserService;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Obtener usuario por nombre de usuario
    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cambiar nombre de usuario
    @PutMapping("/{username}")
    public ResponseEntity<String> changeUsername(@PathVariable String username, @RequestBody Map<String, String> request) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            String newUsername = request.get("username");
            if (userService.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body("El nombre de usuario ya existe");
            }
            User existingUser = user.get();
            existingUser.setUsername(newUsername);
            userService.save(existingUser);
            return ResponseEntity.ok("Nombre de usuario cambiado correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Cambiar contraseña
    @PutMapping("/{username}/password")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody Map<String, String> request) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            User existingUser = user.get();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (!existingUser.getPassword().equals(currentPassword)) {
                return ResponseEntity.badRequest().body("Contraseña actual incorrecta");
            }
            
            existingUser.setPassword(newPassword);
            userService.save(existingUser);
            return ResponseEntity.ok("Contraseña cambiada correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
