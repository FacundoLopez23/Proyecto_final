package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.model.UserSettings;
import com.example.repository.UserSettingsRepository;

import java.util.Optional;

@Service
public class UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    public UserSettings getUserSettings(String username) {
        return userSettingsRepository.findByUsername(username)
                .orElseGet(() -> createDefaultSettings(username));
    }

    public UserSettings updateUserSettings(String username, boolean darkModeEnabled, String fontSize) {
        Optional<UserSettings> settingsOptional = userSettingsRepository.findByUsername(username);
        UserSettings settings;

        if (settingsOptional.isPresent()) {
            settings = settingsOptional.get();
        } else {
            settings = new UserSettings();
            settings.setUsername(username);
        }

        settings.setDarkModeEnabled(darkModeEnabled);
        settings.setFontSize(fontSize);

        return userSettingsRepository.save(settings);
    }

    private UserSettings createDefaultSettings(String username) {
        UserSettings defaultSettings = new UserSettings();
        defaultSettings.setUsername(username);
        defaultSettings.setDarkModeEnabled(false);  // Modo claro por defecto
        defaultSettings.setFontSize("16px");  // Tamaño de fuente por defecto
        return userSettingsRepository.save(defaultSettings);
    }
}
