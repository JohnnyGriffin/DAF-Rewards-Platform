// src/components/AdminPortal.jsx
// This file implements the complete Admin Portal with five tabs:
// Overview Dashboard, Manage Users, Manage Tokens, Offer Evaluation Tool, and Tokenomics Suite.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import {
  Container,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OfferModelingTool from './OfferModelingTool';
import TokenCreationWizard from './TokenCreationWizard';
import TokenomicsSuite from './TokenomicsSuite';

function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Activity log and alerts (used for smart contract events and notifications)
  const [activityLog, setActivityLog] = useState([
    { id: 1, message: 'Token ABC deployed at 10:15 AM', timestamp: new Date().toLocaleString() },
    { id: 2, message: 'Smart contract updated for Token XYZ at 10:30 AM', timestamp: new Date().toLocaleString() },
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, message: 'Token XYZ performance below threshold.' },
    { id: 2, message: 'Compliance alert: review required for Token LMN.' },
  ]);

  // States for Add Creator Modal
  const [addCreatorModalOpen, setAddCreatorModalOpen] = useState(false);
  const [newCreator, setNewCreator] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tempPassword: '',
  });

  // Fetch all users from Firestore
  useEffect(() => {
    const unsubscribe = firestore.collection('users').onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all tokens from Firestore
  useEffect(() => {
    const unsubscribe = firestore
      .collection('tokens')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTokens(data);
      });
    return () => unsubscribe();
  }, []);

  // Filter users by search term (by email or role)
  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: Get token link for a given creator (if one exists)
  const getUserTokenLink = (userId) => {
    const token = tokens.find((t) => t.creatorId === userId);
    return token ? token.landingPage : 'N/A';
  };

  // Simulate adding new activity log entry
  const refreshActivityLog = () => {
    const newLog = {
      id: activityLog.length + 1,
      message: `New log entry at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toLocaleString(),
    };
    setActivityLog((prev) => [...prev, newLog]);
  };

  // Simulate adding new alert
  const refreshAlerts = () => {
    const newAlert = {
      id: alerts.length + 1,
      message: `New alert at ${new Date().toLocaleTimeString()}`,
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  // Handler for opening the Add Creator modal
  const handleOpenAddCreator = () => {
    setAddCreatorModalOpen(true);
  };

  // Handler for closing the Add Creator modal
  const handleCloseAddCreator = () => {
    setAddCreatorModalOpen(false);
    setNewCreator({ firstName: '', lastName: '', email: '', tempPassword: '' });
  };

  // Handler for adding a new creator
  // If shouldProceed is true, then navigate to the Token Creation Wizard
  const handleAddCreatorSubmit = async (shouldProceed) => {
    try {
      const newUser = {
        firstName: newCreator.firstName,
        lastName: newCreator.lastName,
        email: newCreator.email,
        role: 'creator',
        kycVerified: false,
        tempPassword: newCreator.tempPassword, // store temporary password if needed
      };
      const docRef = await firestore.collection('users').add(newUser);
      alert('New creator added successfully!');
      handleCloseAddCreator();
      if (shouldProceed) {
        // Save preselected influencer id in localStorage for the Token Creation Wizard to pre-fill
        localStorage.setItem('preselectedInfluencer', docRef.id);
        // Switch to the Manage Tokens tab where TokenCreationWizard is rendered
        setActiveTab(2);
      }
    } catch (error) {
      console.error('Error adding creator:', error);
      alert(error.message);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Admin Portal
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Overview Dashboard" />
        <Tab label="Manage Users" />
        <Tab label="Manage Tokens" />
        <Tab label="Offer Evaluation Tool" />
        <Tab label="Tokenomics Suite" />
      </Tabs>

      {activeTab === 0 && (
        // Overview Dashboard Tab
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Overview Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" color="white">
                Total Tokens
              </Typography>
              <Typography variant="h5" color="white">
                {tokens.length}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" color="white">
                Total Creators
              </Typography>
              <Typography variant="h5" color="white">
                {users.filter((u) => u.role === 'creator').length}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" color="white">
                Total Fans
              </Typography>
              <Typography variant="h5" color="white">
                {users.filter((u) => u.role === 'fan').length}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" color="white">
                Initial Sales Revenue
              </Typography>
              <Typography variant="h5" color="white">
                ${tokens.reduce((acc, t) => acc + (t.price || 0), 0).toFixed(2)}
              </Typography>
            </Box>
            {/* New Alerts Tile */}
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" color="white">
                Alerts
              </Typography>
              <Typography variant="h5" color="white">
                {alerts.length}
              </Typography>
            </Box>
          </Box>

          {/* Placeholder for future trend charts */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="white">
              Sales Trends
            </Typography>
            <Typography variant="body2" color="white">
              [Line chart placeholder]
            </Typography>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        // Manage Users Tab
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Manage Users
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search by email or role..."
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
          </Box>
          <Button variant="contained" color="primary" onClick={handleOpenAddCreator} sx={{ mb: 2 }}>
            Add Creator
          </Button>

          {filteredUsers.map((user) => (
            <Accordion key={user.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography>{user.email}</Typography>
                  <Typography>{user.role}</Typography>
                  <Typography>{user.kycVerified ? 'Verified' : 'Not Verified'}</Typography>
                  <Typography>
                    Token:{' '}
                    {getUserTokenLink(user.id) !== 'N/A' ? (
                      <Button variant="outlined" size="small" onClick={() => navigate(`/edit-landing/${user.id}`)}>
                        View Token
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {user.role}
                </Typography>
                <Typography>
                  <strong>KYC Verified:</strong> {user.kycVerified ? 'Yes' : 'No'}
                </Typography>
                <Typography>
                  <strong>Landing Page:</strong> {user.landingPage || 'N/A'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => navigate(`/edit-landing/${user.id}`)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        firestore.collection('users').doc(user.id).delete();
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        // Manage Tokens Tab
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Manage Tokens
          </Typography>
          {/* Token Creation Wizard */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Token Creation
            </Typography>
            <TokenCreationWizard />
          </Box>
          {/* Alerts & Notifications */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Alerts & Notifications
            </Typography>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
              {alerts.map((alertItem) => (
                <Typography key={alertItem.id} color="white">
                  {alertItem.message}
                </Typography>
              ))}
              <Button variant="outlined" size="small" onClick={refreshAlerts} sx={{ mt: 1 }}>
                Refresh Alerts
              </Button>
            </Box>
          </Box>
          {/* Activity Log */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Smart Contract Activity Log
            </Typography>
            <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
              {activityLog.map((item) => (
                <Typography key={item.id} color="white">
                  [{item.timestamp}] {item.message}
                </Typography>
              ))}
              <Button variant="outlined" size="small" onClick={refreshActivityLog} sx={{ mt: 1 }}>
                Refresh Log
              </Button>
            </Box>
          </Box>
          {/* Token List */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Token Performance Overview
            </Typography>
            {tokens.map((token) => (
              <Accordion key={token.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>{token.name}</Typography>
                    <Typography>{token.symbol}</Typography>
                    <Typography>${token.price?.toFixed(2)}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <strong>Revenue Share:</strong> {token.revenueShare}%
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> {token.status || 'Active'}
                  </Typography>
                  <Typography>
                    <strong>Landing Page:</strong> {token.landingPage}
                  </Typography>
                  <Typography>
                    <strong>Created At:</strong>{' '}
                    {token.createdAt && token.createdAt.seconds
                      ? new Date(token.createdAt.seconds * 1000).toLocaleString()
                      : ''}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/edit-landing/${token.id}`)}>
                      Edit Token
                    </Button>
                    {token.contractAddress && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          window.open(`https://etherscan.io/address/${token.contractAddress}`, '_blank');
                        }}
                      >
                        Contract Details
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 3 && (
        // Offer Evaluation Tool Tab
        <Box sx={{ mt: 3 }}>
          <OfferModelingTool />
        </Box>
      )}

      {activeTab === 4 && (
        // Tokenomics Suite Tab
        <Box sx={{ mt: 3 }}>
          <TokenomicsSuite />
        </Box>
      )}

      {/* Add Creator Modal */}
      <Dialog open={addCreatorModalOpen} onClose={handleCloseAddCreator}>
        <DialogTitle>Add New Creator</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>
            First Name
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter first name"
            value={newCreator.firstName}
            onChange={(e) => setNewCreator({ ...newCreator, firstName: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />

          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>
            Last Name
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter last name"
            value={newCreator.lastName}
            onChange={(e) => setNewCreator({ ...newCreator, lastName: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />

          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter email"
            value={newCreator.email}
            onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />

          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>
            Temporary Password
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter temporary password"
            type="password"
            value={newCreator.tempPassword}
            onChange={(e) => setNewCreator({ ...newCreator, tempPassword: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCreator}>Cancel</Button>
          <Button onClick={() => handleAddCreatorSubmit(false)} variant="contained" color="primary">
            Submit
          </Button>
          <Button onClick={() => handleAddCreatorSubmit(true)} variant="contained" color="secondary">
            Submit &amp; Create Coin
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPortal;
