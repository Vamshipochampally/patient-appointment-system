package com.hospital.service;

import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }
    
    public Optional<Patient> getPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }
    
    public Optional<Patient> getPatientByPhone(String phone) {
        return patientRepository.findByPhone(phone);
    }
    
    public List<Patient> searchPatientsByName(String name) {
        return patientRepository.findByFullNameContaining(name);
    }
    
    public List<Patient> getPatientsByGender(String gender) {
        return patientRepository.findByGender(gender);
    }
    
    public List<Patient> getPatientsByBloodGroup(String bloodGroup) {
        return patientRepository.findByBloodGroup(bloodGroup);
    }
    
    public List<Patient> getPatientsRegisteredSince(LocalDate date) {
        return patientRepository.findPatientsRegisteredSince(date);
    }
    
    public Patient createPatient(Patient patient) {
        validatePatient(patient);
        
        if (patientRepository.existsByEmail(patient.getEmail())) {
            throw new RuntimeException("Patient with email " + patient.getEmail() + " already exists");
        }
        
        if (patientRepository.existsByPhone(patient.getPhone())) {
            throw new RuntimeException("Patient with phone " + patient.getPhone() + " already exists");
        }
        
        return patientRepository.save(patient);
    }
    
    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        
        validatePatient(patientDetails);
        
        // Check for email uniqueness (excluding current patient)
        Optional<Patient> existingPatientWithEmail = patientRepository.findByEmail(patientDetails.getEmail());
        if (existingPatientWithEmail.isPresent() && !existingPatientWithEmail.get().getId().equals(id)) {
            throw new RuntimeException("Patient with email " + patientDetails.getEmail() + " already exists");
        }
        
        // Check for phone uniqueness (excluding current patient)
        Optional<Patient> existingPatientWithPhone = patientRepository.findByPhone(patientDetails.getPhone());
        if (existingPatientWithPhone.isPresent() && !existingPatientWithPhone.get().getId().equals(id)) {
            throw new RuntimeException("Patient with phone " + patientDetails.getPhone() + " already exists");
        }
        
        // Update patient details
        patient.setFirstName(patientDetails.getFirstName());
        patient.setLastName(patientDetails.getLastName());
        patient.setEmail(patientDetails.getEmail());
        patient.setPhone(patientDetails.getPhone());
        patient.setDateOfBirth(patientDetails.getDateOfBirth());
        patient.setGender(patientDetails.getGender());
        patient.setAddress(patientDetails.getAddress());
        patient.setEmergencyContact(patientDetails.getEmergencyContact());
        patient.setEmergencyPhone(patientDetails.getEmergencyPhone());
        patient.setMedicalHistory(patientDetails.getMedicalHistory());
        patient.setAllergies(patientDetails.getAllergies());
        patient.setBloodGroup(patientDetails.getBloodGroup());
        
        return patientRepository.save(patient);
    }
    
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
    
    public long getTotalPatients() {
        return patientRepository.count();
    }
    
    public long getPatientCountByGender(String gender) {
        return patientRepository.countByGender(gender);
    }
    
    private void validatePatient(Patient patient) {
        if (patient.getFirstName() == null || patient.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("First name is required");
        }
        if (patient.getLastName() == null || patient.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Last name is required");
        }
        if (patient.getEmail() == null || patient.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (patient.getPhone() == null || patient.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone is required");
        }
        if (patient.getDateOfBirth() == null) {
            throw new RuntimeException("Date of birth is required");
        }
        if (patient.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new RuntimeException("Date of birth cannot be in the future");
        }
        if (patient.getGender() == null || patient.getGender().trim().isEmpty()) {
            throw new RuntimeException("Gender is required");
        }
    }
} 