package com.techify.Inventora.repositories;

import com.techify.Inventora.models.User.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
