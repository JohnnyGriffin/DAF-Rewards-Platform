// src/components/CreatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { auth, firestore } from '../firebase';

function CreatorDashboard() {
  // State for creator info
  const [creator, setCreator] = useState(null);
  // For editing the creator name at the top
  const [editingName, setEditingName] = useState(true);
  const [creatorName, setCreatorName] = useState('');

  // State for landing page info (used for live preview and saved info)
  const [landingInfo, setLandingInfo] = useState({
    bannerUrl: '',
    socialLinks: '',
    promotionalMaterials: '',
    membershipTiers: 'Bronze, Silver, Gold, VIP',
    exclusiveContent: 'Access to exclusive videos and behind‑the‑scenes content',
    eventSchedule: 'Live Q&A on Fridays at 7 PM',
    tokenPrice: '',
    revenueShare: '',
    revenueSharePerToken: '',
    createdAt: ''
  });

  // Manage Memberships (Tiers) state and toggle for percentage mode
  const [tiers, setTiers] = useState([
    { tier: 'Bronze', threshold: '', benefits: 'Basic benefits' },
    { tier: 'Silver', threshold: '', benefits: 'Intermediate benefits' },
    { tier: 'Gold', threshold: '', benefits: 'Advanced benefits' },
    { tier: 'VIP', threshold: '', benefits: 'Premium benefits' },
  ]);
  const [usePercentageForTiers, setUsePercentageForTiers] = useState(false);

  // Accordion expanded states (all collapsed by default)
  const [livePreviewExpanded, setLivePreviewExpanded] = useState(false);
  const [basicInfoExpanded, setBasicInfoExpanded] = useState(false);
  const [manageMembershipsExpanded, setManageMembershipsExpanded] = useState(false);

  // Fetch creator info from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      firestore.collection('users').doc(user.uid).get().then((doc) => {
        const data = doc.data() || {};
        setCreator({
          uid: user.uid,
          email: user.email,
          name: data.name || 'Creator Name',
          landingPageVisits: data.landingPageVisits || 0,
          landingPage: data.landingPage || `http://example.com/landing/${user.uid}`,
        });
        setCreatorName(data.name || 'Creator Name');
        if (data.landingInfo) {
          setLandingInfo(data.landingInfo);
        }
      });
    }
  }, []);

  // Handler to update creator name
  const handleNameSubmit = async () => {
    try {
      await firestore.collection('users').doc(creator.uid).update({ name: creatorName });
      setCreator(prev => ({ ...prev, name: creatorName }));
      setEditingName(false);
    } catch (error) {
      console.error('Error updating creator name:', error);
      alert(error.message);
    }
  };

  // Handler to save Basic Information (update landingInfo in Firestore)
  const handleBasicInfoSave = async () => {
    try {
      await firestore.collection('users').doc(creator.uid).update({ landingInfo });
      alert('Basic Information updated successfully!');
    } catch (error) {
      console.error('Error updating basic info:', error);
      alert(error.message);
    }
  };

  // Handler to update tier values
  const handleTierChange = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
    const tiersString = newTiers
      .map(t => `${t.tier} (${usePercentageForTiers ? t.threshold + '%' : t.threshold}): ${t.benefits}`)
      .join(', ');
    setLandingInfo(prev => ({ ...prev, membershipTiers: tiersString }));
  };

  // Toggle handler for tier percentage mode (only visible when expanded)
  const handleToggleTiers = (e) => {
    setUsePercentageForTiers(e.target.checked);
  };

  // Handler to save Manage Memberships section
  const handleMembershipsSave = async () => {
    try {
      await firestore.collection('users').doc(creator.uid).update({
        landingInfo: {
          ...landingInfo,
          membershipTiers: tiers
            .map(
              (t) =>
                `${t.tier} (${usePercentageForTiers ? t.threshold + '%' : t.threshold}): ${t.benefits}`
            )
            .join(', ')
        }
      });
      alert('Memberships updated successfully!');
    } catch (error) {
      console.error('Error updating memberships:', error);
      alert(error.message);
    }
  };

  // For live preview, use sample token info from landingInfo (replace with real values as needed)
  const sampleToken = {
    tokenPrice: landingInfo.tokenPrice || 'N/A',
    revenueShare: landingInfo.revenueShare || 'N/A',
    revenueSharePerToken: landingInfo.revenueSharePerToken || 'N/A',
    createdAt: landingInfo.createdAt || 'N/A',
    imageUrl: landingInfo.bannerUrl || ''
  };

  return (
    <Container sx={{ mt: 5, pb: 3 }}>
      {/* Top Section: Editable Creator Name, Landing Page Visits, and Landing Page URL */}
      <Box sx={{ mb: 3 }}>
        {editingName ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
            <Button variant="contained" size="small" onClick={handleNameSubmit}>
              Submit
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" color="white">{creator?.name}</Typography>
            <IconButton size="small" onClick={() => setEditingName(true)} sx={{ color: 'white' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Typography variant="subtitle1" color="white">
          Landing Page Visits: {creator?.landingPageVisits || 0}
        </Typography>
        <Typography variant="subtitle1" color="white">
          Landing Page URL:{' '}
          <Link href={creator?.landingPage || ''} target="_blank" sx={{ color: '#00aeff' }}>
            {creator?.landingPage || ''}
          </Link>
        </Typography>
      </Box>

      {/* Live Preview Section (Collapsed by Default, with spacing) */}
      <Accordion expanded={livePreviewExpanded} onChange={() => setLivePreviewExpanded(!livePreviewExpanded)} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography variant="h5" color="white">Live Preview</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'black', p: 2, borderRadius: 2 }}>
          {/* Banner/Video Preview */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="white">Banner/Video Preview:</Typography>
            {sampleToken.imageUrl ? (
              <Box
                component="img"
                src={sampleToken.imageUrl}
                alt="Banner Preview"
                sx={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 2, mt: 1 }}
              />
            ) : (
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.600',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <Typography color="white">No Banner Available</Typography>
              </Box>
            )}
          </Box>
          {/* Token Details for Live Preview */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="white">Token Name:</Typography>
            <Typography variant="body2" color="white">{creator?.name || 'N/A'}</Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="white">Price:</Typography>
            <Typography variant="body2" color="white">
              ${landingInfo.tokenPrice ? Number(landingInfo.tokenPrice).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="white">Revenue Share:</Typography>
            <Typography variant="body2" color="white">
              {landingInfo.revenueShare ? landingInfo.revenueShare + '%' : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="white">Revenue Share Per Token:</Typography>
            <Typography variant="body2" color="white">
              ${landingInfo.revenueSharePerToken || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="white">Created At:</Typography>
            <Typography variant="body2" color="white">
              {landingInfo.createdAt || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="white">Membership Benefits:</Typography>
            <Typography variant="body2" color="white">
              {landingInfo.promotionalMaterials || 'Not set'}
            </Typography>
          </Box>
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Save Live Preview
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Basic Information Section (Collapsed by Default, with spacing) */}
      <Accordion expanded={basicInfoExpanded} onChange={() => setBasicInfoExpanded(!basicInfoExpanded)} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography variant="h5" color="white">Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'black', p: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Banner Image URL"
                  fullWidth
                  margin="normal"
                  value={landingInfo.bannerUrl}
                  onChange={(e) => setLandingInfo({ ...landingInfo, bannerUrl: e.target.value })}
                  InputLabelProps={{ style: { color: 'black' } }}
                  InputProps={{ style: { color: 'black' } }}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
                <Button variant="contained" component="label" sx={{ mt: '16px' }}>
                  Upload
                  <input type="file" hidden />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Social Media Links"
                fullWidth
                margin="normal"
                value={landingInfo.socialLinks}
                onChange={(e) => setLandingInfo({ ...landingInfo, socialLinks: e.target.value })}
                InputLabelProps={{ style: { color: 'black' } }}
                InputProps={{ style: { color: 'black' } }}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Grid>
          </Grid>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleBasicInfoSave}>
            Save Basic Information
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Manage Memberships Section (Collapsed by Default, with spacing) */}
      <Accordion expanded={manageMembershipsExpanded} onChange={() => setManageMembershipsExpanded(!manageMembershipsExpanded)} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography variant="h5" color="white">Manage Memberships</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'black', p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="white">Tiers</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={usePercentageForTiers}
                  onChange={handleToggleTiers}
                  color="primary"
                />
              }
              label="Percentage Mode"
              sx={{ ml: 2, color: 'white' }}
            />
          </Box>
          <Grid container spacing={2}>
            {tiers.map((tier, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Tier Name"
                    value={tier.tier}
                    onChange={(e) => handleTierChange(index, 'tier', e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ flex: 1, bgcolor: 'white', borderRadius: 1 }}
                    InputProps={{ style: { color: 'black' } }}
                    InputLabelProps={{ style: { color: 'black' } }}
                  />
                  <TextField
                    label={usePercentageForTiers ? "Threshold (%)" : "Threshold (tokens)"}
                    value={tier.threshold}
                    onChange={(e) => handleTierChange(index, 'threshold', e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: 150, bgcolor: 'white', borderRadius: 1 }}
                    InputProps={{ style: { color: 'black' } }}
                    InputLabelProps={{ style: { color: 'black' } }}
                  />
                  <TextField
                    label="Benefits"
                    value={tier.benefits}
                    onChange={(e) => handleTierChange(index, 'benefits', e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ flex: 2, bgcolor: 'white', borderRadius: 1 }}
                    InputProps={{ style: { color: 'black' } }}
                    InputLabelProps={{ style: { color: 'black' } }}
                  />
                  <IconButton
                    onClick={() => {
                      const newTiers = tiers.filter((_, i) => i !== index);
                      setTiers(newTiers);
                      const tiersString = newTiers
                        .map(t => `${t.tier} (${usePercentageForTiers ? t.threshold + '%' : t.threshold}): ${t.benefits}`)
                        .join(', ');
                      setLandingInfo(prev => ({ ...prev, membershipTiers: tiersString }));
                    }}
                    sx={{ color: 'white' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
          {/* Additional Membership Inputs: Exclusive Content, Event Schedule, Promotional Materials */}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Exclusive Content URL"
                  fullWidth
                  margin="normal"
                  value={landingInfo.exclusiveContent}
                  onChange={(e) => setLandingInfo({ ...landingInfo, exclusiveContent: e.target.value })}
                  InputLabelProps={{ style: { color: 'black' } }}
                  InputProps={{ style: { color: 'black' } }}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                  Upload Content
                  <input type="file" hidden />
                </Button>
              </Grid>
            </Grid>
            <TextField
              label="Event Schedule & Details"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={landingInfo.eventSchedule}
              onChange={(e) => setLandingInfo({ ...landingInfo, eventSchedule: e.target.value })}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Promotional Materials"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={landingInfo.promotionalMaterials}
              onChange={(e) => setLandingInfo({ ...landingInfo, promotionalMaterials: e.target.value })}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Box>
          {/* Save Button for Manage Memberships */}
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleMembershipsSave}>
            Save Memberships
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Embed Creator Landing Page Manager Inline (no heading) */}
      <Box sx={{ mt: 4 }}>
        {/* CreatorLandingPageManager component can be embedded here if needed */}
      </Box>
    </Container>
  );
}

export default CreatorDashboard;