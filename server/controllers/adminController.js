const {
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  setUserActiveStatus,
  createOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  getComplaints,
  getComplaintById,
  assignComplaintToOfficer,
  updateComplaintStatus,
  deleteComplaint,
  getAdminStatistics,
  getRecentUsers,
  getRecentComplaints,
  getSystemHealth,
  createActivityLog,
} = require("../services/adminService");
const User = require("../models/User");

// Get all users with pagination, search, and filters.
const getAllUsers = async (req, res) => {
  try {
    const result = await getUsers(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching users." });
  }
};

// Get a single user by ID.
const getUserById = async (req, res) => {
  try {
    const user = await getUserDetail(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching user details." });
  }
};

// Update a user's details.
const updateUserById = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      phone: req.body.phone,
      role: req.body.role,
      isActive: req.body.isActive,
    };

    const user = await updateUser(req.params.id, payload);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or invalid data." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "User Updated",
      message: `User ${user.email} was updated by admin ${req.user.email}.`,
      type: "General",
    });

    return res.status(200).json({ success: true, message: "User updated successfully.", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({ success: false, message: "Server error while updating user." });
  }
};

// Delete a user by ID.
const removeUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    }

    const deleted = await deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "User Deleted",
      message: `User with id ${req.params.id} was deleted by admin ${req.user.email}.`,
      type: "User Deleted",
    });

    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while deleting user." });
  }
};

// Block a user by setting isActive=false.
const blockUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot block your own admin account." });
    }

    const user = await setUserActiveStatus(req.params.id, false);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "User Blocked",
      message: `User ${user.email} was blocked by admin ${req.user.email}.`,
      type: "General",
    });

    return res.status(200).json({ success: true, message: "User blocked successfully.", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while blocking user." });
  }
};

// Unblock a user by setting isActive=true.
const unblockUser = async (req, res) => {
  try {
    const user = await setUserActiveStatus(req.params.id, true);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "User Unblocked",
      message: `User ${user.email} was unblocked by admin ${req.user.email}.`,
      type: "General",
    });

    return res.status(200).json({ success: true, message: "User unblocked successfully.", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while unblocking user." });
  }
};

// Create a new officer account.
const createOfficerAccount = async (req, res) => {
  try {
    const officer = await createOfficer(req.body);

    await createActivityLog({
      user: req.user._id,
      title: "Officer Created",
      message: `Officer ${officer.email} was created by admin ${req.user.email}.`,
      type: "Officer Created",
    });

    return res.status(201).json({ success: true, message: "Officer account created successfully.", officer });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message || "Server error while creating officer." });
  }
};

// Get all officers.
const getAllOfficers = async (req, res) => {
  try {
    const officers = await getOfficers();
    return res.status(200).json({ success: true, count: officers.length, officers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching officers." });
  }
};

// Get officer details.
const getOfficer = async (req, res) => {
  try {
    const officer = await getOfficerById(req.params.id);
    if (!officer) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }
    return res.status(200).json({ success: true, officer });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching officer details." });
  }
};

// Update an officer's profile.
const updateOfficerById = async (req, res) => {
  try {
    const officer = await updateOfficer(req.params.id, req.body);
    if (!officer) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "Officer Updated",
      message: `Officer ${officer.email} was updated by admin ${req.user.email}.`,
      type: "General",
    });

    return res.status(200).json({ success: true, message: "Officer updated successfully.", officer });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating officer." });
  }
};

// Delete an officer account.
const removeOfficer = async (req, res) => {
  try {
    const deleted = await deleteOfficer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "Officer Removed",
      message: `Officer with id ${req.params.id} was removed by admin ${req.user.email}.`,
      type: "Officer Removed",
    });

    return res.status(200).json({ success: true, message: "Officer deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while deleting officer." });
  }
};

// Get all complaints with filters and pagination.
const getAllComplaints = async (req, res) => {
  try {
    const result = await getComplaints(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching complaints." });
  }
};

// Get complaint details.
const getComplaintDetails = async (req, res) => {
  try {
    const complaint = await getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }
    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching complaint details." });
  }
};

// Assign complaint to an officer.
const assignComplaint = async (req, res) => {
  try {
    const { officerId } = req.body;
    if (!officerId) {
      return res.status(400).json({ success: false, message: "Officer ID is required." });
    }

    const complaint = await assignComplaintToOfficer(req.params.id, officerId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint or officer not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "Complaint Assigned",
      message: `Complaint ${complaint.id} was assigned to officer ${officerId} by admin ${req.user.email}.`,
      type: "Complaint Assigned",
      complaint: complaint.id,
    });

    return res.status(200).json({ success: true, message: "Complaint assigned successfully.", complaint });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Server error while assigning complaint." });
  }
};

// Update complaint status.
const updateComplaintStatusById = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const complaint = await updateComplaintStatus(req.params.id, status);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found or invalid status." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "Complaint Resolved",
      message: `Complaint ${complaint.id} status updated to ${status} by admin ${req.user.email}.`,
      type: status === "Resolved" ? "Complaint Resolved" : "General",
      complaint: complaint.id,
    });

    return res.status(200).json({ success: true, message: "Complaint status updated successfully.", complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating complaint status." });
  }
};

// Permanently delete a complaint.
const removeComplaint = async (req, res) => {
  try {
    const deleted = await deleteComplaint(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    await createActivityLog({
      user: req.user._id,
      title: "Complaint Deleted",
      message: `Complaint with id ${req.params.id} was deleted by admin ${req.user.email}.`,
      type: "Complaint Deleted",
      complaint: req.params.id,
    });

    return res.status(200).json({ success: true, message: "Complaint deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while deleting complaint." });
  }
};

// Get administrative dashboard statistics.
const getStatistics = async (req, res) => {
  try {
    const stats = await getAdminStatistics();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching statistics." });
  }
};

// Get recent user signups.
const getRecentUsersList = async (req, res) => {
  try {
    const users = await getRecentUsers();
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching recent users." });
  }
};

// Get latest complaints.
const getRecentComplaintsList = async (req, res) => {
  try {
    const complaints = await getRecentComplaints();
    return res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching recent complaints." });
  }
};

// Get system health details.
const getSystemHealthReport = async (req, res) => {
  try {
    const health = await getSystemHealth();
    return res.status(200).json({ success: true, data: health });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching system health." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  removeUser,
  blockUser,
  unblockUser,
  createOfficerAccount,
  getAllOfficers,
  getOfficer,
  updateOfficerById,
  removeOfficer,
  getAllComplaints,
  getComplaintDetails,
  assignComplaint,
  updateComplaintStatusById,
  removeComplaint,
  getStatistics,
  getRecentUsersList,
  getRecentComplaintsList,
  getSystemHealthReport,
};
