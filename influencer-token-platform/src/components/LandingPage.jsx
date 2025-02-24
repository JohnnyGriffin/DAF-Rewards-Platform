// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardMedia,
  Button,
  Typography,
  Box,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { firestore } from '../firebase';

function LandingPage() {
  const { tokenId } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    // Check if this is the sample landing page
    if (tokenId === 'sample') {
      setTokenData({
        name: "Sample Creator Token",
        tokenSymbol: "SCT",
        price: 500000,
        revenueShare: 10,
        totalSupply: 1000000,
        vestingPeriod: 365,
        contractAddress: "0xSampleContractAddress",
        imageUrl: "https://via.placeholder.com/800x300?text=Sample+Banner+Image",
        creatorName: "Sample Creator",
        socialLinks: "https://twitter.com/sample, https://instagram.com/sample",
        landingPage: "https://yourplatform.com/landing/sample",
      });
      setLoading(false);
      return;
    }
    
    const fetchToken = async () => {
      try {
        const tokenDoc = await firestore.collection('tokens').doc(tokenId).get();
        if (tokenDoc.exists) {
          setTokenData(tokenDoc.data());
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
      setLoading(false);
    };
    fetchToken();
  }, [tokenId]);

  const handleBuyToken = () => {
    setOpenConfirm(true);
  };

  const confirmPurchase = () => {
    // Implement purchase logic here
    alert(`Purchased ${purchaseQuantity} tokens of ${tokenData?.name || 'Unknown'}!`);
    setOpenConfirm(false);
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
          <CardMedia component="img" height="300" image={tokenData.imageUrl} alt="Creator Banner" />
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

      {/* Token & Creator Info */}
      <Typography variant="h4" gutterBottom color="black">
        {tokenData.name} - Landing Page
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Symbol:</strong> {tokenData.tokenSymbol || tokenData.symbol}
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Price ($):</strong> {tokenData.price ? tokenData.price : 'N/A'}
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Revenue Share:</strong> {tokenData.revenueShare || 0}%
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Total Supply:</strong> {tokenData.totalSupply || 'N/A'}
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Vesting Period:</strong> {tokenData.vestingPeriod || 0} days
      </Typography>
      <Typography variant="body1" color="black">
        <strong>Contract Address:</strong> {tokenData.contractAddress || 'N/A'}
      </Typography>
      {tokenData.creatorName && (
        <Typography variant="body1" color="black">
          <strong>Creator:</strong> {tokenData.creatorName}
        </Typography>
      )}
      {tokenData.socialLinks && (
        <Typography variant="body1" color="black">
          <strong>Social Links:</strong> {tokenData.socialLinks}
        </Typography>
      )}

      {/* Purchase Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" color="black">
          Purchase Tokens
        </Typography>
        <Typography variant="body2" color="black" sx={{ mt: 1 }}>
          Use the slider below to select the number of tokens you want to purchase.
        </Typography>
        <Slider
          value={purchaseQuantity}
          min={1}
          max={1000}
          step={1}
          onChange={(e, newValue) => setPurchaseQuantity(newValue)}
          valueLabelDisplay="auto"
          sx={{ color: 'primary.main', mt: 2 }}
        />
        <Typography variant="body2" color="black" sx={{ mt: 1 }}>
          Quantity: {purchaseQuantity}
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleBuyToken}>
          Purchase Tokens
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to purchase {purchaseQuantity} tokens of {tokenData.name}. Please review the
            terms and conditions.
          </Typography>
          <Typography sx={{ mt: 2 }}>[Insert detailed terms and conditions here...]</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={confirmPurchase}>
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LandingPage;
