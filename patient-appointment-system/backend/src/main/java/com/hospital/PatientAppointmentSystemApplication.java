package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PatientAppointmentSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatientAppointmentSystemApplication.class, args);
        System.out.println("Patient Appointment Management System is running!");
        System.out.println("API Documentation: http://localhost:8080/api");
        System.out.println("H2 Database Console: http://localhost:8080/api/h2-console");
    }
} 