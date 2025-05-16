# Slash - Pentester Dashboard PRD

## 1. Introduction

### 1.1 Purpose
This Product Requirements Document (PRD) outlines the specifications and requirements for the Pentester Dashboard module of the Slash application. The Pentester Dashboard is designed to provide pentesters with a streamlined interface to manage their assigned pentests, report vulnerabilities, and interact with clients.

### 1.2 Product Overview
Slash is a vulnerability reporting dashboard that facilitates communication between pentesters and clients. The application has three primary user roles:
1. **Admin**: Manages the entire platform, users, and pentests
2. **Clients**: View pentests and vulnerability reports for their assets
3. **Pentesters**: Conduct pentests and report vulnerabilities

The Pentester Dashboard is specifically designed for the third role, providing pentesters with the tools they need to efficiently perform their work.

### 1.3 Scope
This PRD covers the Pentester Dashboard module, which includes:
- Authentication and user management
- Dashboard overview and metrics
- Assigned pentests management
- Vulnerability reporting and management
- Client interaction
- User settings and profile management

## 2. User Personas

### 2.1 Primary User: Pentester
- **Background**: Security professional with expertise in identifying vulnerabilities
- **Goals**: 
  - Efficiently manage assigned pentests
  - Report vulnerabilities accurately and comprehensively
  - Track progress and performance metrics
  - Communicate effectively with clients
- **Pain Points**:
  - Complex interfaces that slow down reporting
  - Lack of visibility into pentest status and metrics
  - Difficulty in managing multiple pentests simultaneously
  - Inefficient communication channels with clients

## 3. Feature Requirements

### 3.1 Authentication

#### 3.1.1 Login
- Pentesters will use the same authentication system as the admin dashboard
- Support for two-factor authentication
- Secure session management

#### 3.1.2 Password Management
- Ability to change password
- Password reset functionality

### 3.2 Dashboard

#### 3.2.1 Overview Metrics
- Display key performance indicators:
  - Number of scheduled pentests
  - Total assigned pentests
  - Average CVSS score
  - Ongoing pentests with details
  - Total vulnerabilities by severity
  - Critical vulnerabilities count
  - Pentester rank

#### 3.2.2 Latest Activities
- Show recent activities related to the pentester's work
- Include timestamp, activity type, and relevant details
- Filter activities by type and date

#### 3.2.3 Visualization
- Implement charts for vulnerability distribution by severity
- Display pentest progress and status visually

### 3.3 Assigned Pentests

#### 3.3.1 Pentest List
- Display all pentests assigned to the pentester
- Include key information: name, type, status, dates, service, client
- Support sorting and filtering options

#### 3.3.2 Pentest Details
- View comprehensive details of a specific pentest:
  - Basic information (name, type, dates, status, service)
  - Assets to be tested
  - Testing credentials
  - Additional notes
  - Attachments
  - Client information
  - Vulnerability count

#### 3.3.3 Client Information
- Access to assigned clients' details
- View client-specific information relevant to pentests

### 3.4 Vulnerability Management

#### 3.4.1 Vulnerability List
- Display all vulnerabilities reported for a specific pentest
- Include severity, title, affected host, and status
- Support sorting and filtering by various criteria

#### 3.4.2 Add Vulnerability
- Form to add new vulnerabilities with fields:
  - Affected host
  - Title
  - Description (rich text editor)
  - Severity
  - CVSS metrics
  - Impact
  - Likelihood
  - Recommended solution (rich text editor)
  - Steps to reproduce (rich text editor)
  - Attachments

#### 3.4.3 Edit Vulnerability
- Ability to edit existing vulnerability details
- Maintain the same fields as the add vulnerability form

#### 3.4.4 View Vulnerability
- Detailed view of a specific vulnerability
- Display all vulnerability information
- Show comments and activity history

#### 3.4.5 Comments
- Add comments to vulnerabilities
- Support for internal comments (visible only to pentesters and admins)
- Attach files to comments

#### 3.4.6 Status Management
- Change vulnerability status
- Track status changes over time

### 3.5 Settings

#### 3.5.1 Profile Management
- Update personal information:
  - Name
  - Email
  - Profile picture
  - Password

#### 3.5.2 Notification Preferences
- Configure notification settings:
  - Comment notifications
  - Status change notifications
  - Vulnerability alerts
  - Login notifications
  - Report comment notifications

## 4. Technical Requirements

### 4.1 API Endpoints

#### 4.1.1 Authentication
- Use existing authentication endpoints

#### 4.1.2 Dashboard
- `GET /api/pentester/dashboard`: Retrieve dashboard metrics
- `GET /api/pentester/latest-activities`: Get latest activities

#### 4.1.3 Pentests
- `GET /api/pentester/assigned-pentests`: List all assigned pentests
- `GET /api/pentester/assigned-pentests/:id`: Get details of a specific pentest

#### 4.1.4 Clients
- `GET /api/pentester/assigned-clients`: List all assigned clients
- `GET /api/pentester/assigned-clients/:id`: Get details of a specific client

#### 4.1.5 Vulnerabilities
- `GET /api/pentester/pentests/:pentestId/vulnerabilities`: List all vulnerabilities for a pentest
- `GET /api/pentester/pentests/:pentestId/vulnerabilities/:id`: Get details of a specific vulnerability
- `POST /api/pentester/pentests/:pentestId/vulnerability`: Add a new vulnerability
- `PUT /api/pentester/pentests/:pentestId/vulnerability/:id`: Update an existing vulnerability
- `POST /api/pentester/pentests/:pentestId/vulnerability/:id/comment`: Add a comment to a vulnerability
- `PUT /api/pentester/pentests/:pentestId/vulnerability/:id/status`: Update vulnerability status

