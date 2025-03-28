// src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardMedia,
  Button,
  Typography,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Slider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { firestore } from '../firebase';
import { buyTokens } from '../blockchain';

function LandingPage() {
  const { tokenId } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // State for tier benefits and event schedules
  const [tierBenefits, setTierBenefits] = useState([]);
  const [eventSchedules, setEventSchedules] = useState([]);
  // Dividend info state (not rendered on this page)
  const [dividendInfo, setDividendInfo] = useState({ claimable: 0, history: [] });

  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (tokenId === 'sample') {
      setTokenData({
        name: "Sample Creator Token",
        symbol: "SCT",
        tokenPrice: 500000,
        revenueShare: 10,
        totalSupply: 1000000,
        sold: 250000,
        imageUrl: "https://via.placeholder.com/800x300?text=Sample+Banner+Image",
        landingPage: `${baseUrl}/landing/sample`,
        legalDisclaimer: "This is a sample legal disclaimer.",
        createdAt: new Date(),
      });
      // Dummy data for tiers, events, dividends
      setTierBenefits([
        { tier: 'Bronze', benefits: 'Access to behind‑the‑scenes content', threshold: 100 },
        { tier: 'Silver', benefits: 'Exclusive video content', threshold: 1000 },
        { tier: 'Gold', benefits: 'Live Q&A sessions', threshold: 5000 },
        { tier: 'VIP', benefits: 'One‑on‑one meet & greet', threshold: 10000 },
      ]);
      setEventSchedules([
        { title: 'Live Stream Event', date: '2025-04-10T20:00:00', description: 'Join the creator live for a special event.' },
      ]);
      setDividendInfo({ claimable: 150, history: [{ date: '2025-03-01', amount: 100 }, { date: '2025-03-15', amount: 50 }] });
      setLoading(false);
    } else {
      const fetchToken = async () => {
        try {
          const tokenDoc = await firestore.collection('tokens').doc(tokenId).get();
          if (tokenDoc.exists) {
            setTokenData(tokenDoc.data());
            if (tokenDoc.data().utilityConfig) {
              setTierBenefits(tokenDoc.data().utilityConfig.tiers || []);
              // Add similar fetch for events and dividend info if available
            }
          }
        } catch (error) {
          console.error('Error fetching token data:', error);
        }
        setLoading(false);
      };
      fetchToken();
    }
  }, [tokenId, baseUrl]);

  // Calculate sale progress and created-at display
  const saleProgress =
    tokenData && tokenData.totalSupply
      ? ((tokenData.sold || 0) / tokenData.totalSupply) * 100
      : 0;

  const createdAtDisplay =
    tokenData && tokenData.createdAt
      ? tokenData.createdAt.seconds
        ? new Date(tokenData.createdAt.seconds * 1000).toLocaleString()
        : new Date(tokenData.createdAt).toLocaleString()
      : 'N/A';

  // Calculate available tokens
  const availableTokens =
    tokenData && tokenData.totalSupply
      ? tokenData.totalSupply - (tokenData.sold || 0)
      : 0;

  const handleBuyToken = () => {
    if (!tokenData) return;
    const price = tokenData.tokenPrice || 0;
    const totalCost = purchaseQuantity * price;
    const fee = totalCost * 0.02;
    const summary = {
      quantity: purchaseQuantity,
      unitPrice: price,
      totalCost,
      fee,
      finalAmount: totalCost + fee,
      revenueShare: tokenData.revenueShare,
    };
    setOrderSummary(summary);
    setPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      await buyTokens(tokenData.contractAddress, purchaseQuantity);
      alert(`Purchased ${purchaseQuantity} tokens for $${orderSummary.finalAmount.toLocaleString()}.`);
    } catch (error) {
      alert(error.message);
    }
    setPurchaseModalOpen(false);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5, bgcolor: 'white', color: 'black' }}>
        <Typography variant="h5">Loading Landing Page...</Typography>
      </Container>
    );
  }
  if (!tokenData) {
    return (
      <Container sx={{ mt: 5, bgcolor: 'white', color: 'black' }}>
        <Typography variant="h4">Token Not Found</Typography>
        <Typography>This token does not exist or has been removed.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5, bgcolor: 'white', p: 4, borderRadius: 2 }}>
      {/* Banner Section */}
      <Card sx={{ mb: 3 }}>
        {tokenData.imageUrl ? (
          <CardMedia
            component="img"
            height="300"
            image={tokenData.imageUrl}
            alt="Creator Banner"
          />
        ) : (
          <Box
            sx={{
              height: 300,
              bgcolor: 'grey.300',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.secondary">
              No Banner Image
            </Typography>
          </Box>
        )}
      </Card>

      {/* Token Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom color="black">
          {tokenData.name || tokenData.tokenName} - {tokenData.symbol || tokenData.tokenSymbol}
        </Typography>
        <Typography variant="subtitle1" color="black">
          Price: ${tokenData.tokenPrice ? parseFloat(tokenData.tokenPrice).toLocaleString() : 'N/A'}
        </Typography>
        <Typography variant="subtitle1" color="black">
          Revenue Share: {tokenData.revenueShare}%
        </Typography>
        <Typography variant="subtitle1" color="black">
          Revenue Share Per Token:{" "}
          {tokenData.totalSupply ? ((tokenData.revenueShare / tokenData.totalSupply) * 100).toFixed(3) : 'N/A'}%
        </Typography>
        <Typography variant="body1" color="black" sx={{ mt: 2 }}>
          <strong>Created At:</strong> {createdAtDisplay}
        </Typography>
      </Box>

      {/* Membership Benefits Panel */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h5" color="black" gutterBottom>
          Membership Benefits
        </Typography>
        <Grid container spacing={2}>
          {tierBenefits.map((tier, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: '#333' }}>
                  {tier.tier}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Threshold: {tier.threshold.toLocaleString()} tokens
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Benefits: {tier.benefits}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Purchase Tokens Panel */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h5" color="black" gutterBottom>
              Purchase Tokens
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1" color="black">
                Available Tokens: {availableTokens.toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Unit Price: ${tokenData.tokenPrice ? parseFloat(tokenData.tokenPrice).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
            <Grid container alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={9}>
                <Slider
                  value={purchaseQuantity}
                  onChange={(e, newValue) => setPurchaseQuantity(newValue)}
                  min={1}
                  max={availableTokens}
                  valueLabelDisplay="auto"
                  sx={{ color: 'primary.main' }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  type="text"
                  value={purchaseQuantity.toLocaleString()}
                  onChange={(e) => {
                    const numericValue = Number(e.target.value.replace(/,/g, ''));
                    setPurchaseQuantity(numericValue);
                  }}
                  fullWidth
                  sx={{
                    border: '1px solid lightgrey',
                    borderRadius: 1,
                    input: { color: 'black' },
                  }}
                />
              </Grid>
            </Grid>
            {/* Moved Percent Revenue Share Acquired below the slider */}
            <Typography variant="subtitle1" color="black" sx={{ mb: 1 }}>
              Percent Revenue Share Acquired: {tokenData.totalSupply ? ((purchaseQuantity / tokenData.totalSupply) * tokenData.revenueShare).toFixed(3) : 'N/A'}%
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1" color="black">
                Total Price: $
                {tokenData.tokenPrice ? (purchaseQuantity * tokenData.tokenPrice).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={handleBuyToken}>
              Buy Token
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Purchase Summary Modal */}
      <Dialog open={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)}>
        <DialogTitle>Purchase Summary</DialogTitle>
        <DialogContent>
          {orderSummary && (
            <Box>
              <Typography variant="subtitle1" color="black">
                Quantity: {orderSummary.quantity}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Unit Price: ${orderSummary.unitPrice ? orderSummary.unitPrice.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Total Cost: ${orderSummary.totalCost ? orderSummary.totalCost.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Fees (2%): ${orderSummary.fee ? orderSummary.fee.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Final Amount: ${orderSummary.finalAmount ? orderSummary.finalAmount.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Revenue Share: {orderSummary.revenueShare}%
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="black" sx={{ mt: 2 }}>
            By confirming your purchase, you agree to the Terms & Conditions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmPurchase} variant="contained" color="primary">
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LandingPage;