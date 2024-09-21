package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.model.User;
import com.example.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username));
    }

    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> authenticate(String username, String password) {
        Optional<User> user = findByUsername(username);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        } else {
            return Optional.empty();
        }
    }

    public Optional<User> changeUsername(String username, String newUsername) {
        Optional<User> user = findByUsername(username);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setUsername(newUsername);
            return Optional.of(save(existingUser));
        } else {
            return Optional.empty();
        }
    }
}