#### 4.1.6 Settings
- `PUT /api/user`: Update user profile
- `PUT /api/change-password`: Change password
- `POST /api/upload-profile-picture`: Upload profile picture

### 4.2 Frontend Components

#### 4.2.1 Navigation
- Sidebar with links to:
  - Dashboard
  - Pentests
  - Vulnerability Reports
  - Client Lists
  - Settings
  - Logout

#### 4.2.2 Dashboard Components
- Metrics cards
- Activity feed
- Charts and visualizations

#### 4.2.3 Pentest Components
- Pentest list table
- Pentest detail view
- Client information cards

#### 4.2.4 Vulnerability Components
- Vulnerability list table
- Vulnerability form (add/edit)
- Vulnerability detail view
- Comment section
- Status change controls

#### 4.2.5 Settings Components
- Profile form
- Password change form
- Notification preferences toggles
- Profile picture upload

## 5. User Interface

### 5.1 Design Guidelines
- Consistent with existing Slash design system
- Clean, intuitive interface
- Responsive design for various screen sizes
- Accessibility compliance

### 5.2 Key Screens
- Login screen
- Dashboard overview
- Assigned pentests list
- Pentest detail view
- Vulnerability list
- Add/edit vulnerability form
- Vulnerability detail view
- Settings page

## 6. Non-Functional Requirements

### 6.1 Performance
- Dashboard should load within 2 seconds
- Vulnerability form submission should process within 3 seconds
- Smooth transitions between screens

### 6.2 Security
- All API endpoints must require authentication
- Sensitive data must be encrypted
- CSRF protection for all forms
- Rate limiting for API endpoints
- Input validation for all user inputs

### 6.3 Scalability
- Support for multiple concurrent pentesters
- Efficient handling of pentests with numerous vulnerabilities
- Optimized database queries for performance

### 6.4 Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and tablet devices

## 7. Implementation Considerations

### 7.1 Integration Points
- Integration with existing authentication system
- Integration with admin dashboard for data consistency
- Integration with client dashboard for communication

### 7.2 Data Migration
- No data migration required for new implementation

### 7.3 Dependencies
- Existing backend API services
- Frontend component library
- Rich text editor for vulnerability descriptions

## 8. Rollout Strategy

### 8.1 Development Phases
1. **Phase 1**: Core dashboard and pentest management
2. **Phase 2**: Vulnerability reporting and management
3. **Phase 3**: Settings and profile management
4. **Phase 4**: Enhanced visualizations and metrics

### 8.2 Testing Strategy
- Unit testing for all components
- Integration testing for API endpoints
- User acceptance testing with selected pentesters
- Security testing for vulnerability management

### 8.3 Launch Plan
- Beta release to selected pentesters
- Feedback collection and iteration
- Full release to all pentesters
- Post-launch monitoring and support

## 9. Success Metrics

### 9.1 Key Performance Indicators
- Pentester adoption rate
- Time to report vulnerabilities
- Number of vulnerabilities reported
- Quality of vulnerability reports (measured by client feedback)
- System performance metrics

### 9.2 Monitoring Plan
- Track usage patterns and feature adoption
- Monitor system performance
- Collect user feedback
- Regular review of success metrics

## 10. Future Enhancements

### 10.1 Potential Features for Future Releases
- Advanced reporting and analytics
- Vulnerability templates for common issues
- Integration with vulnerability scanning tools
- Collaborative features for pentester teams
- Mobile application for on-the-go reporting
- AI-assisted vulnerability classification and remediation suggestions

## Appendix A: API Response Examples

### Dashboard Metrics
```json
{
  "scheduled_pentests_count": 1,
  "total_assigned_pentests": 2,
  "average_cvss_score": "7.73",
  "Ongoing_pentests": [
    {
      "id": "682516337c1600a53a87f3c6",
      "name": "Pentester Competition 2",
      "start_date": "2025-05-14T19:00:00.000Z",
      "end_date": "2025-05-19T19:00:00.000Z",
      "total_vulnerabilities": 4,
      "vulnerability_counts": {
        "Critical": 1,
        "High": 0,
        "Medium": 1,
        "Low": 2
      }
    }
  ],
  "total_vulnerabilities": {
    "Critical": 1,
    "High": 0,
    "Medium": 1,
    "Low": 1,
    "Total": 3
  },
  "Critical_vulnerabilities_count": 1,
  "pentester_rank": 1
}
```

### Assigned Pentests
```json
[
  {
    "_id": "682516337c1600a53a87f3c6",
    "name": "Pentester Competition 2",
    "type": "black-box",
    "status": "Ongoing",
    "startDate": "2025-05-14T19:00:00.000Z",
    "endDate": "2025-05-19T19:00:00.000Z",
    "service": "Mobile App Pentest",
    "decision": "Approved",
    "clients": [
      {
        "_id": "68251233813770125017fb04",
        "name": "BYKEA LLC",
        "logoUrl": "https://slash-avatars.s3.us-east-1.amazonaws.com/company-logos/f9ab94de-0c6a-4c73-8bb0-d52e3d80370e-bykea.png"
      }
    ],
    "vulnerabilityCount": 4,
    "pentesters": [
      {
        "_id": "68251258813770125017fb1b",
        "email": "spoftware+pentester@gmail.com",
        "name": "Ashir Pentester",
        "profilePicture": "https://slash-avatars.s3.us-east-1.amazonaws.com/profile-photos/5cea5cac-7985-4214-9d9d-c42f866349e1-333fabcd-f105-488a-9ed5-ee9fae45fcee-ahsan-pic.jpeg"
      }
    ]
  }
]
```
