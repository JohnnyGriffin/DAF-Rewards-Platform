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
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { firestore } from '../firebase';
import { buyTokens } from '../blockchain';
import { Bar } from 'react-chartjs-2';

function LandingPage() {
  const { tokenId } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Purchase flow state
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // Dummy data for social proof, sale history, testimonials, FAQs
  const [socialMetrics] = useState({
    followers: 10000,
    engagementRate: 5,
    collaborations: 3,
  });
  // Weekly sale history (used for sample tokens only)
  const [saleHistory] = useState([
    { date: 'Week 1', sold: 100 },
    { date: 'Week 2', sold: 200 },
    { date: 'Week 3', sold: 300 },
    { date: 'Week 4', sold: 400 },
  ]);
  const [testimonials] = useState([
    { id: 1, author: 'Fan1', comment: 'Great token offering!' },
    { id: 2, author: 'Fan2', comment: 'I love supporting my favorite creator.' },
  ]);
  const [faqs] = useState([
    { question: 'What is the revenue share?', answer: 'Token holders receive a percentage of future revenue.' },
    { question: 'How do I purchase tokens?', answer: 'Use the slider or input field to select quantity and click Buy Token.' },
  ]);
  const [faqOpen, setFaqOpen] = useState(false);

  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  // Fetch token data from Firestore or use dummy sample data if tokenId === 'sample'
  useEffect(() => {
    if (tokenId === 'sample') {
      setTokenData({
        name: "Sample Creator Token",
        symbol: "SCT",
        tokenPrice: 500000,
        revenueShare: 10,
        totalSupply: 1000000,
        sold: 250000, // tokens sold (for progress)
        imageUrl: "https://via.placeholder.com/800x300?text=Sample+Banner+Image",
        landingPage: `${baseUrl}/landing/sample`,
        legalDisclaimer: "This is a sample legal disclaimer. Please review all risk warnings and terms before purchase.",
        createdAt: new Date(), // ensure createdAt is set
      });
      setLoading(false);
    } else {
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
    }
  }, [tokenId, baseUrl]);

  // Calculate token sale progress (as percentage)
  const saleProgress =
    tokenData && tokenData.totalSupply
      ? ((tokenData.sold || 0) / tokenData.totalSupply) * 100
      : 0;

  // Safe handling for createdAt field
  const createdAtDisplay =
    tokenData && tokenData.createdAt
      ? tokenData.createdAt.seconds
        ? new Date(tokenData.createdAt.seconds * 1000).toLocaleString()
        : new Date(tokenData.createdAt).toLocaleString()
      : 'N/A';

  // Handle Buy Token: Calculate order summary and open modal
  const handleBuyToken = () => {
    if (!tokenData) return;
    const price = tokenData.tokenPrice || 0;
    const totalCost = purchaseQuantity * price;
    const fee = totalCost * 0.02;
    const summary = {
      quantity: purchaseQuantity,
      unitPrice: price,
      totalCost: totalCost,
      fee: fee,
      finalAmount: totalCost + fee,
      revenueShare: tokenData.revenueShare,
    };
    setOrderSummary(summary);
    setPurchaseModalOpen(true);
  };

  // Handle Confirm Purchase: Update the smart contract
  const handleConfirmPurchase = async () => {
    try {
      await buyTokens(tokenData.contractAddress, purchaseQuantity);
      alert(`Purchased ${purchaseQuantity} tokens for $${orderSummary.finalAmount.toFixed(2)}.`);
    } catch (error) {
      alert(error.message);
    }
    setPurchaseModalOpen(false);
  };

  // Prepare Token Sale Performance Chart data using weekly saleHistory
  const salePerformanceData = {
    labels: saleHistory.map(item => item.date),
    datasets: [
      {
        label: 'Tokens Sold',
        data: saleHistory.map(item => item.sold),
        backgroundColor: '#00aeff',
      },
    ],
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

      {/* Token Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom color="black">
          {tokenData.name || tokenData.tokenName} - {tokenData.symbol || tokenData.tokenSymbol}
        </Typography>
        <Typography variant="subtitle1" color="black">
          Current Price: ${tokenData.tokenPrice ? parseFloat(tokenData.tokenPrice).toLocaleString() : 'N/A'}
        </Typography>
        <Typography variant="subtitle1" color="black">
          Revenue Share: {tokenData.revenueShare}%
        </Typography>
        <Typography variant="subtitle1" color="black">
          Total Supply: {tokenData.totalSupply ? parseFloat(tokenData.totalSupply).toLocaleString() : 'N/A'}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" color="black">
            Token Sale Progress: {Math.round(saleProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={saleProgress} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" color="black">
            Performance Metrics:
          </Typography>
          <Typography variant="body2" color="black">
            ROI: N/A, Trading Volume: N/A, Avg Sale Price: N/A
          </Typography>
        </Box>
        <Typography variant="body1" color="black" sx={{ mt: 2 }}>
          <strong>Created At:</strong> {createdAtDisplay}
        </Typography>
      </Box>

      {/* Purchase Flow Integration */}
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h5" color="black" gutterBottom>
          Purchase Tokens
        </Typography>
        {/* Quantity Selection: Slider and Manual Input */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" color="black">
            Select Quantity:
          </Typography>
          <Slider
            value={purchaseQuantity}
            min={1}
            max={1000}
            step={1}
            onChange={(e, newValue) => setPurchaseQuantity(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main', flex: 1 }}
          />
          <TextField
            type="number"
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
            sx={{ width: 80, bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleBuyToken}>
            Buy Token
          </Button>
        </Box>
        {/* Terms & Conditions */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Terms & Conditions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="black">
              Please review the legal disclaimer and risk warnings before purchasing tokens. By proceeding, you agree to our terms including revenue share details and other conditions.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Token Sale Performance Chart (Weekly) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="black" gutterBottom>
          Token Sale Performance (Weekly)
        </Typography>
        <Bar data={salePerformanceData} options={{ responsive: true }} />
      </Box>

      {/* Social Proof Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="black" gutterBottom>
          Social Proof
        </Typography>
        <Typography variant="body1" color="black">
          Followers: {socialMetrics.followers.toLocaleString()} | Engagement Rate: {socialMetrics.engagementRate}% | Collaborations: {socialMetrics.collaborations}
        </Typography>
      </Box>

      {/* Testimonials / Fan Reviews */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="black" gutterBottom>
          Testimonials
        </Typography>
        {testimonials.map((review) => (
          <Box key={review.id} sx={{ mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="black">
              {review.author}:
            </Typography>
            <Typography variant="body2" color="black">
              {review.comment}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* FAQ / Help Section */}
      <Box sx={{ mb: 4 }}>
        <Accordion in={faqOpen} onChange={() => setFaqOpen(!faqOpen)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" color="black">FAQ / Help</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {faqs.map((faq, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="black">
                  Q: {faq.question}
                </Typography>
                <Typography variant="body2" color="black">
                  A: {faq.answer}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Live Chat / Support Link */}
      <Box sx={{ mb: 4 }}>
        <Button variant="outlined" color="primary" onClick={() => window.open('mailto:support@yourplatform.com')}>
          Contact Support
        </Button>
      </Box>

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
                Total Cost: ${orderSummary.unitPrice ? (purchaseQuantity * orderSummary.unitPrice).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Fees (2%): ${orderSummary.unitPrice ? (purchaseQuantity * orderSummary.unitPrice * 0.02).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="black">
                Final Amount: ${orderSummary.unitPrice ? (purchaseQuantity * orderSummary.unitPrice * 1.02).toLocaleString() : 'N/A'}
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
