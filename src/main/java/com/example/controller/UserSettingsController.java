package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.model.UserSettings;
import com.example.service.UserSettingsService;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    // Obtener configuraciones de usuario (modo oscuro, tamaño de fuente, etc.)
    @GetMapping("/{username}")
    public ResponseEntity<UserSettings> getUserSettings(@PathVariable String username) {
        UserSettings settings = userSettingsService.getUserSettings(username);
        if (settings != null) {
            return ResponseEntity.ok(settings);
        } else {
            return ResponseEntity.notFound().build();  // Devolver 404 si no se encuentran ajustes
        }
    }

    // Actualizar configuraciones de usuario
    @PutMapping("/{username}")
    public ResponseEntity<UserSettings> updateUserSettings(@PathVariable String username,
                                                           @RequestBody UserSettings settings) {
        if (settings != null) {
            // Actualizar y devolver las nuevas configuraciones
            UserSettings updatedSettings = userSettingsService.updateUserSettings(
                username, 
                settings.isDarkModeEnabled(), 
                settings.getFontSize()
            );
            return ResponseEntity.ok(updatedSettings);
        } else {
            return ResponseEntity.badRequest().build();  // Devolver 400 si hay un error en los datos recibidos
        }
    }
}
