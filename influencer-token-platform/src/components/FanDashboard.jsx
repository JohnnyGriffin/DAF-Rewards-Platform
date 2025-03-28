// src/components/FanDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { firestore, auth } from '../firebase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend);

function FanDashboard() {
  const navigate = useNavigate();

  // Live portfolio data loaded from Firestore
  const [portfolio, setPortfolio] = useState(null);
  // Live alerts data (based on tokens held)
  const [alertsData, setAlertsData] = useState([]);
  const [search, setSearch] = useState('');
  // selectedChart can be either 'tokensHeld' or 'alerts'
  const [selectedChart, setSelectedChart] = useState('tokensHeld');

  // Modal state for Buy action (only buy available)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [actionQuantity, setActionQuantity] = useState(0);

  // Fetch the current fan’s portfolio from Firestore
  useEffect(() => {
    const fetchPortfolio = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await firestore.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            setPortfolio(data.portfolio || { totalInvested: 0, totalHoldingsValue: 0, holdings: [] });
          }
        } catch (error) {
          console.error('Error fetching portfolio data:', error);
        }
      }
    };
    fetchPortfolio();
  }, []);

  // Fetch live alerts based on the tokens held in the portfolio.
  useEffect(() => {
    if (portfolio && portfolio.holdings && portfolio.holdings.length > 0) {
      // Get an array of token ids from the portfolio holdings.
      const tokenIds = portfolio.holdings.map((h) => h.id);
      // Firestore "in" queries support up to 10 values.
      const unsubscribe = firestore
        .collection('alerts')
        .where('tokenId', 'in', tokenIds)
        .onSnapshot((snapshot) => {
          const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setAlertsData(events);
        });
      return () => unsubscribe();
    } else {
      setAlertsData([]);
    }
  }, [portfolio]);

  // Show a loading indicator until portfolio data is loaded
  if (!portfolio) {
    return (
      <Container sx={{ mt: 5, bgcolor: 'black', p: 3 }}>
        <Typography variant="h5" color="white">Loading portfolio data...</Typography>
      </Container>
    );
  }

  const numberOfTokensHeld = portfolio.holdings.reduce((acc, h) => acc + h.quantityHeld, 0);

  // Dummy chart data for portfolio value (unused now)
  const portfolioValueChartData = portfolio.history
    ? {
        labels: portfolio.history.map((item) => item.month),
        datasets: [
          {
            label: 'Portfolio Value ($)',
            data: portfolio.history.map((item) => item.value),
            fill: false,
            borderColor: 'green',
            tension: 0.1,
          },
        ],
      }
    : {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Portfolio Value ($)',
            data: [900, 1000, 1100, 1200, 1250],
            fill: false,
            borderColor: 'green',
            tension: 0.1,
          },
        ],
      };

  // Token Distribution Chart data
  const tokenDistributionData = {
    labels: portfolio.holdings.map((h) => h.tokenName),
    datasets: [
      {
        data: portfolio.holdings.map((h) => h.quantityHeld),
        backgroundColor: ['#000000', '#333333'], // Adjust colors as needed
      },
    ],
  };

  const handleActionOpen = (token) => {
    setSelectedToken(token);
    setActionQuantity(0);
    setActionModalOpen(true);
  };

  const handleActionConfirm = () => {
    alert(`Confirmed buy of ${actionQuantity} tokens for ${selectedToken.tokenName}`);
    setActionModalOpen(false);
  };

  const handleClaimDividend = (holdingId) => {
    alert(`Claiming dividends for token ID ${holdingId}`);
  };

  const filteredHoldings = portfolio.holdings.filter(
    (h) =>
      h.tokenName.toLowerCase().includes(search.toLowerCase()) ||
      h.tokenSymbol.toLowerCase().includes(search.toLowerCase())
  );

  // Render chart panel based on selected KPI tile.
  // Since the portfolio value chart is removed, only Alerts panel is rendered.
  const renderChartPanel = () => {
    if (selectedChart === 'alerts') {
      return (
        <Box
          sx={{
            bgcolor: 'grey.800',
            p: 2,
            borderRadius: 2,
            minHeight: 200,
            boxSizing: 'border-box',
            mb: 4,
          }}
        >
          <Typography variant="h6" color="white" gutterBottom>
            Alerts
          </Typography>
          {alertsData.length === 0 ? (
            <Typography variant="body2" color="white">No Alerts</Typography>
          ) : (
            alertsData.map((alert, idx) => (
              <Typography key={idx} variant="body2" color="white">
                {alert.message || 'Alert'}
              </Typography>
            ))
          )}
        </Box>
      );
    }
    // When 'tokensHeld' is selected, no chart is rendered.
    return null;
  };

  return (
    <Container sx={{ mt: 5, bgcolor: 'black', p: 3 }}>
      <Typography variant="h4" color="white" gutterBottom>Fan Dashboard</Typography>

      {/* KPI Tiles Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box
          sx={{
            bgcolor: selectedChart === 'tokensHeld' ? '#00aeff' : 'grey.800',
            p: 2,
            borderRadius: 2,
            flex: '1 1 200px',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedChart('tokensHeld')}
        >
          <Typography variant="subtitle1" color="white">Tokens Held</Typography>
          <Typography variant="h5" color="white">{numberOfTokensHeld} tokens</Typography>
        </Box>
        <Box
          sx={{
            bgcolor: selectedChart === 'alerts' ? '#00aeff' : 'grey.800',
            p: 2,
            borderRadius: 2,
            flex: '1 1 200px',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedChart('alerts')}
        >
          <Typography variant="subtitle1" color="white">Alerts</Typography>
          <Typography variant="h5" color="white">{alertsData.length} alerts</Typography>
        </Box>
      </Box>

      {renderChartPanel()}

      {/* Detailed Holdings Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>Detailed Holdings</Typography>
        {filteredHoldings.length > 0 ? (
          filteredHoldings.map((holding) => (
            <Accordion key={holding.id} sx={{ mb: 2, bgcolor: 'grey.900', color: 'white' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography>{holding.tokenName} ({holding.tokenSymbol})</Typography>
                  <Typography>Qty: {holding.quantityHeld}</Typography>
                  <Typography>ROI: {holding.roi}%</Typography>
                  <Typography>Dividend: ${Number(holding.dividendClaimable || 0).toLocaleString()}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <strong>Creator:</strong>{' '}
                  <a
                    href={`/landing/${holding.creatorId}`}
                    style={{ color: '#00aeff' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {holding.creatorName}
                  </a>
                </Typography>
                <Typography><strong>Purchase Price:</strong> ${holding.purchasePrice.toLocaleString()}</Typography>
                <Typography>
                  <strong>% of Portfolio:</strong>{' '}
                  {((holding.quantityHeld * holding.purchasePrice) / portfolio.totalInvested * 100).toFixed(2)}%
                </Typography>
                {holding.membershipTier && (
                  <Typography><strong>Membership Tier:</strong> {holding.membershipTier}</Typography>
                )}
                {holding.membershipBenefits && (
                  <Typography><strong>Benefits:</strong> {holding.membershipBenefits}</Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => navigate(`/landing/${holding.creatorId}`)}>
                    Visit Creator Page
                  </Button>
                  {holding.dividendClaimable > 0 && (
                    <Button variant="contained" size="small" color="secondary" onClick={() => handleClaimDividend(holding.id)}>
                      Claim Dividends
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography variant="body1" color="white">No tokens held. Token Pending.</Typography>
        )}
      </Box>

      {/* Action Modal for Buy Tokens */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)}>
        <DialogTitle>Buy More Tokens</DialogTitle>
        <DialogContent>
          {selectedToken && (
            <Box>
              <Typography>{selectedToken.tokenName} ({selectedToken.tokenSymbol})</Typography>
              <TextField
                label="Quantity"
                type="number"
                value={actionQuantity}
                onChange={(e) => setActionQuantity(parseInt(e.target.value, 10))}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionModalOpen(false)}>Cancel</Button>
          <Button onClick={handleActionConfirm} variant="contained" color="primary">
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FanDashboard;