// src/components/FanDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { firestore } from '../firebase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

function FanDashboard() {
  // Dummy portfolio data for demonstration
  const [portfolio, setPortfolio] = useState({
    totalInvested: 1000,
    totalHoldingsValue: 1200,
    holdings: [
      {
        id: '1',
        tokenName: 'Creator Token',
        tokenSymbol: 'CRT',
        creatorId: 'creator1',
        creatorName: 'Creator A',
        quantityHeld: 100,
        purchasePrice: 500000, // USD per token (dummy)
        currentPrice: 520000,  // USD per token (dummy)
        roi: 4,                // dummy ROI in %
      },
      {
        id: '2',
        tokenName: 'Influencer Token',
        tokenSymbol: 'IFT',
        creatorId: 'creator2',
        creatorName: 'Creator B',
        quantityHeld: 50,
        purchasePrice: 400000,
        currentPrice: 390000,
        roi: -2,
      },
    ],
    transactions: [
      { id: 't1', date: '2023-01-15', tokenName: 'CRT', type: 'buy', quantity: 100, price: 500000 },
      { id: 't2', date: '2023-02-20', tokenName: 'IFT', type: 'buy', quantity: 50, price: 400000 },
      { id: 't3', date: '2023-03-05', tokenName: 'CRT', type: 'sell', quantity: 20, price: 520000 },
    ],
  });
  const [search, setSearch] = useState('');

  // Modal states for Buy/Sell action, Export, and Settings
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('buy'); // 'buy' or 'sell'
  const [selectedToken, setSelectedToken] = useState(null);
  const [actionQuantity, setActionQuantity] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Calculate KPIs
  const totalHoldingsValue = portfolio.totalHoldingsValue;
  const numberOfTokensHeld = portfolio.holdings.reduce((acc, h) => acc + h.quantityHeld, 0);
  const avgPurchasePrice =
    portfolio.holdings.length > 0
      ? portfolio.holdings.reduce((acc, h) => acc + h.purchasePrice, 0) / portfolio.holdings.length
      : 0;
  const avgCurrentPrice =
    portfolio.holdings.length > 0
      ? portfolio.holdings.reduce((acc, h) => acc + h.currentPrice, 0) / portfolio.holdings.length
      : 0;
  const realizedGains = 10000; // Dummy value
  const unrealizedGains = totalHoldingsValue - portfolio.totalInvested;
  const transactionSummary = {
    buys: portfolio.transactions.filter((tx) => tx.type === 'buy').length,
    sells: portfolio.transactions.filter((tx) => tx.type === 'sell').length,
    volume: portfolio.transactions.reduce((acc, tx) => acc + tx.quantity * tx.price, 0),
  };

  // Chart Data (dummy)
  const portfolioValueChartData = {
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

  const tokenDistributionData = {
    labels: portfolio.holdings.map((h) => h.tokenName),
    datasets: [
      {
        data: portfolio.holdings.map((h) => h.quantityHeld),
        backgroundColor: ['#00aeff', '#ff4081'],
      },
    ],
  };

  const priceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: portfolio.holdings.map((h, index) => ({
      label: h.tokenName,
      data: [h.purchasePrice, h.purchasePrice * 1.01, h.currentPrice, h.currentPrice * 0.99, h.currentPrice],
      borderColor: index % 2 === 0 ? '#00aeff' : '#ff4081',
      tension: 0.1,
      fill: false,
    })),
  };

  // Handlers for Buy/Sell Actions
  const handleActionOpen = (token, type) => {
    setSelectedToken(token);
    setActionType(type);
    setActionQuantity(0);
    setActionModalOpen(true);
  };

  const handleActionConfirm = () => {
    alert(`Confirmed ${actionType} of ${actionQuantity} tokens for ${selectedToken.tokenName}`);
    setActionModalOpen(false);
  };

  return (
    <Container sx={{ mt: 5, bgcolor: 'black', p: 3 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Fan Dashboard
      </Typography>

      {/* Portfolio Overview & Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Total Holdings Value
          </Typography>
          <Typography variant="h5" color="white">
            ${totalHoldingsValue.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Tokens Held
          </Typography>
          <Typography variant="h5" color="white">
            {numberOfTokensHeld} tokens
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Avg. Purchase / Current Price
          </Typography>
          <Typography variant="body1" color="white">
            ${avgPurchasePrice.toFixed(2)} / ${avgCurrentPrice.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Realized Gains
          </Typography>
          <Typography variant="h5" color="white">
            ${realizedGains.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Unrealized Gains
          </Typography>
          <Typography variant="h5" color="white">
            ${unrealizedGains.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Transaction Summary
          </Typography>
          <Typography variant="body2" color="white">
            Buys: {transactionSummary.buys}, Sells: {transactionSummary.sells}
          </Typography>
          <Typography variant="body2" color="white">
            Volume: ${transactionSummary.volume.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Detailed Holdings Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Detailed Holdings
        </Typography>
        {portfolio.holdings.map((holding) => (
          <Accordion key={holding.id} sx={{ mb: 2, bgcolor: 'grey.900', color: 'white' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Typography>
                  {holding.tokenName} ({holding.tokenSymbol})
                </Typography>
                <Typography>Qty: {holding.quantityHeld}</Typography>
                <Typography>ROI: {holding.roi}%</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Creator:</strong>{' '}
                <a href={`/landing/${holding.creatorId}`} style={{ color: '#00aeff' }}>
                  {holding.creatorName}
                </a>
              </Typography>
              <Typography>
                <strong>Purchase Price:</strong> ${holding.purchasePrice.toLocaleString()}
              </Typography>
              <Typography>
                <strong>Current Price:</strong> ${holding.currentPrice.toLocaleString()}
              </Typography>
              <Typography>
                <strong>% of Portfolio:</strong>{' '}
                {((holding.quantityHeld * holding.purchasePrice) / portfolio.totalInvested * 100).toFixed(2)}%
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" onClick={() => handleActionOpen(holding, 'buy')}>
                  Buy More
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleActionOpen(holding, 'sell')}>
                  Sell
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate(`/token-performance/${holding.id}`)}>
                  View Detailed Performance
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Interactive Charts & Graphs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Portfolio Analytics
        </Typography>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Portfolio Value Over Time
          </Typography>
          <Line data={portfolioValueChartData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Token Distribution
          </Typography>
          <Pie data={tokenDistributionData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Price Trend for Key Tokens
          </Typography>
          <Line data={priceTrendData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" color="white">
            Transaction History
          </Typography>
          {portfolio.transactions.map((tx) => (
            <Typography key={tx.id} variant="body2" color="white">
              {tx.date}: {tx.tokenName} {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.quantity} @ ${tx.price.toLocaleString()}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Actionable Tools & Interactive Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" onClick={() => alert('Buy/Sell interface coming soon!')}>
            Buy/Sell Tokens
          </Button>
          <Button variant="outlined" color="primary" onClick={() => alert('Real-time alerts coming soon!')}>
            Alerts &amp; Notifications
          </Button>
          <Button variant="outlined" color="primary" onClick={() => alert('News Feed coming soon!')}>
            Market &amp; Creator News
          </Button>
          <Button variant="outlined" color="primary" onClick={() => setExportModalOpen(true)}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* User Settings & Personalization */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Dashboard Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => setSettingsModalOpen(true)}>
            Customize Dashboard
          </Button>
          <Button variant="outlined" color="primary" onClick={() => window.open('mailto:support@yourplatform.com')}>
            Help &amp; Support
          </Button>
        </Box>
      </Box>

      {/* Action Modal for Buy/Sell */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)}>
        <DialogTitle>{actionType === 'buy' ? 'Buy More Tokens' : 'Sell Tokens'}</DialogTitle>
        <DialogContent>
          {selectedToken && (
            <Box>
              <Typography>
                {selectedToken.tokenName} ({selectedToken.tokenSymbol})
              </Typography>
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
            Confirm {actionType === 'buy' ? 'Purchase' : 'Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onClose={() => setExportModalOpen(false)}>
        <DialogTitle>Export Portfolio Data</DialogTitle>
        <DialogContent>
          <Typography>
            Export functionality coming soon. (This would generate a CSV or PDF file.)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <DialogTitle>Customize Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Dashboard customization options coming soon. (Rearrange widgets, hide/show charts, set time ranges, etc.)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FanDashboard;
