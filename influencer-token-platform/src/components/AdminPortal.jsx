// src/components/AdminPortal.jsx
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
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OfferModelingTool from './OfferModelingTool';
import TokenCreationWizard from './TokenCreationWizard';
import TokenomicsSuite from './TokenomicsSuite';
import { Line, Pie, Bubble, Doughnut } from 'react-chartjs-2';

function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTile, setSelectedTile] = useState(null);
  const [users, setUsers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Activity log and alerts
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

  // State for Token Details Dialog
  const [tokenDetailsDialogOpen, setTokenDetailsDialogOpen] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);

  // Fetch users
  useEffect(() => {
    const unsubscribe = firestore.collection('users').onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch tokens
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

  // When Manage Tokens tab is selected, default to active tokens
  useEffect(() => {
    if (activeTab === 2) {
      setSelectedTile('activeTokens');
    }
  }, [activeTab]);

  // Filter users for Manage Users tab
  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUserList = filteredUsers.filter((user) => {
    if (userFilter === 'all') return true;
    if (userFilter === 'creator') return user.role.toLowerCase() === 'creator';
    if (userFilter === 'fan') return user.role.toLowerCase() === 'fan';
    if (userFilter === 'kyc') return user.kycVerified;
    return true;
  });

  // Helper: Get token for a given creator
  const getUserToken = (userId) => tokens.find((t) => t.creatorId === userId);

  // Handlers for viewing token details and adding creators
  const handleViewToken = (userId) => {
    const token = getUserToken(userId);
    if (token) {
      setTokenDetails(token);
      setTokenDetailsDialogOpen(true);
    } else {
      alert("No token details available for this user.");
    }
  };

  const handleOpenAddCreator = () => setAddCreatorModalOpen(true);
  const handleCloseAddCreator = () => {
    setAddCreatorModalOpen(false);
    setNewCreator({ firstName: '', lastName: '', email: '', tempPassword: '' });
  };

  const handleAddCreatorSubmit = async (shouldProceed) => {
    try {
      const newUser = {
        firstName: newCreator.firstName,
        lastName: newCreator.lastName,
        email: newCreator.email,
        role: 'creator',
        kycVerified: false,
        tempPassword: newCreator.tempPassword,
        totalEarnings: 0,
        revenueSharePercentage: 0,
        transferredAmounts: 0,
        pendingTransfers: 0,
        landingPage: '',
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

  // KPI calculations
  const totalUsers = users.length;
  const totalCreators = users.filter((u) => u.role === 'creator').length;
  const totalFans = users.filter((u) => u.role === 'fan').length;
  const kycVerifiedCount = users.filter((u) => u.kycVerified).length;
  const kycVerifiedRate = totalUsers > 0 ? ((kycVerifiedCount / totalUsers) * 100).toFixed(0) : 'N/A';
  const salesRevenue = tokens.reduce((acc, t) => acc + (parseFloat(t.tokenPrice) || 0), 0).toFixed(2);
  const smartContractEvents = activityLog.length;

  // Helper function for KPI tile styling
  const getTileStyle = (tileKey) => ({
    bgcolor: selectedTile === tileKey ? 'primary.main' : 'grey.800',
    p: 2,
    borderRadius: 2,
    flex: '1 1 200px',
    cursor: 'pointer',
  });

  const handleTileClick = (tileKey) => {
    setSelectedTile(tileKey);
  };

  // Helper: Format createdAt date
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return 'N/A';
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000).toLocaleString();
    return new Date(createdAt).toLocaleString();
  };

  // Render detail view for Overview Dashboard
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
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="white">
                        <strong>Price:</strong> ${token.tokenPrice ? parseFloat(token.tokenPrice).toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="white">
                        <strong>Revenue Share:</strong> {token.revenueShare ? token.revenueShare + '%' : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="white">
                        <strong>Rev Share/Token:</strong> {token.totalSupply ? ((token.revenueShare / token.totalSupply) * 100).toFixed(3) + '%' : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="white">
                        <strong>Created At:</strong> {token.createdAt ? formatCreatedAt(token.createdAt) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="white">
                        <strong>% Sold:</strong> {token.totalSupply && token.sold ? ((token.sold / token.totalSupply) * 100).toFixed(2) + '%' : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button variant="contained" size="small" color="primary" onClick={() => navigate(`/edit-landing/${token.id}`)}>
                      Edit Token
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => {
                      if (window.confirm('Are you sure you want to delete this token?')) {
                        firestore.collection('tokens').doc(token.id).delete();
                      }
                    }}>
                      Delete Token
                    </Button>
                    
                  </Box>
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
                    <Typography sx={{ flexBasis: '40%', textAlign: 'left' }} color="white">
                      {user.email}
                    </Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'center' }} color="white">
                      {user.role}
                    </Typography>
                    <Typography sx={{ flexBasis: '30%', textAlign: 'right' }} color="white">
                      {user.kycVerified ? 'Verified:' : 'Not Verified:'}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="white"><strong>Email:</strong> {user.email}</Typography>
                  <Typography color="white"><strong>Role:</strong> {user.role}</Typography>
                  <Typography color="white"><strong>Verified:</strong> {user.kycVerified ? 'Yes' : 'No'}</Typography>
                  <Typography color="white">
                    <strong>Landing Page:</strong> {user.landingPage ? (
                      <a href={user.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                        {user.landingPage}
                      </a>
                    ) : 'N/A'}
                  </Typography>
                  <Typography color="white"><strong>Total Earnings:</strong> {user.totalEarnings || 'N/A'}</Typography>
                  <Typography color="white"><strong>Revenue Share Percentage:</strong> {user.revenueSharePercentage || 'N/A'}</Typography>
                  <Typography color="white"><strong>Transferred Amounts:</strong> {user.transferredAmounts || 'N/A'}</Typography>
                  <Typography color="white"><strong>Pending Transfers:</strong> {user.pendingTransfers || 'N/A'}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      case 'totalFans':
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
                      {user.kycVerified ? 'Verified:' : 'Not Verified:'}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="white"><strong>Email:</strong> {user.email}</Typography>
                  <Typography color="white"><strong>Role:</strong> {user.role}</Typography>
                  <Typography color="white"><strong>Verified:</strong> {user.kycVerified ? 'Yes' : 'No'}</Typography>
                  <Typography color="white"><strong>Tokens Owned:</strong> {user.tokensOwned || 'N/A'}</Typography>
                  <Typography color="white"><strong>Membership Tier:</strong> {user.membershipTier || 'N/A'}</Typography>
                  <Typography color="white"><strong>Portfolio Value:</strong> {user.portfolioValue ? `$${user.portfolioValue}` : 'N/A'}</Typography>
                  <Typography color="white"><strong>Other Info:</strong> {user.otherFanInfo || 'N/A'}</Typography>
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
                      borderColor: '#00aeff'
                    }
                  ]
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

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>Admin Portal</Typography>

      <Typography variant="h6" color="white" sx={{ mb: 2 }}>
        Iconoco
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Overview Dashboard" />
        <Tab label="Manage Users" />
        <Tab label="Manage Tokens" />
        <Tab label="Offer Evaluation Tool" />
        <Tab label="Tokenomics Suite" />
      </Tabs>

      {/* Overview Dashboard Tab */}
      {activeTab === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Overview Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={getTileStyle('totalTokens')} onClick={() => handleTileClick('totalTokens')}>
              <Typography variant="subtitle1" color="white">Total Tokens</Typography>
              <Typography variant="h5" color="white">{tokens.length}</Typography>
            </Box>
            <Box sx={getTileStyle('totalCreators')} onClick={() => handleTileClick('totalCreators')}>
              <Typography variant="subtitle1" color="white">Total Creators</Typography>
              <Typography variant="h5" color="white">{totalCreators}</Typography>
            </Box>
            <Box sx={getTileStyle('totalFans')} onClick={() => handleTileClick('totalFans')}>
              <Typography variant="subtitle1" color="white">Total Fans</Typography>
              <Typography variant="h5" color="white">{totalFans}</Typography>
            </Box>
            <Box sx={getTileStyle('salesRevenue')} onClick={() => handleTileClick('salesRevenue')}>
              <Typography variant="subtitle1" color="white">Sales Revenue</Typography>
              <Typography variant="h5" color="white">${salesRevenue}</Typography>
            </Box>
            <Box sx={getTileStyle('smartContractEvents')} onClick={() => handleTileClick('smartContractEvents')}>
              <Typography variant="subtitle1" color="white">Smart Contract Events</Typography>
              <Typography variant="h5" color="white">{activityLog.length}</Typography>
            </Box>
            <Box sx={getTileStyle('realTimeAlerts')} onClick={() => handleTileClick('realTimeAlerts')}>
              <Typography variant="subtitle1" color="white">Alerts</Typography>
              <Typography variant="h5" color="white">{alerts.length}</Typography>
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
          <Typography variant="h6" color="white" gutterBottom>Manage Users</Typography>
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
              <Typography variant="subtitle1" color="white">Total Users</Typography>
              <Typography variant="h5" color="white">{totalUsers}</Typography>
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
              <Typography variant="subtitle1" color="white">Creators</Typography>
              <Typography variant="h5" color="white">{totalCreators}</Typography>
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
              <Typography variant="subtitle1" color="white">Fans</Typography>
              <Typography variant="h5" color="white">{totalFans}</Typography>
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
              <Typography variant="subtitle1" color="white">Verified:</Typography>
              <Typography variant="h5" color="white">{kycVerifiedRate}%</Typography>
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
                    {user.kycVerified ? 'Verified:' : 'Not Verified:'}
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
                <Typography><strong>Email:</strong> {user.email}</Typography>
                <Typography><strong>Role:</strong> {user.role}</Typography>
                <Typography><strong>Verified:</strong> {user.kycVerified ? 'Yes' : 'No'}</Typography>
                <Typography>
                  <strong>Landing Page:</strong> {user.landingPage ? (
                    <a href={user.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                      {user.landingPage}
                    </a>
                  ) : 'N/A'}
                </Typography>
                {user.role.toLowerCase() === 'creator' && (
                  <>
                    <Typography><strong>Total Earnings:</strong> {user.totalEarnings || 'N/A'}</Typography>
                    <Typography><strong>Revenue Share Percentage:</strong> {user.revenueSharePercentage || 'N/A'}</Typography>
                    <Typography><strong>Transferred Amounts:</strong> {user.transferredAmounts || 'N/A'}</Typography>
                    <Typography><strong>Pending Transfers:</strong> {user.pendingTransfers || 'N/A'}</Typography>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Manage Tokens Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box
              sx={getTileStyle('totalTokens')}
              onClick={() => handleTileClick('totalTokens')}
            >
              <Typography variant="subtitle1" color="white">Total Tokens Issued</Typography>
              <Typography variant="h5" color="white">{tokens.length}</Typography>
            </Box>
            <Box
              sx={getTileStyle('activeTokens')}
              onClick={() => handleTileClick('activeTokens')}
            >
              <Typography variant="subtitle1" color="white">Active Tokens</Typography>
              <Typography variant="h5" color="white">
                {tokens.filter(t => t.status !== 'paused' && t.status !== 'inactive').length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 3, p: 2 }}>
            {tokens.length === 0 ? (
              <Typography color="white">Token Pending</Typography>
            ) : (
              tokens
                .filter(token =>
                  selectedTile === 'totalTokens'
                    ? true
                    : token.status !== 'paused' && token.status !== 'inactive'
                )
                .map((token) => (
                  <Accordion key={token.id} sx={{ mb: 2, boxShadow: 3, p: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography color="white">{token.name || token.tokenName || 'N/A'}</Typography>
                        <Typography color="white">{token.symbol || token.tokenSymbol || 'N/A'}</Typography>
                        <Typography color="white">
                          ${token.tokenPrice ? parseFloat(token.tokenPrice).toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="white">
                            <strong>Price:</strong> ${token.tokenPrice ? parseFloat(token.tokenPrice).toLocaleString() : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="white">
                            <strong>Revenue Share:</strong> {token.revenueShare ? token.revenueShare + '%' : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="white">
                            <strong>Rev Share/Token:</strong> {token.totalSupply ? ((token.revenueShare / token.totalSupply) * 100).toFixed(3) + '%' : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="white">
                            <strong>Created At:</strong> {token.createdAt ? formatCreatedAt(token.createdAt) : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="white">
                            <strong>% Sold:</strong> {token.totalSupply && token.sold ? ((token.sold / token.totalSupply) * 100).toFixed(2) + '%' : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" color="primary" onClick={() => navigate(`/edit-landing/${token.id}`)}>
                          Edit Token
                        </Button>
                        <Button variant="outlined" size="small" color="error" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this token?')) {
                            firestore.collection('tokens').doc(token.id).delete();
                          }
                        }}>
                          Delete Token
                        </Button>
                    
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))
            )}
          </Box>
        </Box>
      )}

      {/* Offer Evaluation Tool Tab */}
      {activeTab === 3 && (
        <Box sx={{ mt: 3 }}>
          <OfferModelingTool onProceed={() => setActiveTab(4)} />
        </Box>
      )}

      {/* Tokenomics Suite Tab */}
      {activeTab === 4 && (
        <Box sx={{ mt: 3, pb: 4 }}>
          <TokenomicsSuite />
          {/* Moved Token Creation Wizard from Manage Tokens Tab to here */}
          <Box sx={{ mt: 4 }}>
            <TokenCreationWizard />
          </Box>
        </Box>
      )}

      {/* Add Creator Modal */}
      <Dialog open={addCreatorModalOpen} onClose={handleCloseAddCreator}>
        <DialogTitle>Add New Creator</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>First Name</Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter first name"
            value={newCreator.firstName}
            onChange={(e) => setNewCreator({ ...newCreator, firstName: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />
          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>Last Name</Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter last name"
            value={newCreator.lastName}
            onChange={(e) => setNewCreator({ ...newCreator, lastName: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />
          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>Email</Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Enter email"
            value={newCreator.email}
            onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />
          <Typography variant="subtitle1" color="black" sx={{ mt: 1 }}>Temporary Password</Typography>
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
          <Button onClick={() => handleAddCreatorSubmit(false)} variant="contained" color="primary">Submit</Button>
          <Button onClick={() => handleAddCreatorSubmit(true)} variant="contained" color="secondary">Submit &amp; Create Coin</Button>
        </DialogActions>
      </Dialog>

      {/* Token Details Dialog */}
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
                  <a href={tokenDetails.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                    {tokenDetails.landingPage}
                  </a>
                ) : 'N/A'}
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