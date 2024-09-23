package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.model.UserSettings;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUsername(String username);
}
