import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/pages/Dashboard";
import CreateComplaint from "../pages/CreateComplaint";
import ComplaintHistory from "../pages/ComplaintHistory/ComplaintHistory";
import ComplaintDetails from "../pages/ComplaintDetails/ComplaintDetails";
import AdminDashboard from "../pages/AdminDashboard";
import Profile from "../pages/Profile/Profile";
import Notifications from "../pages/Notifications/Notifications";
import NotFound from "../pages/NotFound/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-complaint"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <CreateComplaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <ComplaintHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaint/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "officer"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
