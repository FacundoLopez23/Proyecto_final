package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.model.Transaction;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByDescription(String description);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date = :date")
    List<Transaction> findByUserIdAndDate(Long userId, LocalDate date);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
