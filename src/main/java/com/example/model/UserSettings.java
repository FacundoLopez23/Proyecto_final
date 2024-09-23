package com.example.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private boolean darkModeEnabled;

    @Column(nullable = false)
    private String fontSize;
}
