package com.techify.Inventora.services.User;

import com.techify.Inventora.models.User.User;
import com.techify.Inventora.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
  }

  public User createUser(User user) {
    return userRepository.save(user);
  }

  public boolean deleteUser(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      userRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public User updateUser(Long id, User updatedUser) {
    Optional<User> optionalUser = userRepository.findById(id);

    if (optionalUser.isPresent()) {
      User existingUser = optionalUser.get();

      if (updatedUser.getFirstName() != null) {
        existingUser.setFirstName(updatedUser.getFirstName());
      }
      existingUser.setMiddleName(updatedUser.getMiddleName());
      if (updatedUser.getLastName() != null) {
        existingUser.setLastName(updatedUser.getLastName());
      }
      if (updatedUser.getPassword() != null) {
        existingUser.setPassword(updatedUser.getPassword()); // Consider hashing the password here
      }
      if (updatedUser.getEmail() != null) {
        existingUser.setEmail(updatedUser.getEmail());
      }
      if (updatedUser.getRole() != null) {
        existingUser.setRole(updatedUser.getRole());
      }
      if (updatedUser.getPhoneNumber() != null) {
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
      }
      return userRepository.save(existingUser);
    }
    return null;
  }

}
