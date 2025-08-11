package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Appointment.AppointmentStatus;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    public List<Appointment> getAppointmentsByDoctor(String doctorName) {
        return appointmentRepository.findByDoctorName(doctorName);
    }
    
    public List<Appointment> getAppointmentsByDepartment(String department) {
        return appointmentRepository.findByDepartment(department);
    }
    
    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    
    public List<Appointment> getAppointmentsBetween(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByAppointmentDateTimeBetween(start, end);
    }
    
    public List<Appointment> getUpcomingAppointments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureLimit = now.plusMonths(3);
        List<AppointmentStatus> activeStatuses = Arrays.asList(
            AppointmentStatus.SCHEDULED, 
            AppointmentStatus.CONFIRMED
        );
        return appointmentRepository.findUpcomingAppointments(now, futureLimit, activeStatuses);
    }
    
    public List<Appointment> getTodaysAppointments() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return appointmentRepository.findByAppointmentDateTimeBetween(startOfDay, endOfDay);
    }
    
    public List<String> getAllDoctors() {
        return appointmentRepository.findAllDoctorNames();
    }
    
    public List<String> getAllDepartments() {
        return appointmentRepository.findAllDepartments();
    }
    
    public Appointment createAppointment(Appointment appointment) {
        validateAppointment(appointment);
        
        // Check if patient exists
        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + 
                                                      appointment.getPatient().getId()));
        
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        // Check for doctor availability (basic check)
        if (isDoctorBusy(appointment.getDoctorName(), appointment.getAppointmentDateTime())) {
            throw new RuntimeException("Doctor " + appointment.getDoctorName() + 
                                     " is not available at the requested time");
        }
        
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        validateAppointment(appointmentDetails);
        
        // Check if patient exists
        Patient patient = patientRepository.findById(appointmentDetails.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + 
                                                      appointmentDetails.getPatient().getId()));
        
        // Check for doctor availability if datetime or doctor changed
        if (!appointment.getDoctorName().equals(appointmentDetails.getDoctorName()) ||
            !appointment.getAppointmentDateTime().equals(appointmentDetails.getAppointmentDateTime())) {
            if (isDoctorBusy(appointmentDetails.getDoctorName(), appointmentDetails.getAppointmentDateTime())) {
                throw new RuntimeException("Doctor " + appointmentDetails.getDoctorName() + 
                                         " is not available at the requested time");
            }
        }
        
        // Update appointment details
        appointment.setPatient(patient);
        appointment.setDoctorName(appointmentDetails.getDoctorName());
        appointment.setDepartment(appointmentDetails.getDepartment());
        appointment.setAppointmentDateTime(appointmentDetails.getAppointmentDateTime());
        appointment.setAppointmentType(appointmentDetails.getAppointmentType());
        appointment.setSymptoms(appointmentDetails.getSymptoms());
        appointment.setNotes(appointmentDetails.getNotes());
        appointment.setPrescription(appointmentDetails.getPrescription());
        appointment.setDiagnosis(appointmentDetails.getDiagnosis());
        appointment.setFee(appointmentDetails.getFee());
        appointment.setRoomNumber(appointmentDetails.getRoomNumber());
        
        if (appointmentDetails.getStatus() != null) {
            appointment.setStatus(appointmentDetails.getStatus());
        }
        
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
    
    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        if (!appointment.canBeCancelled()) {
            throw new RuntimeException("Appointment cannot be cancelled");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        return appointmentRepository.save(appointment);
    }
    
    public long getTotalAppointments() {
        return appointmentRepository.count();
    }
    
    public long getAppointmentCountByStatus(AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }
    
    public List<Appointment> getOverdueAppointments() {
        return appointmentRepository.findOverdueAppointments(LocalDateTime.now());
    }
    
    private boolean isDoctorBusy(String doctorName, LocalDateTime appointmentDateTime) {
        // Check if doctor has another appointment within 1 hour window
        LocalDateTime start = appointmentDateTime.minusMinutes(30);
        LocalDateTime end = appointmentDateTime.plusMinutes(30);
        
        List<Appointment> conflictingAppointments = appointmentRepository
                .findByAppointmentDateTimeBetween(start, end)
                .stream()
                .filter(apt -> apt.getDoctorName().equals(doctorName))
                .filter(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED || 
                              apt.getStatus() == AppointmentStatus.CONFIRMED)
                .toList();
        
        return !conflictingAppointments.isEmpty();
    }
    
    private void validateAppointment(Appointment appointment) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new RuntimeException("Patient is required");
        }
        if (appointment.getDoctorName() == null || appointment.getDoctorName().trim().isEmpty()) {
            throw new RuntimeException("Doctor name is required");
        }
        if (appointment.getDepartment() == null || appointment.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }
        if (appointment.getAppointmentDateTime() == null) {
            throw new RuntimeException("Appointment date and time is required");
        }
        if (appointment.getAppointmentDateTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment cannot be scheduled in the past");
        }
        if (appointment.getAppointmentType() == null || appointment.getAppointmentType().trim().isEmpty()) {
            throw new RuntimeException("Appointment type is required");
        }
    }
} 