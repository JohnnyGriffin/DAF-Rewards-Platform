// src/components/GlobalNav.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Switch, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

function GlobalNav() {
  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const [liveMode, setLiveMode] = React.useState(true);

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Header text updated */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Iconoco
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Live/Test toggle */}
          <FormControlLabel
            control={<Switch checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} color="primary" />}
            label={liveMode ? 'Live Mode' : 'Test Mode'}
            sx={{ color: 'white' }}
          />
          <Button color="inherit" component={Link} to="/landing/sample">
            Sample Landing Page
          </Button>
          {auth.currentUser ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/">
              Login/Sign‑Up
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default GlobalNav;