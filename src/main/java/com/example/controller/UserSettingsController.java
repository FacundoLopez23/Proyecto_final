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

    @GetMapping("/{username}")
    public ResponseEntity<UserSettings> getUserSettings(@PathVariable String username) {
        UserSettings settings = userSettingsService.getUserSettings(username);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/{username}")
    public ResponseEntity<UserSettings> updateUserSettings(@PathVariable String username,
                                                           @RequestBody UserSettings settings) {
        // Aquí asumimos que `UserSettings` tiene los atributos `darkModeEnabled` y `fontSize`
        UserSettings updatedSettings = userSettingsService.updateUserSettings(username, settings.isDarkModeEnabled(), settings.getFontSize());
        return ResponseEntity.ok(updatedSettings);
    }
}
