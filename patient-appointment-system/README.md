# Patient Appointment Management System

A comprehensive web-based Patient Appointment Management System built with Spring Boot (backend) and modern web technologies (frontend).

## 🏥 Features

### Patient Management
- ✅ Register new patients with complete medical information
- ✅ View and search patients by name, email, phone
- ✅ Filter patients by gender, blood group
- ✅ Edit patient details and medical history
- ✅ Track patient allergies and emergency contacts

### Appointment Management
- ✅ Book appointments with doctors
- ✅ View all appointments with filtering options
- ✅ Update appointment status (Scheduled, Confirmed, In Progress, Completed, Cancelled)
- ✅ Cancel appointments
- ✅ Track appointment history
- ✅ Doctor availability checking

### Dashboard
- ✅ Real-time statistics (Total patients, appointments, today's schedule)
- ✅ Recent activity tracking
- ✅ Upcoming appointments overview
- ✅ System performance metrics

### User Interface
- ✅ Modern, responsive design with Bootstrap 5
- ✅ Mobile-friendly interface
- ✅ Interactive forms with validation
- ✅ Real-time notifications
- ✅ Intuitive navigation

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.2.0** - Application framework
- **Spring Data JPA** - Data persistence
- **Spring Security** - Authentication and authorization
- **H2 Database** - In-memory database (development)
- **MySQL** - Production database
- **Maven** - Dependency management
- **Java 17** - Programming language

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with custom CSS variables
- **JavaScript ES6+** - Client-side logic
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

## 📁 Project Structure

```
patient-appointment-system/
├── backend/
│   ├── src/main/java/com/hospital/
│   │   ├── PatientAppointmentSystemApplication.java
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── PatientController.java
│   │   │   └── AppointmentController.java
│   │   ├── model/
│   │   │   ├── Patient.java
│   │   │   └── Appointment.java
│   │   ├── repository/
│   │   │   ├── PatientRepository.java
│   │   │   └── AppointmentRepository.java
│   │   └── service/
│   │       ├── PatientService.java
│   │       └── AppointmentService.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Modern web browser
- (Optional) MySQL for production

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-appointment-system/backend
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on http://localhost:8080

4. **Access H2 Database Console** (Development)
   - URL: http://localhost:8080/api/h2-console
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: (leave empty)

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd patient-appointment-system/frontend
   ```

2. **Serve the frontend**
   
   **Option 1: Using Live Server (VS Code Extension)**
   - Install Live Server extension in VS Code
   - Right-click on `index.html` → "Open with Live Server"
   - Frontend will open at http://127.0.0.1:5500

   **Option 2: Using Python HTTP Server**
   ```bash
   python -m http.server 5500
   ```

   **Option 3: Using Node.js HTTP Server**
   ```bash
   npx http-server -p 5500
   ```

### Production Setup (MySQL)

1. **Install MySQL** and create database:
   ```sql
   CREATE DATABASE patient_appointment_db;
   CREATE USER 'hospital_user'@'localhost' IDENTIFIED BY 'hospital_password';
   GRANT ALL PRIVILEGES ON patient_appointment_db.* TO 'hospital_user'@'localhost';
   ```

2. **Update application.yml** with production profile:
   ```bash
   mvn spring-boot:run -Dspring.profiles.active=production
   ```

   Or set environment variables:
   ```bash
   export DB_USERNAME=hospital_user
   export DB_PASSWORD=hospital_password
   mvn spring-boot:run -Dspring.profiles.active=production
   ```

## 📚 API Documentation

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| GET | `/api/patients/{id}` | Get patient by ID |
| GET | `/api/patients/search?name={name}` | Search patients by name |
| GET | `/api/patients/email/{email}` | Get patient by email |
| GET | `/api/patients/phone/{phone}` | Get patient by phone |
| GET | `/api/patients/gender/{gender}` | Get patients by gender |
| GET | `/api/patients/blood-group/{bloodGroup}` | Get patients by blood group |
| GET | `/api/patients/stats/total` | Get total patient count |
| GET | `/api/patients/recent?days={days}` | Get recent patients |
| POST | `/api/patients` | Create new patient |
| PUT | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/{id}` | Get appointment by ID |
| GET | `/api/appointments/patient/{patientId}` | Get appointments by patient |
| GET | `/api/appointments/doctor/{doctorName}` | Get appointments by doctor |
| GET | `/api/appointments/department/{department}` | Get appointments by department |
| GET | `/api/appointments/status/{status}` | Get appointments by status |
| GET | `/api/appointments/upcoming` | Get upcoming appointments |
| GET | `/api/appointments/today` | Get today's appointments |
| GET | `/api/appointments/between?start={start}&end={end}` | Get appointments between dates |
| GET | `/api/appointments/doctors` | Get all doctor names |
| GET | `/api/appointments/departments` | Get all departments |
| GET | `/api/appointments/stats/total` | Get total appointment count |
| GET | `/api/appointments/overdue` | Get overdue appointments |
| POST | `/api/appointments` | Create new appointment |
| PUT | `/api/appointments/{id}` | Update appointment |
| PATCH | `/api/appointments/{id}/status?status={status}` | Update appointment status |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment |
| DELETE | `/api/appointments/{id}` | Delete appointment |

### Request/Response Examples

**Create Patient:**
```json
POST /api/patients
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "address": "123 Main St, City, State",
  "bloodGroup": "O+",
  "allergies": "None",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "0987654321"
}
```

**Create Appointment:**
```json
POST /api/appointments
{
  "patient": {"id": 1},
  "doctorName": "Dr. Smith",
  "department": "Cardiology",
  "appointmentDateTime": "2024-01-20T10:00:00",
  "appointmentType": "CONSULTATION",
  "symptoms": "Chest pain",
  "fee": 150.00
}
```

## 🔧 Configuration

### Application Properties

The application can be configured through `application.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password: 
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true

cors:
  allowed-origins: "http://localhost:3000,http://127.0.0.1:5500"
```

### Environment Variables

For production deployment:
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `SPRING_PROFILES_ACTIVE` - Active profile (production)

## 🎨 UI Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode support
- Screen reader friendly

### User Experience
- Real-time form validation
- Loading states and feedback
- Error handling with user-friendly messages
- Smooth animations and transitions

## 🧪 Testing

### Manual Testing
1. Start the backend server
2. Open the frontend in a browser
3. Test each feature:
   - Patient registration
   - Appointment booking
   - Data filtering and search
   - CRUD operations

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Get all patients
curl -X GET http://localhost:8080/api/patients

# Create a patient
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@email.com","phone":"1234567890","dateOfBirth":"1990-01-15","gender":"Male"}'
```

## 🔒 Security

### Current Implementation
- CORS configuration for cross-origin requests
- CSRF protection disabled for API endpoints
- Basic authentication setup (can be extended)

### Production Recommendations
- Implement JWT authentication
- Add role-based access control
- Enable HTTPS
- Add rate limiting
- Implement audit logging

## 🚀 Deployment

### Development
- H2 in-memory database
- Spring Boot DevTools for hot reload
- Embedded Tomcat server

### Production
- MySQL database
- Build optimized JAR file
- Docker containerization (recommended)
- Cloud deployment (AWS, Azure, GCP)

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/patient-appointment-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Patient management
- Appointment scheduling
- Dashboard with statistics
- Responsive web interface
- REST API
- H2 and MySQL support

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Doctor management module
- [ ] Billing and payments
- [ ] Reports and analytics
- [ ] Multi-language support
- [ ] Mobile app (React Native/Flutter)
- [ ] Integration with external systems
- [ ] Advanced scheduling algorithms

---

**Built with ❤️ for healthcare management** 