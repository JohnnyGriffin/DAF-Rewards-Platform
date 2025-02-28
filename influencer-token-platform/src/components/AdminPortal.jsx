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
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OfferModelingTool from './OfferModelingTool';
import TokenCreationWizard from './TokenCreationWizard';
import TokenomicsSuite from './TokenomicsSuite';
import { Line, Bar, Pie, Bubble } from 'react-chartjs-2';

function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // State to track selected KPI tile (for Overview Dashboard detail view)
  const [selectedTile, setSelectedTile] = useState(null);
  // State for filtering users in the Manage Users tab ("all", "creator", "fan", "kyc")
  const [userFilter, setUserFilter] = useState('all');

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

  // States for Token Details Dialog (for "View Token")
  const [tokenDetailsDialogOpen, setTokenDetailsDialogOpen] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);

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
  // Further filter users based on selected filter tile
  const filteredUserList = filteredUsers.filter((user) => {
    if (userFilter === 'all') return true;
    if (userFilter === 'creator') return user.role.toLowerCase() === 'creator';
    if (userFilter === 'fan') return user.role.toLowerCase() === 'fan';
    if (userFilter === 'kyc') return user.kycVerified;
    return true;
  });

  // Helper: Get the token object for a given creator
  const getUserToken = (userId) => {
    return tokens.find((t) => t.creatorId === userId);
  };

  // Handler to open the Token Details Dialog
  const handleViewToken = (userId) => {
    const token = getUserToken(userId);
    if (token) {
      setTokenDetails(token);
      setTokenDetailsDialogOpen(true);
    } else {
      alert("No token details available for this user.");
    }
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
        tempPassword: newCreator.tempPassword,
      };
      const docRef = await firestore.collection('users').add(newUser);
      alert('New creator added successfully!');
      handleCloseAddCreator();
      if (shouldProceed) {
        localStorage.setItem('preselectedInfluencer', docRef.id);
        setActiveTab(2);
      }
    } catch (error) {
      console.error('Error adding creator:', error);
      alert(error.message);
    }
  };

  // Calculate KPI metrics for Manage Users tab
  const totalUsers = users.length;
  const totalCreators = users.filter((u) => u.role === 'creator').length;
  const totalFans = users.filter((u) => u.role === 'fan').length;
  const kycVerifiedCount = users.filter((u) => u.kycVerified).length;
  const kycVerifiedRate = totalUsers > 0 ? ((kycVerifiedCount / totalUsers) * 100).toFixed(0) : 'N/A';

  // Calculate additional Overview KPIs (for Overview Dashboard)
  const salesRevenue = tokens.reduce((acc, t) => acc + (parseFloat(t.tokenPrice) || 0), 0).toFixed(2);
  const secondaryFees = "0.00"; // Placeholder value – replace when available
  const smartContractEvents = activityLog.length;

  // Helper function to get style for a KPI tile (for Overview Dashboard)
  const getTileStyle = (tileKey) => ({
    bgcolor: selectedTile === tileKey ? 'primary.main' : 'grey.800',
    p: 2,
    borderRadius: 2,
    flex: '1 1 200px',
    cursor: 'pointer',
  });

  // Handler to update the overview detail view when a KPI tile is clicked.
  // For Manage Users tab, also update the userFilter state.
  const handleTileClick = (tileKey) => {
    setSelectedTile(tileKey);
    if (activeTab === 1) {
      if (tileKey === 'totalUsers') setUserFilter('all');
      if (tileKey === 'totalCreators') setUserFilter('creator');
      if (tileKey === 'totalFans') setUserFilter('fan');
      if (tileKey === 'kycVerified') setUserFilter('kyc');
    }
  };

  // Render detail view based on the selected tile (Overview Dashboard)
  const renderOverviewDetail = () => {
    switch (selectedTile) {
      case 'totalTokens':
        return (
          <Box>
            <Typography variant="h6" color="white">Tokens Issued</Typography>
            {tokens.map(token => (
              <Accordion key={token.id} sx={{ mb: 1, boxShadow: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography sx={{ flexBasis: '40%', textAlign: 'left' }} color="white">
                      <strong>Name:</strong> {token.name || token.tokenName || 'N/A'}
                    </Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'center' }} color="white">
                      <strong>Symbol:</strong> {token.symbol || token.tokenSymbol || 'N/A'}
                    </Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'right' }} color="white">
                      <strong>Status:</strong> {token.status || 'Active'}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="white">
                    <strong>Created At:</strong> {token.createdAt && token.createdAt.seconds ? new Date(token.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography color="white">
                    <strong>Total Supply:</strong> {token.totalSupply || 'N/A'}
                  </Typography>
                  <Typography color="white">
                    <strong>Revenue Share:</strong> {token.revenueShare}%
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      case 'totalCreators':
        return (
          <Box>
            <Typography variant="h6" color="white">Total Creators</Typography>
            {users.filter(user => user.role.toLowerCase() === 'creator').map(user => (
              <Accordion key={user.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography sx={{ flexBasis: '40%', textAlign: 'left' }}>{user.email}</Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'center' }}>{user.role}</Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'right' }}>
                      {user.kycVerified ? 'Verified' : 'Not Verified'}
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
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      case 'totalFans':
        // New case added to display list of fans
        return (
          <Box>
            <Typography variant="h6" color="white">Total Fans</Typography>
            {users.filter(user => user.role.toLowerCase() === 'fan').map(user => (
              <Accordion key={user.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography sx={{ flexBasis: '40%', textAlign: 'left' }}>{user.email}</Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'center' }}>{user.role}</Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'right' }}>
                      {user.kycVerified ? 'Verified' : 'Not Verified'}
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
                    <strong>Landing Page:</strong>{' '}
                    {user.landingPage ? (
                      <a href={user.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                        {user.landingPage}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      case 'salesRevenue':
        return (
          <Box>
            <Typography variant="h6" color="white">Sales Revenue Details</Typography>
            <Typography color="white">Total Sales Revenue: ${salesRevenue}</Typography>
            <Box sx={{ mt: 2, height: 250 }}>
              <Line
                data={{
                  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                  datasets: [
                    {
                      label: 'Token Sales Trend',
                      data: [100, 150, 200, 250],
                      fill: false,
                      borderColor: '#00aeff',
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>
        );
      case 'secondaryFees':
        return (
          <Box>
            <Typography variant="h6" color="white">Secondary Fees Details</Typography>
            <Typography color="white">Secondary Fees Collected: ${secondaryFees}</Typography>
            <Box sx={{ mt: 2, height: 250 }}>
              <Pie
                data={{
                  labels: ['Initial Sales', 'Secondary Fees', 'Issuance Fees'],
                  datasets: [
                    {
                      data: [parseFloat(salesRevenue), 1000, 300],
                      backgroundColor: ['#00aeff', '#ff4081', '#ff9800'],
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>
        );
      case 'smartContractEvents':
        return (
          <Box>
            <Typography variant="h6" color="white">Smart Contract Events</Typography>
            {activityLog.map(item => (
              <Typography key={item.id} color="white">
                [{item.timestamp}] {item.message}
              </Typography>
            ))}
          </Box>
        );
      case 'realTimeAlerts':
        return (
          <Box>
            <Typography variant="h6" color="white">Alerts</Typography>
            {alerts.map(item => (
              <Typography key={item.id} color="white">{item.message}</Typography>
            ))}
          </Box>
        );
      default:
        return (
          <Typography variant="body1" color="white">
            Click on a KPI tile above to view more details.
          </Typography>
        );
    }
  };

  // --- Performance Dashboard Chart Data (unchanged) ---
  const tokenSalesTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Token Sales Trend',
        data: [100, 150, 200, 250],
        fill: false,
        borderColor: '#00aeff',
      },
    ],
  };

  const transactionVolumeData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Transaction Volume',
        data: [500, 700, 600, 800],
        backgroundColor: '#ff4081',
      },
    ],
  };

  const revenueBreakdownData = {
    labels: ['Initial Sales', 'Secondary Fees', 'Issuance Fees'],
    datasets: [
      {
        data: [parseFloat(salesRevenue), 1000, 300],
        backgroundColor: ['#00aeff', '#ff4081', '#ff9800'],
      },
    ],
  };

  const performanceComparisonData = {
    labels: ['Token A', 'Token B', 'Token C'],
    datasets: [
      {
        label: 'Performance Comparison',
        data: [
          { x: 20, y: 30, r: 10 },
          { x: 40, y: 10, r: 15 },
          { x: 25, y: 25, r: 12 },
        ],
        backgroundColor: '#4caf50',
      },
    ],
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

      {/* Overview Dashboard Tab (unchanged except for aligned text and added Total Fans case) */}
      {activeTab === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Overview Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={getTileStyle('totalTokens')} onClick={() => handleTileClick('totalTokens')}>
              <Typography variant="subtitle1" color="white">
                Total Tokens
              </Typography>
              <Typography variant="h5" color="white">
                {tokens.length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('totalCreators')} onClick={() => handleTileClick('totalCreators')}>
              <Typography variant="subtitle1" color="white">
                Total Creators
              </Typography>
              <Typography variant="h5" color="white">
                {users.filter((u) => u.role === 'creator').length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('totalFans')} onClick={() => handleTileClick('totalFans')}>
              <Typography variant="subtitle1" color="white">
                Total Fans
              </Typography>
              <Typography variant="h5" color="white">
                {users.filter((u) => u.role === 'fan').length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('salesRevenue')} onClick={() => handleTileClick('salesRevenue')}>
              <Typography variant="subtitle1" color="white">
                Sales Revenue
              </Typography>
              <Typography variant="h5" color="white">
                ${salesRevenue}
              </Typography>
            </Box>
            <Box sx={getTileStyle('secondaryFees')} onClick={() => handleTileClick('secondaryFees')}>
              <Typography variant="subtitle1" color="white">
                Secondary Fees
              </Typography>
              <Typography variant="h5" color="white">
                ${secondaryFees}
              </Typography>
            </Box>
            <Box sx={getTileStyle('smartContractEvents')} onClick={() => handleTileClick('smartContractEvents')}>
              <Typography variant="subtitle1" color="white">
                Smart Contract Events
              </Typography>
              <Typography variant="h5" color="white">
                {activityLog.length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('realTimeAlerts')} onClick={() => handleTileClick('realTimeAlerts')}>
              <Typography variant="subtitle1" color="white">
                Alerts
              </Typography>
              <Typography variant="h5" color="white">
                {alerts.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 3, p: 2 }}>
            {renderOverviewDetail()}
          </Box>
        </Box>
      )}

      {/* Manage Users Tab */}
      {activeTab === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Manage Users
          </Typography>
          {/* Filter Tiles */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Box
              sx={{
                bgcolor: userFilter === 'all' ? 'primary.main' : 'grey.800',
                p: 2,
                borderRadius: 2,
                flex: '1 1 200px',
                cursor: 'pointer'
              }}
              onClick={() => { setUserFilter('all'); setSelectedTile('totalUsers'); }}
            >
              <Typography variant="subtitle1" color="white">
                Total Users
              </Typography>
              <Typography variant="h5" color="white">
                {totalUsers}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: userFilter === 'creator' ? 'primary.main' : 'grey.800',
                p: 2,
                borderRadius: 2,
                flex: '1 1 200px',
                cursor: 'pointer'
              }}
              onClick={() => { setUserFilter('creator'); setSelectedTile('totalCreators'); }}
            >
              <Typography variant="subtitle1" color="white">
                Creators
              </Typography>
              <Typography variant="h5" color="white">
                {totalCreators}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: userFilter === 'fan' ? 'primary.main' : 'grey.800',
                p: 2,
                borderRadius: 2,
                flex: '1 1 200px',
                cursor: 'pointer'
              }}
              onClick={() => { setUserFilter('fan'); setSelectedTile('totalFans'); }}
            >
              <Typography variant="subtitle1" color="white">
                Fans
              </Typography>
              <Typography variant="h5" color="white">
                {totalFans}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: userFilter === 'kyc' ? 'primary.main' : 'grey.800',
                p: 2,
                borderRadius: 2,
                flex: '1 1 200px',
                cursor: 'pointer'
              }}
              onClick={() => { setUserFilter('kyc'); setSelectedTile('kycVerified'); }}
            >
              <Typography variant="subtitle1" color="white">
                KYC Verified
              </Typography>
              <Typography variant="h5" color="white">
                {kycVerifiedRate}%
              </Typography>
            </Box>
          </Box>
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

          {filteredUserList.map((user) => (
            <Accordion key={user.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Typography sx={{ flexBasis: '35%', textAlign: 'left' }}>{user.email}</Typography>
                  <Typography sx={{ flexBasis: '20%', textAlign: 'center' }}>{user.role}</Typography>
                  <Typography sx={{ flexBasis: '20%', textAlign: 'center' }}>
                    {user.kycVerified ? 'Verified' : 'Not Verified'}
                  </Typography>
                  <Typography sx={{ flexBasis: '25%', textAlign: 'right' }}>
                    {getUserToken(user.id) ? (
                      <Button variant="outlined" size="small" onClick={() => handleViewToken(user.id)}>
                        View Token
                      </Button>
                    ) : 'N/A'}
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
                  <strong>Landing Page:</strong>{' '}
                  {user.landingPage ? (
                    <a href={user.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                      {user.landingPage}
                    </a>
                  ) : (
                    'N/A'
                  )}
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

          {/* Overview Section: KPI Tiles */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={getTileStyle('totalTokens')} onClick={() => handleTileClick('totalTokens')}>
              <Typography variant="subtitle1" color="white">
                Total Tokens Issued
              </Typography>
              <Typography variant="h5" color="white">
                {tokens.length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('activeTokens')} onClick={() => handleTileClick('activeTokens')}>
              <Typography variant="subtitle1" color="white">
                Active Tokens
              </Typography>
              <Typography variant="h5" color="white">
                {tokens.filter((t) => t.status !== 'paused' && t.status !== 'inactive').length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('avgPrice')} onClick={() => handleTileClick('avgPrice')}>
              <Typography variant="subtitle1" color="white">
                Average Token Price
              </Typography>
              <Typography variant="h5" color="white">
                {tokens.length > 0 ? '$' + (tokens.reduce((acc, t) => acc + (parseFloat(t.tokenPrice) || 0), 0) / tokens.length).toFixed(2) : '0.00'}
              </Typography>
            </Box>
            <Box sx={getTileStyle('salesRevenue')} onClick={() => handleTileClick('salesRevenue')}>
              <Typography variant="subtitle1" color="white">
                Total Revenue
              </Typography>
              <Typography variant="h5" color="white">
                ${tokens.reduce((acc, t) => acc + (parseFloat(t.tokenPrice) || 0), 0).toFixed(2)}
              </Typography>
            </Box>
            <Box sx={getTileStyle('secondaryFees')} onClick={() => handleTileClick('secondaryFees')}>
              <Typography variant="subtitle1" color="white">
                Secondary Fees Collected
              </Typography>
              <Typography variant="h5" color="white">
                ${secondaryFees}
              </Typography>
            </Box>
            <Box sx={getTileStyle('smartContractEvents')} onClick={() => handleTileClick('smartContractEvents')}>
              <Typography variant="subtitle1" color="white">
                Smart Contract Events
              </Typography>
              <Typography variant="h5" color="white">
                {activityLog.length}
              </Typography>
            </Box>
            <Box sx={getTileStyle('realTimeAlerts')} onClick={() => handleTileClick('realTimeAlerts')}>
              <Typography variant="subtitle1" color="white">
                Alerts
              </Typography>
              <Typography variant="h5" color="white">
                {alerts.length}
              </Typography>
            </Box>
          </Box>

          {/* Detail Area for Overview KPI */}
          <Box sx={{ mt: 3, p: 2 }}>
            {renderOverviewDetail()}
          </Box>

          {/* Token List & Management */}
          <Box sx={{ mb: 4 }}>
            {tokens
              .filter(
                (token) =>
                  token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  token.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((token) => (
                <Accordion key={token.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>{token.name || token.tokenName || 'N/A'}</Typography>
                      <Typography>{token.symbol || token.tokenSymbol || 'N/A'}</Typography>
                      <Typography>
                        ${token.tokenPrice ? parseFloat(token.tokenPrice).toLocaleString() : 'N/A'}
                      </Typography>
                      <Typography>{/* Performance indicator placeholder */}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <strong>Tokenomics:</strong> Total Supply: {token.totalSupply}, Revenue Share: {token.revenueShare}%, Vesting: {token.vestingPeriod} days
                    </Typography>
                    <Typography>
                      <strong>Financial Metrics:</strong> Revenue: ${token.tokenPrice ? parseFloat(token.tokenPrice).toLocaleString() : '0.00'}, ROI: N/A, Trading Volume: N/A, Avg Sale Price: N/A
                    </Typography>
                    <Typography>
                      <strong>Smart Contract:</strong>{' '}
                      {token.contractAddress ? (
                        <Button variant="outlined" size="small" onClick={() => window.open(`https://sepolia.etherscan.io/address/${token.contractAddress}`, '_blank')}>
                          View on Explorer
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </Typography>
                    <Typography>
                      <strong>Created At:</strong>{' '}
                      {token.createdAt && token.createdAt.seconds ? new Date(token.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button variant="contained" size="small" onClick={() => navigate(`/edit-landing/${token.id}`)}>
                        Edit Token
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this token?')) {
                            firestore.collection('tokens').doc(token.id).delete();
                          }
                        }}
                      >
                        Delete Token
                      </Button>
                      <Button variant="outlined" size="small" onClick={() => navigate(`/token-performance/${token.id}`)}>
                        View Detailed Performance
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>

          {/* Performance Dashboard arranged in 4 quadrants with no background */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="white" gutterBottom>
              Performance Dashboard
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" color="white" sx={{ mb: 1 }}>
                    Token Sales Trend
                  </Typography>
                  <Box sx={{ width: '100%', height: 'calc(100% - 30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Line
                      data={tokenSalesTrendData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" color="white" sx={{ mb: 1 }}>
                    Transaction Volume
                  </Typography>
                  <Box sx={{ width: '100%', height: 'calc(100% - 30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Bar
                      data={transactionVolumeData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" color="white" sx={{ mb: 1 }}>
                    Revenue Breakdown
                  </Typography>
                  <Box sx={{ width: '100%', height: 'calc(100% - 30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie
                      data={revenueBreakdownData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" color="white" sx={{ mb: 1 }}>
                    Performance Comparison
                  </Typography>
                  <Box sx={{ width: '100%', height: 'calc(100% - 30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Bubble
                      data={performanceComparisonData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Token Creation Wizard */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Token Creation
            </Typography>
            <TokenCreationWizard />
          </Box>
        </Box>
      )}

      {activeTab === 3 && (
        <Box sx={{ mt: 3 }}>
          <OfferModelingTool />
        </Box>
      )}

      {activeTab === 4 && (
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

      {/* Token Details Dialog for "View Token" */}
      <Dialog open={tokenDetailsDialogOpen} onClose={() => setTokenDetailsDialogOpen(false)}>
        <DialogTitle>Token Details</DialogTitle>
        <DialogContent>
          {tokenDetails ? (
            <Box>
              <Typography variant="subtitle1">
                <strong>Token Name:</strong> {tokenDetails.name || tokenDetails.tokenName || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Token Symbol:</strong> {tokenDetails.symbol || tokenDetails.tokenSymbol || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Price:</strong> ${tokenDetails.tokenPrice ? parseFloat(tokenDetails.tokenPrice).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Revenue Share:</strong> {tokenDetails.revenueShare}%
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Supply:</strong> {tokenDetails.totalSupply || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Vesting Period:</strong> {tokenDetails.vestingPeriod || 'N/A'} days
              </Typography>
              <Typography variant="subtitle1">
                <strong>Contract Address:</strong> {tokenDetails.contractAddress || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Landing Page:</strong>{' '}
                {tokenDetails.landingPage ? (
                  <a
                    href={tokenDetails.landingPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#00aeff' }}
                  >
                    {tokenDetails.landingPage}
                  </a>
                ) : (
                  'N/A'
                )}
              </Typography>
            </Box>
          ) : (
            <Typography>No token details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPortal;