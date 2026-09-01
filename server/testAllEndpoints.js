require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const results = [];

function record(moduleName, method, endpoint, description, passed, status, note = '') {
  results.push({
    module: moduleName,
    method,
    endpoint,
    description,
    status,
    passed,
    note,
  });
  console.log(
    `[${passed ? 'PASS' : 'FAIL'}] [${method}] ${endpoint} - ${description} (Status: ${status})${note ? ` - ${note}` : ''}`
  );
}

async function runTests() {
  console.log('--- STARTING COMPLETE API INVENTORY TEST SUITE ---');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  const BASE_URL = 'http://localhost:5001';

  let citizenToken = '';
  let citizenUser = null;
  let officerToken = '';
  let officerUser = null;
  let adminToken = '';
  let adminUser = null;
  let testComplaintId = '';
  let testNotificationId = '';
  let createdOfficerId = '';
  let testUserIdToManage = '';

  const timestamp = Date.now();
  const citizenEmail = `citizen_${timestamp}@test.com`;
  const officerEmail = `officer_${timestamp}@test.com`;
  const adminEmail = `admin_${timestamp}@test.com`;

  try {
    // 0. ROOT
    {
      const res = await fetch(`${BASE_URL}/`);
      const data = await res.json();
      record('Root', 'GET', '/', 'API Health Check', res.status === 200 && data.success === true, res.status);
    }

    // 1. AUTH MODULE
    // 1.1 Register Citizen
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Citizen',
          email: citizenEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9876543210',
          role: 'citizen',
        }),
      });
      const data = await res.json();
      citizenToken = data.token;
      citizenUser = data.user;
      record('Auth', 'POST', '/api/auth/register', 'Register Citizen', res.status === 201 && !!citizenToken, res.status);
    }

    // 1.2 Register Duplicate Email
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Citizen',
          email: citizenEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9876543210',
        }),
      });
      record('Auth', 'POST', '/api/auth/register', 'Duplicate Registration (409 Conflict)', res.status === 409, res.status);
    }

    // 1.3 Register Validation Failure (Mismatch Password)
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mismatch Citizen',
          email: `mismatch_${timestamp}@test.com`,
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
          phone: '9876543210',
        }),
      });
      record('Auth', 'POST', '/api/auth/register', 'Password Mismatch (400 Bad Request)', res.status === 400, res.status);
    }

    // Register Officer for testing
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Officer',
          email: officerEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9876543211',
          role: 'officer',
        }),
      });
      const data = await res.json();
      officerToken = data.token;
      officerUser = data.user;
    }

    // Register Admin for testing
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Admin',
          email: adminEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9876543212',
          role: 'admin',
        }),
      });
      const data = await res.json();
      adminToken = data.token;
      adminUser = data.user;
    }

    // 1.4 Login Valid
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: citizenEmail,
          password: 'Password123!',
        }),
      });
      const data = await res.json();
      record('Auth', 'POST', '/api/auth/login', 'Login Valid Credentials', res.status === 200 && !!data.token, res.status);
    }

    // 1.5 Login Wrong Password
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: citizenEmail,
          password: 'WrongPassword!',
        }),
      });
      record('Auth', 'POST', '/api/auth/login', 'Login Wrong Password (401 Unauthorized)', res.status === 401, res.status);
    }

    // 1.6 Profile with valid JWT
    {
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const data = await res.json();
      record('Auth', 'GET', '/api/auth/profile', 'Get Profile with Valid JWT', res.status === 200 && data.user?.email === citizenEmail, res.status);
    }

    // 1.7 Profile without JWT
    {
      const res = await fetch(`${BASE_URL}/api/auth/profile`);
      record('Auth', 'GET', '/api/auth/profile', 'Get Profile without JWT (401 Unauthorized)', res.status === 401, res.status);
    }

    // 1.8 Logout
    {
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });
      record('Auth', 'POST', '/api/auth/logout', 'Logout User', res.status === 200, res.status);
    }

    // 1.9 Forgot Password
    {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: citizenEmail }),
      });
      record('Auth', 'POST', '/api/auth/forgot-password', 'Forgot Password Request', res.status === 200, res.status);
    }

    // 1.10 Verify Email Endpoint
    {
      // Retrieve stored verification token from DB directly for testing
      const User = require('./models/User');
      const u = await User.findOne({ email: citizenEmail });
      const token = u?.emailVerificationToken;
      const res = await fetch(`${BASE_URL}/api/auth/verify-email/${token}`);
      record('Auth', 'GET', '/api/auth/verify-email/:token', 'Verify Email with Token', res.status === 200, res.status);
    }

    // 1.11 Reset Password Endpoint
    {
      const User = require('./models/User');
      const crypto = require('crypto');
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      await User.findOneAndUpdate(
        { email: citizenEmail },
        { passwordResetToken: hashedToken, passwordResetExpire: Date.now() + 10 * 60 * 1000 }
      );

      const res = await fetch(`${BASE_URL}/api/auth/reset-password/${rawToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        }),
      });
      record('Auth', 'PUT', '/api/auth/reset-password/:token', 'Reset Password with Valid Token', res.status === 200, res.status);
    }

    // 2. GEMINI AI MODULE
    // 2.1 Analyze Complaint Valid
    {
      const res = await fetch(`${BASE_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Damaged road surface with large potholes',
          description: 'The main intersection has large potholes that are damaging vehicles and slowing down emergency traffic.',
        }),
      });
      const data = await res.json();
      record(
        'AI',
        'POST',
        '/api/ai/analyze',
        'Analyze Civic Complaint (Gemini / Heuristic)',
        res.status === 200 && data.success === true && !!data.data?.category,
        res.status,
        `Detected Category: ${data.data?.category}, Severity: ${data.data?.severity}`
      );
    }

    // 2.2 Analyze Complaint Validation Error
    {
      const res = await fetch(`${BASE_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Short', description: 'Too short' }),
      });
      record('AI', 'POST', '/api/ai/analyze', 'AI Validation Error on Short Text (400)', res.status === 400, res.status);
    }

    // 3. COMPLAINT MODULE
    // 3.1 Create Complaint (Multipart with Image buffer)
    {
      const formData = new FormData();
      formData.append('title', 'Dangerous pothole near metro station');
      formData.append('description', 'The road collapsed near gate 2 of metro station creating a deep hazardous crater.');
      formData.append('location[address]', 'Sector 18 Metro Gate 2');
      formData.append('location[latitude]', '28.5678');
      formData.append('location[longitude]', '77.3211');
      formData.append('category', 'Road Damage');
      formData.append('priority', 'High');
      formData.append('department', 'PWD');

      // 1x1 png image file
      const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      const blob = new Blob([pngBuffer], { type: 'image/png' });
      formData.append('image', blob, 'pothole.png');

      const res = await fetch(`${BASE_URL}/api/complaints/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: formData,
      });
      const data = await res.json();
      testComplaintId = data.complaint?._id;
      record(
        'Complaint',
        'POST',
        '/api/complaints/create',
        'Create Complaint with Cloudinary Image (Citizen)',
        res.status === 201 && !!testComplaintId && (data.complaint?.image ? data.complaint.image.includes('cloudinary') : true),
        res.status,
        `Cloudinary Image: ${data.complaint?.image ? 'OK' : 'None'}`
      );
    }

    // 3.2 Create Complaint Validation Failure
    {
      const formData = new FormData();
      formData.append('title', 'Bad');
      formData.append('description', 'Short');
      const res = await fetch(`${BASE_URL}/api/complaints/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: formData,
      });
      record('Complaint', 'POST', '/api/complaints/create', 'Create Complaint Validation Error (400)', res.status === 400, res.status);
    }

    // 3.3 Create Complaint Role Restriction (Officer cannot create citizen complaint)
    {
      const formData = new FormData();
      formData.append('title', 'Officer Trying To Create');
      formData.append('description', 'Officers should not be creating citizen complaints.');
      formData.append('location[address]', 'Somewhere');
      const res = await fetch(`${BASE_URL}/api/complaints/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${officerToken}` },
        body: formData,
      });
      record('Complaint', 'POST', '/api/complaints/create', 'Role Restricted to Citizen (403 Forbidden)', res.status === 403, res.status);
    }

    // 3.4 Get My Complaints (Citizen)
    {
      const res = await fetch(`${BASE_URL}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const data = await res.json();
      record('Complaint', 'GET', '/api/complaints/my', 'Get My Complaints (Citizen)', res.status === 200 && Array.isArray(data.complaints), res.status);
    }

    // 3.5 Get Complaint by ID
    {
      const res = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const data = await res.json();
      record('Complaint', 'GET', '/api/complaints/:id', 'Get Complaint By ID (Owner)', res.status === 200 && data.complaint?._id === testComplaintId, res.status);
    }

    // 3.6 Get All Complaints (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      record('Complaint', 'GET', '/api/complaints', 'Get All Complaints (Admin)', res.status === 200 && Array.isArray(data.complaints), res.status);
    }

    // 3.7 Get All Complaints Role Restriction (Citizen cannot access /api/complaints)
    {
      const res = await fetch(`${BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Complaint', 'GET', '/api/complaints', 'Get All Complaints Role Restriction (403 Forbidden)', res.status === 403, res.status);
    }

    // 3.8 Update Complaint (Admin/Officer)
    {
      const res = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'In Progress',
          remarks: 'Reviewed by admin. Assigned to road repair team.',
        }),
      });
      const data = await res.json();
      record('Complaint', 'PUT', '/api/complaints/:id', 'Update Complaint (Admin)', res.status === 200 && data.complaint?.status === 'In Progress', res.status);
    }

    // 3.9 Complaint Statistics (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/complaints/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      record('Complaint', 'GET', '/api/complaints/stats', 'Get Complaint Statistics (Admin)', res.status === 200 && !!data.stats, res.status);
    }

    // 4. NOTIFICATION MODULE
    // 4.1 Create Notification
    {
      const res = await fetch(`${BASE_URL}/api/notifications/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: citizenUser.id,
          title: 'Road Maintenance Update',
          message: 'Maintenance team has been dispatched to Sector 18.',
          type: 'Complaint Updated',
          complaint: testComplaintId,
        }),
      });
      const data = await res.json();
      testNotificationId = data.notification?._id;
      record('Notification', 'POST', '/api/notifications/create', 'Create Notification', res.status === 201 && !!testNotificationId, res.status);
    }

    // 4.2 Get Notifications
    {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const data = await res.json();
      record('Notification', 'GET', '/api/notifications', 'Get User Notifications', res.status === 200 && Array.isArray(data.notifications), res.status);
    }

    // 4.3 Get Notification by ID
    {
      const res = await fetch(`${BASE_URL}/api/notifications/${testNotificationId}`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Notification', 'GET', '/api/notifications/:id', 'Get Notification by ID', res.status === 200, res.status);
    }

    // 4.4 Mark Notification as Read
    {
      const res = await fetch(`${BASE_URL}/api/notifications/${testNotificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Notification', 'PUT', '/api/notifications/:id/read', 'Mark Notification as Read', res.status === 200, res.status);
    }

    // 4.5 Mark All Notifications Read
    {
      const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Notification', 'PUT', '/api/notifications/read-all', 'Mark All Notifications Read', res.status === 200, res.status);
    }

    // 4.6 Delete Single Notification
    {
      const res = await fetch(`${BASE_URL}/api/notifications/${testNotificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Notification', 'DELETE', '/api/notifications/:id', 'Delete Notification by ID', res.status === 200, res.status);
    }

    // 4.7 Delete All Notifications
    {
      const res = await fetch(`${BASE_URL}/api/notifications/delete-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Notification', 'DELETE', '/api/notifications/delete-all', 'Delete All Notifications', res.status === 200, res.status);
    }

    // 5. DASHBOARD MODULE
    // 5.1 Citizen Dashboard
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/citizen`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const data = await res.json();
      record('Dashboard', 'GET', '/api/dashboard/citizen', 'Get Citizen Dashboard Data', res.status === 200 && data.data?.totalComplaintsSubmitted !== undefined, res.status);
    }

    // 5.2 Officer Dashboard
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/officer`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      const data = await res.json();
      record('Dashboard', 'GET', '/api/dashboard/officer', 'Get Officer Dashboard Data', res.status === 200 && data.data?.totalAssignedComplaints !== undefined, res.status);
    }

    // 5.3 Admin Dashboard
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      record('Dashboard', 'GET', '/api/dashboard/admin', 'Get Admin Dashboard Data', res.status === 200 && data.data?.totalComplaints !== undefined, res.status);
    }

    // 5.4 Dashboard Recent Complaints
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/recent`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Dashboard', 'GET', '/api/dashboard/recent', 'Get Recent Complaints Activity', res.status === 200, res.status);
    }

    // 5.5 Dashboard Analytics (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      record('Dashboard', 'GET', '/api/dashboard/analytics', 'Get Dashboard Analytics (Admin)', res.status === 200 && Array.isArray(data.data?.categoryWise), res.status);
    }

    // 5.6 Dashboard Activity
    {
      const res = await fetch(`${BASE_URL}/api/dashboard/activity`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      record('Dashboard', 'GET', '/api/dashboard/activity', 'Get Dashboard Activity Feed', res.status === 200, res.status);
    }

    // 6. ADMIN OPERATIONS (Assign Complaint & Manage)
    // 6.1 Assign Complaint to Officer
    {
      const res = await fetch(`${BASE_URL}/api/admin/complaints/${testComplaintId}/assign`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ officerId: officerUser.id }),
      });
      const data = await res.json();
      record('Admin', 'PUT', '/api/admin/complaints/:id/assign', 'Assign Complaint to Officer (Admin)', res.status === 200 && data.complaint?.assignedOfficer === officerUser.id, res.status);
    }

    // 6.2 Get Admin Complaints List
    {
      const res = await fetch(`${BASE_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/complaints', 'Get Admin Complaints List', res.status === 200, res.status);
    }

    // 6.3 Get Admin Complaint Details
    {
      const res = await fetch(`${BASE_URL}/api/admin/complaints/${testComplaintId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/complaints/:id', 'Get Admin Complaint Details', res.status === 200, res.status);
    }

    // 6.4 Update Complaint Status by Admin
    {
      const res = await fetch(`${BASE_URL}/api/admin/complaints/${testComplaintId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      record('Admin', 'PUT', '/api/admin/complaints/:id/status', 'Update Complaint Status (Admin)', res.status === 200, res.status);
    }

    // 6.5 Admin Statistics
    {
      const res = await fetch(`${BASE_URL}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/statistics', 'Get Admin Statistics', res.status === 200, res.status);
    }

    // 6.6 Admin Recent Users
    {
      const res = await fetch(`${BASE_URL}/api/admin/recent-users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/recent-users', 'Get Recent Users (Admin)', res.status === 200, res.status);
    }

    // 6.7 Admin Recent Complaints
    {
      const res = await fetch(`${BASE_URL}/api/admin/recent-complaints`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/recent-complaints', 'Get Recent Complaints (Admin)', res.status === 200, res.status);
    }

    // 6.8 Admin System Health
    {
      const res = await fetch(`${BASE_URL}/api/admin/system-health`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/system-health', 'Get System Health Report (Admin)', res.status === 200, res.status);
    }

    // 6.9 Create Officer via Admin
    {
      const res = await fetch(`${BASE_URL}/api/admin/officers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Created Officer',
          email: `created_officer_${timestamp}@test.com`,
          password: 'Password123!',
          phone: '9876543299',
          department: 'Electricity Department',
        }),
      });
      const data = await res.json();
      createdOfficerId = data.officer?.id;
      record('Admin', 'POST', '/api/admin/officers', 'Create Officer Account (Admin)', res.status === 201 && !!createdOfficerId, res.status);
    }

    // 6.10 Get All Officers
    {
      const res = await fetch(`${BASE_URL}/api/admin/officers`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/officers', 'Get All Officers (Admin)', res.status === 200, res.status);
    }

    // 6.11 Get Officer By ID
    {
      const res = await fetch(`${BASE_URL}/api/admin/officers/${createdOfficerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/officers/:id', 'Get Officer By ID (Admin)', res.status === 200, res.status);
    }

    // 6.12 Update Officer By ID
    {
      const res = await fetch(`${BASE_URL}/api/admin/officers/${createdOfficerId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Officer Name', phone: '9998887776' }),
      });
      record('Admin', 'PUT', '/api/admin/officers/:id', 'Update Officer Details (Admin)', res.status === 200, res.status);
    }

    // 6.13 Delete Officer By ID
    {
      const res = await fetch(`${BASE_URL}/api/admin/officers/${createdOfficerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'DELETE', '/api/admin/officers/:id', 'Delete Officer (Admin)', res.status === 200, res.status);
    }

    // 6.14 Get All Users (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      testUserIdToManage = data.users?.find((u) => u.email === citizenEmail)?.id;
      record('Admin', 'GET', '/api/admin/users', 'Get All Users (Admin)', res.status === 200, res.status);
    }

    // 6.15 Get User Details (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserIdToManage}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'GET', '/api/admin/users/:id', 'Get User By ID (Admin)', res.status === 200, res.status);
    }

    // 6.16 Update User By ID (Admin)
    {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserIdToManage}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: '9111222333' }),
      });
      record('Admin', 'PUT', '/api/admin/users/:id', 'Update User Details (Admin)', res.status === 200, res.status);
    }

    // 6.17 Block User
    {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserIdToManage}/block`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'PATCH', '/api/admin/users/:id/block', 'Block User (Admin)', res.status === 200, res.status);
    }

    // 6.18 Unblock User
    {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserIdToManage}/unblock`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'PATCH', '/api/admin/users/:id/unblock', 'Unblock User (Admin)', res.status === 200, res.status);
    }

    // 7. OFFICER OPERATIONS
    // 7.1 Officer Dashboard
    {
      const res = await fetch(`${BASE_URL}/api/officer/dashboard`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      const data = await res.json();
      record('Officer', 'GET', '/api/officer/dashboard', 'Officer Dashboard Metrics', res.status === 200 && data.data?.totalAssigned !== undefined, res.status);
    }

    // 7.2 Officer Assigned Complaints
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      const data = await res.json();
      record('Officer', 'GET', '/api/officer/complaints', 'List Officer Assigned Complaints', res.status === 200 && Array.isArray(data.complaints), res.status);
    }

    // 7.3 Get Assigned Complaint Detail
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      record('Officer', 'GET', '/api/officer/complaints/:id', 'Get Complaint Assigned to Officer', res.status === 200, res.status);
    }

    // 7.4 Officer Add Note
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}/note`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${officerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: 'Field inspection completed. Road roller deployed.' }),
      });
      record('Officer', 'PUT', '/api/officer/complaints/:id/note', 'Officer Add Note', res.status === 200, res.status);
    }

    // 7.5 Officer Mark Visited
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}/location-visit`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      record('Officer', 'PUT', '/api/officer/complaints/:id/location-visit', 'Officer Mark Location Visited', res.status === 200, res.status);
    }

    // 7.6 Officer Update Priority
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}/priority`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${officerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: 'Critical' }),
      });
      record('Officer', 'PUT', '/api/officer/complaints/:id/priority', 'Officer Update Priority', res.status === 200, res.status);
    }

    // 7.7 Officer Upload Proof Photos
    {
      const formData = new FormData();
      const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      const blob1 = new Blob([pngBuffer], { type: 'image/png' });
      const blob2 = new Blob([pngBuffer], { type: 'image/png' });
      formData.append('before', blob1, 'before.png');
      formData.append('after', blob2, 'after.png');

      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}/upload-proof`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${officerToken}` },
        body: formData,
      });
      record('Officer', 'PUT', '/api/officer/complaints/:id/upload-proof', 'Officer Upload Proof Photos (Cloudinary)', res.status === 200, res.status);
    }

    // 7.8 Officer Update Status to Resolved
    {
      const res = await fetch(`${BASE_URL}/api/officer/complaints/${testComplaintId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${officerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Resolved',
          resolutionNote: 'Pothole fully repaired and leveled with fresh asphalt.',
        }),
      });
      const data = await res.json();
      record('Officer', 'PUT', '/api/officer/complaints/:id/status', 'Officer Update Status to Resolved', res.status === 200 && data.complaint?.status === 'Resolved', res.status);
    }

    // 7.9 Officer Profile
    {
      const res = await fetch(`${BASE_URL}/api/officer/profile`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      record('Officer', 'GET', '/api/officer/profile', 'Get Officer Profile', res.status === 200, res.status);
    }

    // 7.10 Officer Performance
    {
      const res = await fetch(`${BASE_URL}/api/officer/performance`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      const data = await res.json();
      record('Officer', 'GET', '/api/officer/performance', 'Get Officer Performance Analytics', res.status === 200 && data.data?.totalAssigned !== undefined, res.status);
    }

    // 7.11 Officer Notifications
    {
      const res = await fetch(`${BASE_URL}/api/officer/notifications`, {
        headers: { Authorization: `Bearer ${officerToken}` },
      });
      record('Officer', 'GET', '/api/officer/notifications', 'Get Officer Notifications', res.status === 200, res.status);
    }

    // 8. FIREBASE DEVICE TOKENS MODULE
    // 8.1 Register Device Token
    {
      const res = await fetch(`${BASE_URL}/api/firebase/register-device`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${citizenToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceToken: 'fcm_sample_token_123456' }),
      });
      record('Firebase', 'POST', '/api/firebase/register-device', 'Register Firebase Device Token', res.status === 200, res.status);
    }

    // 8.2 Remove Device Token
    {
      const res = await fetch(`${BASE_URL}/api/firebase/remove-device`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${citizenToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceToken: 'fcm_sample_token_123456' }),
      });
      record('Firebase', 'POST', '/api/firebase/remove-device', 'Remove Firebase Device Token', res.status === 200, res.status);
    }

    // 9. CLEANUP / ADMIN DELETE OPERATIONS
    // 9.1 Admin Delete Complaint
    {
      const res = await fetch(`${BASE_URL}/api/admin/complaints/${testComplaintId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'DELETE', '/api/admin/complaints/:id', 'Permanently Delete Complaint (Admin)', res.status === 200, res.status);
    }

    // 9.2 Admin Delete User
    {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserIdToManage}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Admin', 'DELETE', '/api/admin/users/:id', 'Permanently Delete User (Admin)', res.status === 200, res.status);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('\n--- TEST SUITE EXECUTION COMPLETED ---');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`SUMMARY: Total Tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
