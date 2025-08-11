// Patient Appointment Management System - JavaScript

class PatientAppointmentSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8080/api';
        this.currentSection = 'dashboard';
        this.patients = [];
        this.appointments = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.loadInitialData();
        this.setMinDateTime();
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-section]')) {
                e.preventDefault();
                this.showSection(e.target.getAttribute('data-section'));
            }
        });

        // Patient Management
        document.getElementById('save-patient-btn').addEventListener('click', () => this.savePatient());
        document.getElementById('patient-search').addEventListener('input', (e) => this.searchPatients(e.target.value));
        document.getElementById('gender-filter').addEventListener('change', (e) => this.filterPatients());
        document.getElementById('blood-group-filter').addEventListener('change', (e) => this.filterPatients());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Appointment Management
        document.getElementById('save-appointment-btn').addEventListener('click', () => this.saveAppointment());
        document.getElementById('book-appointment-form').addEventListener('submit', (e) => this.bookAppointment(e));
        document.getElementById('clear-appointment-form').addEventListener('click', () => this.clearAppointmentForm());
        document.getElementById('appointment-status-filter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('department-filter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('appointment-date-filter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('clear-appointment-filters').addEventListener('click', () => this.clearAppointmentFilters());

        // Modal events
        document.getElementById('patientModal').addEventListener('hidden.bs.modal', () => this.clearPatientForm());
        document.getElementById('appointmentModal').addEventListener('hidden.bs.modal', () => this.clearAppointmentModalForm());
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'patients':
                this.loadPatients();
                break;
            case 'appointments':
                this.loadAppointments();
                break;
            case 'book-appointment':
                this.loadPatientsForSelect();
                break;
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadDashboardData(),
                this.loadPatientsForSelect()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showErrorMessage('Failed to load initial data');
        }
    }

    async loadDashboardData() {
        try {
            const [totalPatients, totalAppointments, todayAppointments, upcomingAppointments, recentAppointments, recentPatients] = await Promise.all([
                this.apiCall('/patients/stats/total'),
                this.apiCall('/appointments/stats/total'),
                this.apiCall('/appointments/today'),
                this.apiCall('/appointments/upcoming'),
                this.apiCall('/appointments?limit=5'),
                this.apiCall('/patients/recent?days=7')
            ]);

            // Update stats cards
            document.getElementById('total-patients').textContent = totalPatients || 0;
            document.getElementById('total-appointments').textContent = totalAppointments || 0;
            document.getElementById('today-appointments').textContent = (todayAppointments && todayAppointments.length) || 0;
            document.getElementById('upcoming-appointments').textContent = (upcomingAppointments && upcomingAppointments.length) || 0;

            // Update recent lists
            this.displayRecentAppointments(recentAppointments || []);
            this.displayRecentPatients(recentPatients || []);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showErrorMessage('Failed to load dashboard data');
        }
    }

    displayRecentAppointments(appointments) {
        const container = document.getElementById('recent-appointments-list');
        
        if (!appointments || appointments.length === 0) {
            container.innerHTML = this.getEmptyState('No recent appointments', 'calendar-alt');
            return;
        }

        const html = appointments.slice(0, 5).map(appointment => `
            <div class="recent-item">
                <div class="recent-item-icon bg-primary text-white">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="recent-item-content">
                    <div class="recent-item-title">${appointment.patient?.firstName} ${appointment.patient?.lastName}</div>
                    <div class="recent-item-subtitle">Dr. ${appointment.doctorName} - ${appointment.department}</div>
                </div>
                <div class="recent-item-time">
                    ${this.formatDateTime(appointment.appointmentDateTime)}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    displayRecentPatients(patients) {
        const container = document.getElementById('recent-patients-list');
        
        if (!patients || patients.length === 0) {
            container.innerHTML = this.getEmptyState('No recent patients', 'users');
            return;
        }

        const html = patients.slice(0, 5).map(patient => `
            <div class="recent-item">
                <div class="recent-item-icon bg-success text-white">
                    <i class="fas fa-user"></i>
                </div>
                <div class="recent-item-content">
                    <div class="recent-item-title">${patient.firstName} ${patient.lastName}</div>
                    <div class="recent-item-subtitle">${patient.email}</div>
                </div>
                <div class="recent-item-time">
                    ${this.formatDate(patient.createdAt)}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async loadPatients() {
        try {
            this.showTableLoading('patients-table-body');
            const patients = await this.apiCall('/patients');
            this.patients = patients || [];
            this.displayPatients(this.patients);
        } catch (error) {
            console.error('Error loading patients:', error);
            this.showTableError('patients-table-body', 'Failed to load patients');
        }
    }

    displayPatients(patients) {
        const tbody = document.getElementById('patients-table-body');
        
        if (!patients || patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">${this.getEmptyState('No patients found', 'users')}</td></tr>`;
            return;
        }

        tbody.innerHTML = patients.map(patient => `
            <tr>
                <td><strong>#${patient.id}</strong></td>
                <td>${patient.firstName} ${patient.lastName}</td>
                <td>${patient.email}</td>
                <td>${patient.phone}</td>
                <td>${patient.age || this.calculateAge(patient.dateOfBirth)}</td>
                <td>${patient.gender}</td>
                <td>${patient.bloodGroup || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="app.viewPatient(${patient.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="app.editPatient(${patient.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deletePatient(${patient.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadAppointments() {
        try {
            this.showTableLoading('appointments-table-body');
            const appointments = await this.apiCall('/appointments');
            this.appointments = appointments || [];
            await this.loadDepartments();
            this.displayAppointments(this.appointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showTableError('appointments-table-body', 'Failed to load appointments');
        }
    }

    async loadDepartments() {
        try {
            const departments = await this.apiCall('/appointments/departments');
            const select = document.getElementById('department-filter');
            select.innerHTML = '<option value="">All Departments</option>' + 
                (departments || []).map(dept => `<option value="${dept}">${dept}</option>`).join('');
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    displayAppointments(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">${this.getEmptyState('No appointments found', 'calendar-alt')}</td></tr>`;
            return;
        }

        tbody.innerHTML = appointments.map(appointment => `
            <tr>
                <td><strong>#${appointment.id}</strong></td>
                <td>${appointment.patient?.firstName} ${appointment.patient?.lastName}</td>
                <td>Dr. ${appointment.doctorName}</td>
                <td>${appointment.department}</td>
                <td>${this.formatDateTime(appointment.appointmentDateTime)}</td>
                <td>${appointment.appointmentType}</td>
                <td><span class="badge status-${appointment.status.toLowerCase().replace('_', '-')}">${this.formatStatus(appointment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="app.viewAppointment(${appointment.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="app.editAppointment(${appointment.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${appointment.status !== 'CANCELLED' ? `
                            <button class="btn btn-sm btn-secondary" onclick="app.cancelAppointment(${appointment.id})">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="app.deleteAppointment(${appointment.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadPatientsForSelect() {
        try {
            const patients = await this.apiCall('/patients');
            const selects = [
                document.getElementById('book-patient-select'),
                document.getElementById('modal-patient-select')
            ];

            const options = '<option value="">Select Patient</option>' + 
                (patients || []).map(patient => 
                    `<option value="${patient.id}">${patient.firstName} ${patient.lastName}</option>`
                ).join('');

            selects.forEach(select => {
                if (select) select.innerHTML = options;
            });
        } catch (error) {
            console.error('Error loading patients for select:', error);
        }
    }

    // Patient CRUD Operations
    async savePatient() {
        try {
            const patientData = this.getPatientFormData();
            const patientId = document.getElementById('patient-id').value;
            const url = patientId ? `/patients/${patientId}` : '/patients';
            const method = patientId ? 'PUT' : 'POST';

            await this.apiCall(url, method, patientData);
            this.showSuccessMessage(patientId ? 'Patient updated successfully' : 'Patient created successfully');
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('patientModal')).hide();
            if (this.currentSection === 'patients') {
                this.loadPatients();
            }
            this.loadPatientsForSelect();
        } catch (error) {
            console.error('Error saving patient:', error);
            this.showErrorMessage('Failed to save patient: ' + (error.message || 'Unknown error'));
        }
    }

    async editPatient(id) {
        try {
            const patient = await this.apiCall(`/patients/${id}`);
            this.populatePatientForm(patient);
            document.getElementById('patient-modal-title').textContent = 'Edit Patient';
            new bootstrap.Modal(document.getElementById('patientModal')).show();
        } catch (error) {
            console.error('Error loading patient:', error);
            this.showErrorMessage('Failed to load patient details');
        }
    }

    async deletePatient(id) {
        if (!confirm('Are you sure you want to delete this patient?')) return;

        try {
            await this.apiCall(`/patients/${id}`, 'DELETE');
            this.showSuccessMessage('Patient deleted successfully');
            this.loadPatients();
            this.loadPatientsForSelect();
        } catch (error) {
            console.error('Error deleting patient:', error);
            this.showErrorMessage('Failed to delete patient');
        }
    }

    // Appointment CRUD Operations
    async bookAppointment(e) {
        e.preventDefault();
        try {
            const appointmentData = this.getBookAppointmentFormData();
            await this.apiCall('/appointments', 'POST', appointmentData);
            this.showSuccessMessage('Appointment booked successfully');
            this.clearAppointmentForm();
            if (this.currentSection === 'appointments') {
                this.loadAppointments();
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            this.showErrorMessage('Failed to book appointment: ' + (error.message || 'Unknown error'));
        }
    }

    async saveAppointment() {
        try {
            const appointmentData = this.getAppointmentModalFormData();
            const appointmentId = document.getElementById('appointment-id').value;
            const url = appointmentId ? `/appointments/${appointmentId}` : '/appointments';
            const method = appointmentId ? 'PUT' : 'POST';

            await this.apiCall(url, method, appointmentData);
            this.showSuccessMessage(appointmentId ? 'Appointment updated successfully' : 'Appointment created successfully');
            
            bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
            if (this.currentSection === 'appointments') {
                this.loadAppointments();
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            this.showErrorMessage('Failed to save appointment: ' + (error.message || 'Unknown error'));
        }
    }

    async editAppointment(id) {
        try {
            const appointment = await this.apiCall(`/appointments/${id}`);
            this.populateAppointmentForm(appointment);
            document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
            new bootstrap.Modal(document.getElementById('appointmentModal')).show();
        } catch (error) {
            console.error('Error loading appointment:', error);
            this.showErrorMessage('Failed to load appointment details');
        }
    }

    async cancelAppointment(id) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await this.apiCall(`/appointments/${id}/cancel`, 'PATCH');
            this.showSuccessMessage('Appointment cancelled successfully');
            this.loadAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showErrorMessage('Failed to cancel appointment');
        }
    }

    async deleteAppointment(id) {
        if (!confirm('Are you sure you want to delete this appointment?')) return;

        try {
            await this.apiCall(`/appointments/${id}`, 'DELETE');
            this.showSuccessMessage('Appointment deleted successfully');
            this.loadAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            this.showErrorMessage('Failed to delete appointment');
        }
    }

    // Form Data Helpers
    getPatientFormData() {
        return {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dateOfBirth: document.getElementById('date-of-birth').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            emergencyContact: document.getElementById('emergency-contact').value,
            emergencyPhone: document.getElementById('emergency-phone').value,
            bloodGroup: document.getElementById('blood-group').value,
            allergies: document.getElementById('allergies').value,
            medicalHistory: document.getElementById('medical-history').value
        };
    }

    getBookAppointmentFormData() {
        const date = document.getElementById('book-appointment-date').value;
        const time = document.getElementById('book-appointment-time').value;
        const appointmentDateTime = new Date(`${date}T${time}`).toISOString();

        return {
            patient: { id: parseInt(document.getElementById('book-patient-select').value) },
            doctorName: document.getElementById('book-doctor-name').value,
            department: document.getElementById('book-department').value,
            appointmentDateTime: appointmentDateTime,
            appointmentType: document.getElementById('book-appointment-type').value,
            symptoms: document.getElementById('book-symptoms').value,
            fee: parseFloat(document.getElementById('book-fee').value) || null,
            roomNumber: document.getElementById('book-room-number').value
        };
    }

    getAppointmentModalFormData() {
        const date = document.getElementById('modal-appointment-date').value;
        const time = document.getElementById('modal-appointment-time').value;
        const appointmentDateTime = new Date(`${date}T${time}`).toISOString();

        return {
            patient: { id: parseInt(document.getElementById('modal-patient-select').value) },
            doctorName: document.getElementById('modal-doctor-name').value,
            department: document.getElementById('modal-department').value,
            appointmentDateTime: appointmentDateTime,
            appointmentType: document.getElementById('modal-appointment-type').value,
            status: document.getElementById('modal-status').value,
            symptoms: document.getElementById('modal-symptoms').value,
            notes: document.getElementById('modal-notes').value,
            fee: parseFloat(document.getElementById('modal-fee').value) || null
        };
    }

    // Form Population Helpers
    populatePatientForm(patient) {
        document.getElementById('patient-id').value = patient.id;
        document.getElementById('first-name').value = patient.firstName;
        document.getElementById('last-name').value = patient.lastName;
        document.getElementById('email').value = patient.email;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('date-of-birth').value = patient.dateOfBirth;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('address').value = patient.address || '';
        document.getElementById('emergency-contact').value = patient.emergencyContact || '';
        document.getElementById('emergency-phone').value = patient.emergencyPhone || '';
        document.getElementById('blood-group').value = patient.bloodGroup || '';
        document.getElementById('allergies').value = patient.allergies || '';
        document.getElementById('medical-history').value = patient.medicalHistory || '';
    }

    populateAppointmentForm(appointment) {
        const dateTime = new Date(appointment.appointmentDateTime);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);

        document.getElementById('appointment-id').value = appointment.id;
        document.getElementById('modal-patient-select').value = appointment.patient.id;
        document.getElementById('modal-doctor-name').value = appointment.doctorName;
        document.getElementById('modal-department').value = appointment.department;
        document.getElementById('modal-appointment-date').value = date;
        document.getElementById('modal-appointment-time').value = time;
        document.getElementById('modal-appointment-type').value = appointment.appointmentType;
        document.getElementById('modal-status').value = appointment.status;
        document.getElementById('modal-symptoms').value = appointment.symptoms || '';
        document.getElementById('modal-notes').value = appointment.notes || '';
        document.getElementById('modal-fee').value = appointment.fee || '';
    }

    // Form Clearing Helpers
    clearPatientForm() {
        document.getElementById('patient-form').reset();
        document.getElementById('patient-id').value = '';
        document.getElementById('patient-modal-title').textContent = 'Add New Patient';
    }

    clearAppointmentForm() {
        document.getElementById('book-appointment-form').reset();
    }

    clearAppointmentModalForm() {
        document.getElementById('appointment-form').reset();
        document.getElementById('appointment-id').value = '';
        document.getElementById('appointment-modal-title').textContent = 'New Appointment';
    }

    // Filtering and Search
    searchPatients(query) {
        if (!query) {
            this.displayPatients(this.patients);
            return;
        }

        const filtered = this.patients.filter(patient => 
            patient.firstName.toLowerCase().includes(query.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(query.toLowerCase()) ||
            patient.email.toLowerCase().includes(query.toLowerCase()) ||
            patient.phone.includes(query)
        );

        this.displayPatients(filtered);
    }

    filterPatients() {
        const gender = document.getElementById('gender-filter').value;
        const bloodGroup = document.getElementById('blood-group-filter').value;

        let filtered = this.patients;

        if (gender) {
            filtered = filtered.filter(patient => patient.gender === gender);
        }

        if (bloodGroup) {
            filtered = filtered.filter(patient => patient.bloodGroup === bloodGroup);
        }

        this.displayPatients(filtered);
    }

    filterAppointments() {
        const status = document.getElementById('appointment-status-filter').value;
        const department = document.getElementById('department-filter').value;
        const date = document.getElementById('appointment-date-filter').value;

        let filtered = this.appointments;

        if (status) {
            filtered = filtered.filter(apt => apt.status === status);
        }

        if (department) {
            filtered = filtered.filter(apt => apt.department === department);
        }

        if (date) {
            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.appointmentDateTime).toISOString().split('T')[0];
                return aptDate === date;
            });
        }

        this.displayAppointments(filtered);
    }

    clearFilters() {
        document.getElementById('patient-search').value = '';
        document.getElementById('gender-filter').value = '';
        document.getElementById('blood-group-filter').value = '';
        this.displayPatients(this.patients);
    }

    clearAppointmentFilters() {
        document.getElementById('appointment-status-filter').value = '';
        document.getElementById('department-filter').value = '';
        document.getElementById('appointment-date-filter').value = '';
        this.displayAppointments(this.appointments);
    }

    // Utility Methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    }

    setMinDateTime() {
        const now = new Date();
        const minDate = now.toISOString().split('T')[0];
        const minTime = now.toTimeString().split(' ')[0].substring(0, 5);

        // Set minimum date for appointment booking
        const dateInputs = [
            document.getElementById('book-appointment-date'),
            document.getElementById('modal-appointment-date')
        ];

        dateInputs.forEach(input => {
            if (input) input.min = minDate;
        });
    }

    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return '';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }

    formatStatus(status) {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    showTableLoading(elementId) {
        document.getElementById(elementId).innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    showTableError(elementId, message) {
        document.getElementById(elementId).innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </td>
            </tr>
        `;
    }

    getEmptyState(message, icon) {
        return `
            <div class="empty-state">
                <i class="fas fa-${icon}"></i>
                <h5>${message}</h5>
            </div>
        `;
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'danger');
    }

    showToast(message, type = 'info') {
        // Create toast if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
        toast.show();

        // Clean up after toast is hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    viewPatient(id) {
        // Implementation for viewing patient details
        console.log('View patient:', id);
    }

    viewAppointment(id) {
        // Implementation for viewing appointment details
        console.log('View appointment:', id);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PatientAppointmentSystem();
}); 