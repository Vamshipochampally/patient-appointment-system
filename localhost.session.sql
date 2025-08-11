-- Create the database

CREATE DATABASE tota;

-- Use the database

USE tota;

-- Create Patient Table

CREATE TABLE Patient ( 

    patientId INT AUTO_INCREMENT PRIMARY KEY, 

    name VARCHAR(100), 

    email VARCHAR(100), 

    phone VARCHAR(15), 

    address TEXT, 

    dob DATE 

);

-- Insert dummy data into Patient Table

INSERT INTO Patient (name, email, phone, address, dob) VALUES 

('John Doe', 'john.doe@example.com', '1234567890', '123 Main St, Springfield', '1985-05-15'),

('Jane Smith', 'jane.smith@example.com', '0987654321', '456 Elm St, Springfield', '1990-08-25');

-- Create Doctor Table

CREATE TABLE Doctor ( 

    doctorId INT AUTO_INCREMENT PRIMARY KEY, 

    name VARCHAR(100), 

    specialization VARCHAR(100), 

    email VARCHAR(100), 

    phone VARCHAR(15), 

    availability JSON 

);

-- Insert dummy data into Doctor Table

INSERT INTO Doctor (name, specialization, email, phone, availability) VALUES 

('Dr. Alice Brown', 'Cardiology', 'alice.brown@example.com', '1112223333', '{"Monday": "9am-5pm", "Wednesday": "9am-5pm"}'),

('Dr. Bob White', 'Neurology', 'bob.white@example.com', '4445556666', '{"Tuesday": "10am-4pm", "Thursday": "10am-4pm"}');

-- Create Appointment Table

CREATE TABLE Appointment ( 

    appointmentId INT AUTO_INCREMENT PRIMARY KEY, 

    patientId INT, 

    doctorId INT, 

    appointmentDate DATE, 

    timeSlot TIME, 

    status ENUM('BOOKED', 'CANCELED', 'COMPLETED'), 

    FOREIGN KEY (patientId) REFERENCES Patient(patientId), 

    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId) 

);

-- Insert dummy data into Appointment Table

INSERT INTO Appointment (patientId, doctorId, appointmentDate, timeSlot, status) VALUES 

(1, 1, '2025-08-10', '10:00:00', 'BOOKED'),

(2, 2, '2025-08-11', '11:00:00', 'BOOKED');

-- Create Admin Table

CREATE TABLE Admin ( 

    adminId INT AUTO_INCREMENT PRIMARY KEY, 

    name VARCHAR(100), 

    email VARCHAR(100), 

    role VARCHAR(50) 

);

-- Insert dummy data into Admin Table

INSERT INTO Admin (name, email, role) VALUES 

('Admin One', 'admin.one@example.com', 'Super Admin'),

('Admin Two', 'admin.two@example.com', 'Moderator');

-- Create Notification Table

CREATE TABLE Notification ( patient_mangement_system

    notificationId INT AUTO_INCREMENT PRIMARY KEY, 

    recipientId INT, 

    message TEXT, 

    notificationType ENUM('CONFIRMATION', 'REMINDER'), 

    sentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP 

);

-- Insert dummy data into Notification Table

INSERT INTO Notification (recipientId, message, notificationType) VALUES 

(1, 'Your appointment is confirmed for 2025-08-10 at 10:00 AM.', 'CONFIRMATION'),

(2, 'Reminder: Your appointment is scheduled for 2025-08-11 at 11:00 AM.', 'REMINDER');
 