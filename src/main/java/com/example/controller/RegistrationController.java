package com.example.controller;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.model.User;
import com.example.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getMethodName() {
        return userService.getAllUsers();
    }
    

    @PostMapping
    public String registerUser(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists";
        }
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return "Email already exists";
        }
        userService.save(user);
        return "User registered successfully";
    }

   @PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
    String username = credentials.get("username");
    String password = credentials.get("password");
    
    Optional<User> user = userService.authenticate(username, password);
    if (user.isPresent()) {
        Map<String, Object> response = new HashMap<>();
        User loggedUser = user.get();
        response.put("message", "Login successful");
        response.put("activo", loggedUser.getActivo());
        
        return ResponseEntity.ok(response);
    } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(Map.of("message", "Usuario o contraseña incorrecta"));
    }
}

}
