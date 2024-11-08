package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.model.User;
import com.example.service.UserService;
import com.example.service.UserSettingsService;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserSettingsService userSettingsService;

    // Obtener usuario por nombre de usuario
    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cambiar nombre de usuario
    @PutMapping("/{username}")
    public ResponseEntity<String> changeUsername(@PathVariable String username, @RequestBody Map<String, String> request) {
        try {
            Optional<User> user = userService.findByUsername(username);
            if (user.isPresent()) {
                String newUsername = request.get("username");
                if (newUsername == null || newUsername.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("El nuevo nombre de usuario no puede estar vacío");
                }
                
                if (userService.findByUsername(newUsername).isPresent()) {
                    return ResponseEntity.badRequest().body("El nombre de usuario ya existe");
                }
                
                // Primero actualizamos los ajustes
                userSettingsService.updateUsername(username, newUsername);
                
                // Luego actualizamos el usuario
                User existingUser = user.get();
                existingUser.setUsername(newUsername);
                userService.save(existingUser);
                
                return ResponseEntity.ok("Nombre de usuario cambiado correctamente");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error en los logs del servidor
            return ResponseEntity.status(500)
                .body("Error al cambiar el nombre de usuario: " + e.getMessage());
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

    // Desactivar cuenta
    @PutMapping("/{username}/deactivate")
    public ResponseEntity<String> deactivateAccount(@PathVariable String username) {
        Optional<User> user = userService.deactivateAccount(username);
        if (user.isPresent()) {
            return ResponseEntity.ok("Cuenta desactivada correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

