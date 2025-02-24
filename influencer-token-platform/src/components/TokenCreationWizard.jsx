// src/components/TokenCreationWizard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { createTokenOnBlockchain } from '../blockchain';
import { firestore } from '../firebase';

const steps = [
  'Basic Token Info',
  'Revenue Sharing',
  'Tokenomics & Sale',
  'Governance & Legal',
  'Preview & Deploy',
];

function TokenCreationWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [influencers, setInfluencers] = useState([]);

  const [tokenInfo, setTokenInfo] = useState({
    influencerId: '',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    totalSupply: '',
    revenueShare: '',
    distributionFrequency: '',
    minPayout: '',
    vestingPeriod: '',
    tokenPrice: '',
    platformFee: '',
    mintable: false,
    influencerRoyalty: '',
    upgradeable: false,
    emergencyPause: false,
    legalDisclaimer: 'Standard legal disclaimer here.',
    termsUrl: '',
    jurisdiction: '',
  });
  const [previewData, setPreviewData] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    // Fetch creators for dropdown
    const unsubscribe = firestore
      .collection('users')
      .where('role', '==', 'creator')
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInfluencers(data);
      });
    return () => unsubscribe();
  }, []);

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Final step: deploy token
      try {
        const tokenPriceNum = parseFloat(tokenInfo.tokenPrice) || 0;
        const revenueShareNum = parseFloat(tokenInfo.revenueShare) || 0;
        const totalSupplyNum = parseFloat(tokenInfo.totalSupply) || 0;
        const vestingPeriodNum = parseFloat(tokenInfo.vestingPeriod) || 0;

        // Create on-chain token
        const tx = await createTokenOnBlockchain(
          tokenInfo.tokenName,
          tokenPriceNum,
          revenueShareNum,
          tokenInfo.tokenSymbol,
          totalSupplyNum,
          vestingPeriodNum
        );

        // Save to Firestore
        const tokenDocRef = await firestore.collection('tokens').add({
          ...tokenInfo,
          creatorId: tokenInfo.influencerId,
          createdAt: new Date(),
          contractAddress: tx?.contractAddress || '0xLIVEADDRESS',
        });

        // Landing page URL
        const landingPage = `${baseUrl}/landing/${tokenDocRef.id}`;
        await firestore.collection('tokens').doc(tokenDocRef.id).update({ landingPage });

        alert('Token deployed successfully!');
        navigate('/admin');
      } catch (error) {
        console.error('Error deploying token:', error);
        alert(error.message);
      }
    } else {
      // Next step
      if (activeStep === steps.length - 2) {
        setPreviewData(tokenInfo);
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setTokenInfo((prev) => ({ ...prev, [field]: value }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            {/* Influencer (Creator) Selection */}
            <Typography variant="subtitle1" color="white">
              Influencer (Creator) Name
            </Typography>
            <TextField
              select
              SelectProps={{ native: true }}
              placeholder="Select Influencer"
              fullWidth
              margin="normal"
              value={tokenInfo.influencerId}
              onChange={handleChange('influencerId')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            >
              <option value="">-- Select Influencer --</option>
              {influencers.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.email}
                </option>
              ))}
            </TextField>

            {/* Token Name */}
            <Typography variant="subtitle1" color="white">
              Token Name
            </Typography>
            <TextField
              placeholder="Enter token name"
              fullWidth
              margin="normal"
              value={tokenInfo.tokenName}
              onChange={handleChange('tokenName')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Token Symbol */}
            <Typography variant="subtitle1" color="white">
              Token Symbol
            </Typography>
            <TextField
              placeholder="Enter token symbol"
              fullWidth
              margin="normal"
              value={tokenInfo.tokenSymbol}
              onChange={handleChange('tokenSymbol')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Total Supply */}
            <Typography variant="subtitle1" color="white">
              Total Supply
            </Typography>
            <TextField
              placeholder="Enter total supply"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.totalSupply}
              onChange={handleChange('totalSupply')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Decimals */}
            <Typography variant="subtitle1" color="white">
              Decimals
            </Typography>
            <TextField
              placeholder="Enter number of decimals"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.decimals}
              onChange={handleChange('decimals')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {/* Revenue Share */}
            <Typography variant="subtitle1" color="white">
              Revenue Share (%)
            </Typography>
            <TextField
              placeholder="Enter revenue share percentage"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.revenueShare}
              onChange={handleChange('revenueShare')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Distribution Frequency */}
            <Typography variant="subtitle1" color="white">
              Distribution Frequency (seconds)
            </Typography>
            <TextField
              placeholder="Enter distribution frequency"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.distributionFrequency}
              onChange={handleChange('distributionFrequency')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Minimum Payout Threshold */}
            <Typography variant="subtitle1" color="white">
              Minimum Payout Threshold ($)
            </Typography>
            <TextField
              placeholder="Enter minimum payout threshold"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.minPayout}
              onChange={handleChange('minPayout')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Vesting Period */}
            <Typography variant="subtitle1" color="white">
              Vesting Period (days)
            </Typography>
            <TextField
              placeholder="Enter vesting period in days"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.vestingPeriod}
              onChange={handleChange('vestingPeriod')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            {/* Token Price */}
            <Typography variant="subtitle1" color="white">
              Token Price ($)
            </Typography>
            <TextField
              placeholder="Enter token price in USD"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.tokenPrice}
              onChange={handleChange('tokenPrice')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Platform Fee */}
            <Typography variant="subtitle1" color="white">
              Platform Fee (%)
            </Typography>
            <TextField
              placeholder="Enter platform fee percentage"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.platformFee}
              onChange={handleChange('platformFee')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Creator Royalty */}
            <Typography variant="subtitle1" color="white">
              Creator Royalty (%)
            </Typography>
            <TextField
              placeholder="Enter creator royalty percentage"
              type="number"
              fullWidth
              margin="normal"
              value={tokenInfo.influencerRoyalty}
              onChange={handleChange('influencerRoyalty')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={tokenInfo.mintable}
                  onChange={handleChange('mintable')}
                />
              }
              label="Mintable/Burnable (Fixed Supply if unchecked)"
              sx={{ color: 'white', mt: 1 }}
            />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={tokenInfo.upgradeable}
                  onChange={handleChange('upgradeable')}
                />
              }
              label="Upgradeable (Multi-sig required)"
              sx={{ color: 'white', mt: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={tokenInfo.emergencyPause}
                  onChange={handleChange('emergencyPause')}
                />
              }
              label="Emergency Pause Enabled"
              sx={{ color: 'white', mt: 1 }}
            />

            {/* Legal Disclaimer */}
            <Typography variant="subtitle1" color="white">
              Legal Disclaimer / T&Cs
            </Typography>
            <TextField
              placeholder="Enter legal disclaimer text"
              fullWidth
              margin="normal"
              value={tokenInfo.legalDisclaimer}
              onChange={handleChange('legalDisclaimer')}
              variant="outlined"
              multiline
              rows={3}
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Terms & Conditions URL */}
            <Typography variant="subtitle1" color="white">
              Terms & Conditions URL
            </Typography>
            <TextField
              placeholder="Enter URL for T&Cs"
              fullWidth
              margin="normal"
              value={tokenInfo.termsUrl}
              onChange={handleChange('termsUrl')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {/* Jurisdiction */}
            <Typography variant="subtitle1" color="white">
              Jurisdiction
            </Typography>
            <TextField
              placeholder="Enter jurisdiction"
              fullWidth
              margin="normal"
              value={tokenInfo.jurisdiction}
              onChange={handleChange('jurisdiction')}
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Box>
        );
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="white" gutterBottom>
              Preview Token Creation
            </Typography>
            {previewData ? (
              <>
                <Typography color="white">
                  <strong>Influencer (Creator) ID:</strong> {previewData.influencerId}
                </Typography>
                <Typography color="white">
                  <strong>Token Name:</strong> {previewData.tokenName}
                </Typography>
                <Typography color="white">
                  <strong>Token Symbol:</strong> {previewData.tokenSymbol}
                </Typography>
                <Typography color="white">
                  <strong>Total Supply:</strong> {previewData.totalSupply}
                </Typography>
                <Typography color="white">
                  <strong>Revenue Share:</strong> {previewData.revenueShare}%
                </Typography>
                <Typography color="white">
                  <strong>Token Price:</strong> ${previewData.tokenPrice}
                </Typography>
                <Typography color="white">
                  <strong>Platform Fee:</strong> {previewData.platformFee}%
                </Typography>
                <Typography color="white">
                  <strong>Governance:</strong>{' '}
                  {previewData.upgradeable ? 'Upgradeable' : 'Non-upgradeable'},{' '}
                  {previewData.emergencyPause
                    ? 'Emergency Pause Enabled'
                    : 'No Emergency Pause'}
                </Typography>
                <Typography color="white">
                  <strong>Legal Disclaimer:</strong> {previewData.legalDisclaimer}
                </Typography>
                <Typography color="white">
                  <strong>T&Cs URL:</strong> {previewData.termsUrl}
                </Typography>
                <Typography color="white">
                  <strong>Jurisdiction:</strong> {previewData.jurisdiction}
                </Typography>
                <Typography color="white" sx={{ mt: 2 }}>
                  If everything looks correct, click "Deploy Token".
                </Typography>
              </>
            ) : (
              <Typography color="white">No preview data available.</Typography>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionToggle}
      sx={{ width: '100%', mt: 4, bgcolor: 'grey.900', color: 'white' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
        <Typography variant="h5">Token Creation Wizard</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Back
          </Button>
          <Button onClick={handleNext} variant="contained" color="primary">
            {activeStep === steps.length - 1 ? 'Deploy Token' : 'Next'}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default TokenCreationWizard;
