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

    // Obtener las configuraciones del usuario o crearlas si no existen
    public UserSettings getUserSettings(String username) {
        return userSettingsRepository.findByUsername(username)
                .orElseGet(() -> createDefaultSettings(username)); // Si no existe, crea con valores por defecto
    }

    // Actualizar las configuraciones del usuario
    public UserSettings updateUserSettings(String username, boolean darkModeEnabled, String fontSize) {
        Optional<UserSettings> settingsOptional = userSettingsRepository.findByUsername(username);
        UserSettings settings;

        // Si el usuario tiene configuraciones previas, las recuperamos; si no, las creamos
        if (settingsOptional.isPresent()) {
            settings = settingsOptional.get();
        } else {
            settings = new UserSettings();
            settings.setUsername(username);
        }

        // Actualizamos las configuraciones con los nuevos valores
        settings.setDarkModeEnabled(darkModeEnabled);
        settings.setFontSize(fontSize);

        // Guardamos las configuraciones en el repositorio
        return userSettingsRepository.save(settings);
    }

    // Crear configuraciones por defecto para nuevos usuarios
    private UserSettings createDefaultSettings(String username) {
        UserSettings defaultSettings = new UserSettings();
        defaultSettings.setUsername(username);
        defaultSettings.setDarkModeEnabled(false);  // Modo claro por defecto
        defaultSettings.setFontSize("16px");  // Tamaño de fuente por defecto
        return userSettingsRepository.save(defaultSettings); // Guardamos los ajustes por defecto
    }

    public void updateUsername(String oldUsername, String newUsername) {
        try {
            Optional<UserSettings> settingsOptional = userSettingsRepository.findByUsername(oldUsername);
            if (settingsOptional.isPresent()) {
                UserSettings oldSettings = settingsOptional.get();
                
                // Crear nuevos ajustes con el nuevo username
                UserSettings newSettings = new UserSettings();
                newSettings.setUsername(newUsername);
                newSettings.setDarkModeEnabled(oldSettings.isDarkModeEnabled());
                newSettings.setFontSize(oldSettings.getFontSize());
                
                // Primero guardamos los nuevos ajustes
                userSettingsRepository.save(newSettings);
                
                // Luego eliminamos los ajustes antiguos
                userSettingsRepository.delete(oldSettings);
            } else {
                // Si no hay ajustes, crear unos por defecto
                UserSettings defaultSettings = new UserSettings();
                defaultSettings.setUsername(newUsername);
                defaultSettings.setDarkModeEnabled(false);
                defaultSettings.setFontSize("16px");
                userSettingsRepository.save(defaultSettings);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error en los logs del servidor
            throw new RuntimeException("Error al actualizar los ajustes del usuario: " + e.getMessage());
        }
    }
}
