// src/components/KYC.jsx
// Example KYC component using Onfido (placeholder)

import React, { useEffect } from 'react';
import { Typography, Button } from '@mui/material';

function KYC({ onComplete }) {
  useEffect(() => {
    // If the Onfido SDK is loaded from the <script> in public/index.html:
    if (window.Onfido) {
      window.Onfido.init({
        token: 'YOUR_ONFIDO_SDK_TOKEN', // Replace with real Onfido token
        containerId: 'onfido-mount',
        onComplete: (data) => {
          // data might contain verification info
          onComplete(data);
        },
        // Additional Onfido options...
      });
    }
  }, [onComplete]);

  // Fallback button if you want to mock the KYC completion
  const handleMockComplete = () => {
    onComplete({ status: 'KYC completed', date: new Date().toISOString() });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <Typography variant="h5" color="white" gutterBottom>
        KYC Verification
      </Typography>
      <Typography variant="body1" color="white">
        Please follow the steps below to verify your identity.
      </Typography>
      <div id="onfido-mount" style={{ marginTop: '1rem' }}>
        {/* Onfido UI gets mounted here */}
      </div>
      <Button variant="contained" color="primary" onClick={handleMockComplete} sx={{ mt: 2 }}>
        Mock KYC Complete
      </Button>
    </div>
  );
}

export default KYC;
