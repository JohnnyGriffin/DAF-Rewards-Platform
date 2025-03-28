// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import GlobalNav from './components/GlobalNav';
import LoginSignUp from './components/LoginSignUp';
import CreatorDashboard from './components/CreatorDashboard';
import FanDashboard from './components/FanDashboard';
import AdminPortal from './components/AdminPortal';
import CreatorLandingPageManager from './components/CreatorLandingPageManager'; // New unified component
import LandingPage from './components/LandingPage';
import OfferModelingTool from './components/OfferModelingTool';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <GlobalNav />
      <Routes>
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
        {/* Use the unified landing page manager here */}
        <Route
          path="/edit-landing/:tokenId"
          element={
            <ProtectedRoute>
              <CreatorLandingPageManager />
            </ProtectedRoute>
          }
        />
        <Route path="/landing/:tokenId" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;