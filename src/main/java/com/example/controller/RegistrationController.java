package com.example.controller;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.model.User;
import com.example.service.UserService;

import java.util.List;
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
    public String loginUser(@RequestBody User user) {
        Optional<User> authenticatedUser = userService.authenticate(user.getUsername(), user.getPassword());
        if (authenticatedUser.isPresent()) {
            return "Login successful";
        } else {
            return "Invalid username or password";
        }
    }
}
