// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import GlobalNav from './components/GlobalNav';
import LoginSignUp from './components/LoginSignUp';
import CreatorDashboard from './components/CreatorDashboard';
// Import FanDashboard (make sure the file exists as FanDashboard.jsx)
import FanDashboard from './components/FanDashboard';
import AdminPortal from './components/AdminPortal';
import EditLandingPage from './components/EditLandingPage';
import LandingPage from './components/LandingPage';
import OfferModelingTool from './components/OfferModelingTool';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <GlobalNav />
      <Routes>
        {/* Default route for Login/SignUp */}
        <Route path="/" element={<LoginSignUp />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/creator"
          element={
            <ProtectedRoute>
              <CreatorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Corrected: use FanDashboard (not InvestorDashboard) */}
        <Route
          path="/fan"
          element={
            <ProtectedRoute>
              <FanDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offer-tool"
          element={
            <ProtectedRoute>
              <OfferModelingTool />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-landing/:tokenId"
          element={
            <ProtectedRoute>
              <EditLandingPage />
            </ProtectedRoute>
          }
        />

        {/* Public Landing Page for a given token */}
        <Route path="/landing/:tokenId" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
