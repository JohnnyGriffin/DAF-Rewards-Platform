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
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { deployTokenContract, initBlockchain } from '../blockchain';
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
  const [walletConnected, setWalletConnected] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Removed "jurisdiction" from the UI, but still in tokenInfo if needed in the backend.
  // Added allowSecondaryMarket property to hide platformFee/royalty unless toggled on.
  const [tokenInfo, setTokenInfo] = useState({
    influencerId: '',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    totalSupply: '',
    revenueShare: '',
    distributionFrequency: '', // now in days
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
    // jurisdiction: '', <-- removed from the UI
    allowSecondaryMarket: false, // New toggle
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
      // Final step: deploy token contract and show confirmation dialog
      try {
        const tokenContract = await deployTokenContract(
          tokenInfo.tokenName,
          tokenInfo.tokenSymbol,
          tokenInfo.totalSupply
        );
        const tokenDocRef = await firestore.collection('tokens').add({
          ...tokenInfo,
          creatorId: tokenInfo.influencerId,
          createdAt: new Date(),
          contractAddress: tokenContract.address,
        });
        const landingPage = `${baseUrl}/landing/${tokenDocRef.id}`;
        await firestore.collection('tokens').doc(tokenDocRef.id).update({ landingPage });
        setConfirmData({
          tokenName: tokenInfo.tokenName,
          tokenSymbol: tokenInfo.tokenSymbol,
          tokenPrice: tokenInfo.tokenPrice,
          revenueShare: tokenInfo.revenueShare,
          totalSupply: tokenInfo.totalSupply,
          vestingPeriod: tokenInfo.vestingPeriod,
          contractAddress: tokenContract.address,
          landingPage: landingPage,
        });
        setConfirmDialogOpen(true);
      } catch (error) {
        console.error('Error deploying token:', error);
        alert(error.message);
      }
    } else {
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
    // Handle toggles (checkbox/switch) vs textfields
    let value;
    if (e.target.type === 'checkbox' || e.target.type === 'switch') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    setTokenInfo((prev) => ({ ...prev, [field]: value }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        // Basic Token Info
        return (
          <Box sx={{ mt: 2 }}>
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
        // Revenue Sharing
        return (
          <Box sx={{ mt: 2 }}>
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

            {/* Updated: Distribution Frequency is in days now, not seconds */}
            <Typography variant="subtitle1" color="white">
              Distribution Frequency (days)
            </Typography>
            <TextField
              placeholder="Enter distribution frequency in days"
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
        // Tokenomics & Sale
        return (
          <Box sx={{ mt: 2 }}>
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

            {/* Secondary Market Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={tokenInfo.allowSecondaryMarket}
                  onChange={handleChange('allowSecondaryMarket')}
                  color="primary"
                />
              }
              label="Allow Secondary Market Trading"
              sx={{ color: 'white', mt: 1 }}
            />

            {/* Show Platform Fee & Creator Royalty only if allowSecondaryMarket is on */}
            {tokenInfo.allowSecondaryMarket && (
              <>
                <Typography variant="subtitle1" color="white" sx={{ mt: 2 }}>
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
              </>
            )}

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
        // Governance & Legal
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

            {/* Removed Jurisdiction field */}
          </Box>
        );
      case 4:
        // Preview & Deploy
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

                {/* Show Platform Fee & Creator Royalty only if allowSecondaryMarket is on */}
                {previewData.allowSecondaryMarket && (
                  <>
                    <Typography color="white">
                      <strong>Platform Fee:</strong> {previewData.platformFee}%
                    </Typography>
                    <Typography color="white">
                      <strong>Creator Royalty:</strong> {previewData.influencerRoyalty}%
                    </Typography>
                  </>
                )}

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
    <>
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

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
              Back
            </Button>
            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  try {
                    initBlockchain();
                    setWalletConnected(true);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                disabled={walletConnected}
              >
                {walletConnected ? 'Wallet Connected' : 'Connect Wallet (Test)'}
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              disabled={activeStep === steps.length - 1 && !walletConnected}
            >
              {activeStep === steps.length - 1 ? 'Deploy Token' : 'Next'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Token Deployed Successfully</DialogTitle>
        <DialogContent>
          {confirmData && (
            <Box>
              <Typography variant="subtitle1">
                <strong>Token Name:</strong> {confirmData.tokenName}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Token Symbol:</strong> {confirmData.tokenSymbol}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Token Price:</strong> ${confirmData.tokenPrice}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Revenue Share:</strong> {confirmData.revenueShare}%
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Supply:</strong> {confirmData.totalSupply}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Vesting Period:</strong> {confirmData.vestingPeriod} days
              </Typography>
              <Typography variant="subtitle1">
                <strong>Contract Address:</strong> {confirmData.contractAddress}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Landing Page:</strong>{' '}
                <a href={confirmData.landingPage} target="_blank" rel="noopener noreferrer" style={{ color: '#00aeff' }}>
                  {confirmData.landingPage}
                </a>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Close</Button>
          <Button onClick={() => navigate('/admin')} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TokenCreationWizard;