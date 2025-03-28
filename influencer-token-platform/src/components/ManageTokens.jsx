// src/components/ManageTokens.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import TokenCreationWizard from './TokenCreationWizard';
import { firestore } from '../firebase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ManageTokens = () => {
  // Tokens and filtering state
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Dummy activity log and alerts; in production these would come from your backend or Firestore.
  const [activityLog, setActivityLog] = useState([
    { id: 1, message: "Deployed Creator Token on Sepolia", timestamp: new Date().toLocaleString() },
    { id: 2, message: "Smart contract updated for Creator Token", timestamp: new Date().toLocaleString() },
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, message: "Token XYZ performance below target." },
    { id: 2, message: "Compliance warning: review token LMN." },
  ]);

  // Fetch tokens from Firestore
  useEffect(() => {
    const unsubscribe = firestore.collection('tokens').orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTokens(data);
      });
    return () => unsubscribe();
  }, []);

  // KPI Calculations (using available token data; adjust based on your schema)
  const totalTokensIssued = tokens.length;
  const activeTokens = tokens.filter(token => token.status !== 'paused' && token.status !== 'inactive').length;
  const averageTokenPrice = tokens.length
    ? (tokens.reduce((acc, token) => acc + (parseFloat(token.tokenPrice) || 0), 0) / tokens.length).toFixed(2)
    : 0;
  // For demonstration, we use dummy values for revenue and fees
  const totalRevenue = tokens.length ? (tokens.length * 500000).toLocaleString() : "0";
  const secondaryMarketFees = tokens.length ? (tokens.length * 25000).toLocaleString() : "0";
  const smartContractActivityCount = activityLog.length;

  // Filter tokens based on search term (by tokenName or tokenSymbol)
  const filteredTokens = tokens.filter(token =>
    token.tokenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.tokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function for formatting createdAt date
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return 'N/A';
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    return new Date(createdAt).toLocaleString();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="white">
        Manage Tokens
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">Total Tokens Issued</Typography>
            <Typography variant="h5" color="white">{totalTokensIssued}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">Active Tokens</Typography>
            <Typography variant="h5" color="white">{activeTokens}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">Avg Token Price ($)</Typography>
            <Typography variant="h5" color="white">{averageTokenPrice}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">Total Revenue ($)</Typography>
            <Typography variant="h5" color="white">{totalRevenue}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">Secondary Market Fees</Typography>
            <Typography variant="h5" color="white">{secondaryMarketFees}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'grey.800' }}>
            <Typography variant="subtitle1" color="white">SC Activity Count</Typography>
            <Typography variant="h5" color="white">{smartContractActivityCount}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Real-Time Alerts Tile */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.800', borderRadius: 2 }}>
        <Typography variant="subtitle1" color="white">Real‑Time Alerts</Typography>
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <Typography key={alert.id} color="white" variant="body2">
              • {alert.message}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="white">
            No alerts.
          </Typography>
        )}
        <Button variant="outlined" size="small" onClick={() => alert("Refreshing alerts (dummy action).")} sx={{ mt: 1 }}>
          Refresh Alerts
        </Button>
      </Box>

      {/* Filter & Search Panel */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tokens by name or symbol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
        />
      </Box>

      {/* Token List & Management */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Token List
        </Typography>
        {filteredTokens.length ? (
          filteredTokens.map(token => (
            <Accordion key={token.id} sx={{ mb: 2, bgcolor: 'grey.900' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography color="white">{token.tokenName} ({token.tokenSymbol})</Typography>
                  <Typography color="white">
                    ${token.tokenPrice ? parseFloat(token.tokenPrice).toFixed(2) : "N/A"}
                  </Typography>
                  <Typography color="white">{token.status || "Active"}</Typography>
                  <Typography color="white">Trend: ▲</Typography>
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
                  <Button variant="contained" size="small" color="primary" onClick={() => alert("Edit token (modal or page)")}>
                    Edit Token
                  </Button>
                  <Button variant="outlined" size="small" color="error" onClick={() => {
                    if (window.confirm("Are you sure you want to delete this token?")) {
                      firestore.collection('tokens').doc(token.id).delete();
                    }
                  }}>
                    Delete Token
                  </Button>
                  <Button variant="contained" size="small" onClick={() => alert("View detailed performance (navigate)")}>
                    View Detailed Performance
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography color="white">No tokens found.</Typography>
        )}
      </Box>

      {/* Performance Dashboard */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.800', borderRadius: 2 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Performance Dashboard
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="white">
              Token Sales Trend
            </Typography>
            <Line
              data={{
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [
                  {
                    label: 'Token Sales Revenue ($)',
                    data: [500000, 600000, 550000, 700000, 650000, 720000, 680000],
                    fill: true,
                    backgroundColor: 'rgba(0, 174, 255, 0.3)',
                    borderColor: '#00aeff',
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="white">
              Transaction Volume
            </Typography>
            <Bar
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                  {
                    label: 'Transaction Volume',
                    data: [120, 150, 130, 170],
                    backgroundColor: '#ff4081',
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="white">
              Revenue Breakdown
            </Typography>
            <Doughnut
              data={{
                labels: ['Initial Sales', 'Secondary Fees', 'Issuance Fees'],
                datasets: [
                  {
                    data: [65, 25, 10],
                    backgroundColor: ['#00aeff', '#ff4081', '#4caf50'],
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="white">
              Performance Comparison
            </Typography>
            <Box sx={{ height: 200, bgcolor: 'grey.700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="white">[Scatter/Bubble Chart Placeholder]</Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => alert("Drill down to detailed report (dummy action)")}>
            Drill Down for Detailed Report
          </Button>
        </Box>
      </Box>

      {/* Integrated Token Creation Wizard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Token Creation
        </Typography>
        <TokenCreationWizard />
      </Box>
    </Container>
  );
};

export default ManageTokens;