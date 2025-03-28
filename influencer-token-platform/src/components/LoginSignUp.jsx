// src/components/LoginSignUp.jsx
import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
// Note: We no longer need to import KYC because creators skip it
// import KYC from './KYC';

function LoginSignUp() {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign-up states
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState('fan'); // default role is fan

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(loginEmail, loginPassword);
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await firestore.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'fan') {
        navigate('/fan');
      } else if (userData.role === 'creator') {
        navigate('/creator');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(signupEmail, signupPassword);
      const newUserId = userCredential.user.uid;

      // For creators, we now set kycVerified to true and do not require KYC verification.
      await firestore.collection('users').doc(newUserId).set({
        email: signupEmail,
        role,
        kycVerified: true,  // Always true now for all roles (or you can leave as true for creator only)
      });

      // Navigate immediately based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'fan') {
        navigate('/fan');
      } else if (role === 'creator') {
        navigate('/creator');
      }
    } catch (error) {
      console.error('Sign Up error:', error);
      alert(error.message);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {/* LOGIN FORM */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Log In
            </Button>
          </Box>
        )}

        {/* SIGN-UP FORM */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="white">
                Select Your Role:
              </Typography>
              <Button
                variant={role === 'creator' ? 'contained' : 'outlined'}
                color="primary"
                sx={{ mr: 1, mt: 1 }}
                onClick={() => setRole('creator')}
              >
                Creator
              </Button>
              <Button
                variant={role === 'fan' ? 'contained' : 'outlined'}
                color="primary"
                sx={{ mr: 1, mt: 1 }}
                onClick={() => setRole('fan')}
              >
                Fan
              </Button>
              <Button
                variant={role === 'admin' ? 'contained' : 'outlined'}
                color="primary"
                sx={{ mt: 1 }}
                onClick={() => setRole('admin')}
              >
                Admin
              </Button>
            </Box>
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Sign Up
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default LoginSignUp;