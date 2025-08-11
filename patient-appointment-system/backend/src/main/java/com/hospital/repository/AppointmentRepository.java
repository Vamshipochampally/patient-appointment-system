package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.Appointment.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);
    
    List<Appointment> findByDoctorName(String doctorName);
    
    List<Appointment> findByDepartment(String department);
    
    List<Appointment> findByStatus(AppointmentStatus status);
    
    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status")
    List<Appointment> findByPatientIdAndStatus(@Param("patientId") Long patientId, 
                                             @Param("status") AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctorName = :doctorName AND " +
           "DATE(a.appointmentDateTime) = DATE(:date)")
    List<Appointment> findByDoctorAndDate(@Param("doctorName") String doctorName, 
                                        @Param("date") LocalDateTime date);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime >= :start AND " +
           "a.appointmentDateTime <= :end AND a.status IN :statuses")
    List<Appointment> findUpcomingAppointments(@Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end,
                                             @Param("statuses") List<AppointmentStatus> statuses);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") AppointmentStatus status);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorName = :doctorName AND " +
           "DATE(a.appointmentDateTime) = DATE(:date)")
    long countByDoctorAndDate(@Param("doctorName") String doctorName, 
                            @Param("date") LocalDateTime date);
    
    @Query("SELECT DISTINCT a.doctorName FROM Appointment a ORDER BY a.doctorName")
    List<String> findAllDoctorNames();
    
    @Query("SELECT DISTINCT a.department FROM Appointment a ORDER BY a.department")
    List<String> findAllDepartments();
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime < :now AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED')")
    List<Appointment> findOverdueAppointments(@Param("now") LocalDateTime now);
} 