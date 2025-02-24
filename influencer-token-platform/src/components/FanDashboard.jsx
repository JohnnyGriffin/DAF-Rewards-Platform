// src/components/FanDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  Box,
  Button
} from '@mui/material';
import { firestore } from '../firebase';

function FanDashboard() {
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState('');
  const [portfolio, setPortfolio] = useState({
    totalInvested: 0,
    totalReturn: 0,
    holdings: [],
  });

  useEffect(() => {
    const unsubscribe = firestore
      .collection('tokens')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const tokensData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTokens(tokensData);
      });
    return () => unsubscribe();
  }, []);

  // For demonstration, we set static portfolio values
  useEffect(() => {
    setPortfolio({
      totalInvested: 1000,
      totalReturn: 1200,
      holdings: [],
    });
  }, []);

  const filteredTokens = tokens.filter((token) =>
    token.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Fan (Investor) Dashboard
      </Typography>
      <Card sx={{ bgcolor: 'grey.900', p: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="white">
            Portfolio Overview
          </Typography>
          <Typography color="white">Total Invested: ${portfolio.totalInvested}</Typography>
          <Typography color="white">Total Return: ${portfolio.totalReturn}</Typography>
          <Typography color="white">Holdings: {portfolio.holdings.length} tokens</Typography>
        </CardContent>
      </Card>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tokens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, bgcolor: 'white', borderRadius: 1 }}
      />
      <Grid container spacing={2}>
        {filteredTokens.map((token) => (
          <Grid item xs={12} md={4} key={token.id}>
            <Card sx={{ bgcolor: 'grey.900', p: 2 }}>
              <CardContent>
                <Typography variant="h6" color="white">
                  {token.name}
                </Typography>
                <Typography color="white">
                  Price: $
                  {token.price ? parseFloat(token.price).toFixed(2) : '0.00'}
                </Typography>
                <Typography color="white">
                  Revenue Share: {token.revenueShare}%
                </Typography>
                <Typography color="white">
                  Contract: {token.contractAddress || 'N/A'}
                </Typography>
                {/* Section for buying/selling tokens */}
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                    Buy
                  </Button>
                  <Button variant="outlined" color="primary">
                    Sell
                  </Button>
                </Box>
                {/* Placeholder for graphs/charts */}
                <Box sx={{ mt: 2, bgcolor: 'grey.800', p: 1, borderRadius: 1 }}>
                  <Typography variant="body2" color="white" align="center">
                    [Chart Placeholder]
                  </Typography>
                </Box>
                {/* Alerts/Notifications Section */}
                <Box sx={{ mt: 2, bgcolor: 'grey.800', p: 1, borderRadius: 1 }}>
                  <Typography variant="body2" color="white" align="center">
                    [Alerts/Notifications Placeholder]
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default FanDashboard;
