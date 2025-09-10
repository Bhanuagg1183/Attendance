# Attendance Management System

## Project Requirements

### Core Features

#### Facial Attendance Marking:

Open device camera through the BOLT app.

Capture live image of the user.

Run facial recognition model (e.g., OpenCV + pretrained model or custom CNN) to verify identity.

Mark attendance if the face is authenticated.

#### Attendance History Dashboard:

Store attendance records in a database (MySQL / Firebase / MongoDB).

Display daily, weekly, and monthly logs inside the BOLT app.

Option to filter history by date, time, or employee/student name.

#### Real-Time Updates:

Sync attendance data instantly after marking.

Notify users with a confirmation message ("Attendance Marked Successfully").

### Tech Stack & Tools

Frontend/App Layer: BOLT IoT App (for user interface, camera access, and interaction).

Backend API: Python/Flask or Node.js server to handle image verification and database operations.

Database: Firebase Realtime DB or MySQL to store user profiles & attendance logs.

Facial Recognition: OpenCV, dlib, or TensorFlow/PyTorch-based model.

Integration: REST APIs connecting BOLT app to backend services.

### Additional Features 

Geofencing: Allow marking attendance only within office/class premises.

Multi-user roles: Admin (view all logs), User (view only personal history).

Export reports: Attendance logs downloadable as CSV/Excel.

Offline mode: Cache attendance when offline, sync later.

### Expected Outcome

A working attendance management system accessible through the BOLT app.

Users can mark attendance by face recognition and view their attendance history anytime.

Admins can monitor, filter, and export attendance data efficiently.










Based on your requirements, I'll create a comprehensive Attendance Management System as a web application that demonstrates all the core functionality you've outlined. Since we're working in a web environment, I'll build this as a progressive web app 
