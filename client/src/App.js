import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IdeaSubmission from "./pages/IdeaSubmission";
import IdeaDetails from "./pages/IdeaDetails";
import InvestorDiscovery from "./pages/InvestorDiscovery";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ideas/:id" element={<IdeaDetails />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit-idea" element={<IdeaSubmission />} />
            <Route path="/investors" element={<InvestorDiscovery />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
