// src/components/CreatorLandingPageManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  IconButton, 
  Tooltip, 
  FormControlLabel, 
  Switch 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from 'react-router-dom';
import { firestore } from '../firebase';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define the validation schema using Yup (Icon URL field removed)
const schema = yup.object().shape({
  creatorName: yup.string().required('Creator Name is required'),
  tagline: yup.string().required('Tagline is required'),
  bannerImage: yup.string().url('Must be a valid URL').nullable(),
  landingPageUrl: yup.string().url('Must be a valid URL').required('Landing Page URL is required'),
  socialLinks: yup.string(),
  tiers: yup.array().of(
    yup.object().shape({
      tierName: yup.string().required('Tier Name is required'),
      threshold: yup
        .number()
        .typeError('Threshold must be a number')
        .required('Threshold is required')
        .min(0, 'Must be non‑negative'),
      benefits: yup.string().required('Benefits are required'),
    })
  ),
  exclusiveContent: yup.object().shape({
    contentUrl: yup.string().url('Must be a valid URL').nullable(),
    accessCode: yup.string(),
  }),
  eventSchedules: yup.array().of(
    yup.object().shape({
      title: yup.string().required('Event title is required'),
      date: yup.string().required('Event date is required'),
      description: yup.string().required('Event description is required'),
    })
  ),
  promotionalMaterials: yup.string(),
});

// Default values for the form (tiers without iconURI)
const defaultValues = {
  creatorName: '',
  tagline: '',
  bannerImage: '',
  landingPageUrl: '',
  socialLinks: '',
  tiers: [
    { tierName: 'Bronze', threshold: '', benefits: '' },
    { tierName: 'Silver', threshold: '', benefits: '' },
    { tierName: 'Gold', threshold: '', benefits: '' },
    { tierName: 'VIP', threshold: '', benefits: '' },
  ],
  exclusiveContent: {
    contentUrl: '',
    accessCode: '',
  },
  eventSchedules: [],
  promotionalMaterials: '',
};

// Shared style for TextField inputs (ensuring white background with black text)
const textFieldStyles = {
  bgcolor: 'white',
  borderRadius: 1,
  width: '100%',
  '& .MuiFormLabel-root': { color: 'lightgrey' },
  '& .MuiOutlinedInput-root': { color: 'black' },
};

function CreatorLandingPageManager() {
  const { tokenId } = useParams();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  // Manage dynamic tiers and events
  const { fields: tierFields, append: tierAppend, remove: tierRemove } = useFieldArray({
    control,
    name: 'tiers',
  });
  const { fields: eventFields, append: eventAppend, remove: eventRemove } = useFieldArray({
    control,
    name: 'eventSchedules',
  });

  // Toggle for membership threshold type: false = Fixed Number, true = Percentage
  const [usePercentage, setUsePercentage] = useState(false);

  // Fetch the current landing page data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const doc = await firestore.collection('tokens').doc(tokenId).get();
        if (doc.exists) {
          const data = doc.data();
          reset({
            creatorName: data.creatorName || '',
            tagline: data.tagline || '',
            bannerImage: data.imageUrl || '',
            landingPageUrl: data.landingPage || '',
            socialLinks: data.socialLinks || '',
            tiers: data.utilityConfig?.tiers || defaultValues.tiers,
            exclusiveContent: data.utilityConfig?.exclusiveContent || { contentUrl: '', accessCode: '' },
            eventSchedules: data.utilityConfig?.eventSchedules || [],
            promotionalMaterials: data.utilityConfig?.promotionalMaterials || '',
          });
          if (data.utilityConfig?.tiersArePercentage) {
            setUsePercentage(true);
          }
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      }
    };
    fetchData();
  }, [tokenId, reset]);

  const onSubmit = async (formData) => {
    try {
      // Consolidate utility configuration data
      const utilityConfig = {
        tiers: formData.tiers,
        exclusiveContent: formData.exclusiveContent,
        eventSchedules: formData.eventSchedules,
        promotionalMaterials: formData.promotionalMaterials,
        tiersArePercentage: usePercentage,
      };
      await firestore.collection('tokens').doc(tokenId).update({
        creatorName: formData.creatorName,
        tagline: formData.tagline,
        imageUrl: formData.bannerImage,
        landingPage: formData.landingPageUrl,
        socialLinks: formData.socialLinks,
        utilityConfig,
      });
      alert(`Landing page for token ${tokenId} updated successfully!`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Creator Landing Page Manager
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <Accordion defaultExpanded={false} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            sx={{ bgcolor: 'black' }}
          >
            <Typography variant="h5" color="white">Basic Information</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'black' }}>
            <Box sx={{ p: 2 }}>
              <TextField
                label="Creator Name"
                fullWidth
                margin="normal"
                size="small"
                {...register('creatorName')}
                error={!!errors.creatorName}
                helperText={errors.creatorName?.message}
                sx={textFieldStyles}
              />
              <TextField
                label="Landing Page URL"
                fullWidth
                margin="normal"
                size="small"
                {...register('landingPageUrl')}
                error={!!errors.landingPageUrl}
                helperText={errors.landingPageUrl?.message || 'Custom URL for your public landing page'}
                sx={textFieldStyles}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <TextField
                  label="Banner Image URL"
                  margin="normal"
                  size="small"
                  {...register('bannerImage')}
                  error={!!errors.bannerImage}
                  helperText={errors.bannerImage?.message || 'URL for your landing page banner image'}
                  sx={{ ...textFieldStyles, flex: 1 }}
                />
                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                  Upload Image
                  <input type="file" hidden accept="image/*,video/*" />
                </Button>
              </Box>
              <TextField
                label="Social Media Links"
                fullWidth
                margin="normal"
                size="small"
                {...register('socialLinks')}
                error={!!errors.socialLinks}
                helperText={errors.socialLinks?.message || 'Comma-separated URLs for your social profiles'}
                sx={textFieldStyles}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Manage Memberships Section */}
        <Accordion defaultExpanded={false} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            sx={{ bgcolor: 'black' }}
          >
            <Typography variant="h5" color="white">Manage Memberships</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'black' }}>
            <Typography variant="subtitle1" color="white" sx={{ mb: 2 }}>
              Tiers
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography variant="body2" color="white" sx={{ mr: 1 }}>
                Tier Type:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={usePercentage}
                    onChange={(e) => setUsePercentage(e.target.checked)}
                    color="primary"
                  />
                }
                label={usePercentage ? 'Percentage' : 'Fixed Number'}
                sx={{ color: 'white' }}
              />
            </Box>
            {tierFields.map((tier, index) => (
              <Box key={tier.id} sx={{ mb: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Tier Name"
                      fullWidth
                      size="small"
                      {...register(`tiers.${index}.tierName`)}
                      error={!!errors.tiers?.[index]?.tierName}
                      helperText={errors.tiers?.[index]?.tierName?.message}
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label={usePercentage ? 'Threshold (%)' : 'Threshold (tokens)'}
                      type="number"
                      fullWidth
                      size="small"
                      {...register(`tiers.${index}.threshold`)}
                      error={!!errors.tiers?.[index]?.threshold}
                      helperText={errors.tiers?.[index]?.threshold?.message}
                      sx={{ ...textFieldStyles, maxWidth: '120px' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Benefits"
                      fullWidth
                      size="small"
                      {...register(`tiers.${index}.benefits`)}
                      error={!!errors.tiers?.[index]?.benefits}
                      helperText={errors.tiers?.[index]?.benefits?.message}
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Tooltip title="Remove this tier" arrow>
                      <IconButton onClick={() => tierRemove(index)} sx={{ color: 'white' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => tierAppend({ tierName: '', threshold: '', benefits: '' })}>
              Add Tier
            </Button>

            {/* Exclusive Content & Event Configuration Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" color="white">
                Exclusive Content & Event Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Exclusive Content URL"
                    fullWidth
                    margin="normal"
                    size="small"
                    {...register('exclusiveContent.contentUrl')}
                    error={!!errors.exclusiveContent?.contentUrl}
                    helperText={errors.exclusiveContent?.contentUrl?.message || 'URL to exclusive content (e.g., private video)'}
                    sx={textFieldStyles}
                  />
                  <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    Upload Content
                    <input type="file" hidden accept="image/*,video/*" />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Access Code"
                    fullWidth
                    margin="normal"
                    size="small"
                    {...register('exclusiveContent.accessCode')}
                    error={!!errors.exclusiveContent?.accessCode}
                    helperText={errors.exclusiveContent?.accessCode?.message || 'Code required to access exclusive content'}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Event Schedule & Details"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    size="small"
                    {...register('eventSchedules')}
                    value={eventFields.map((field) => `${field.title || ''} - ${field.date || ''} - ${field.description || ''}`).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      const events = lines.map((line) => {
                        const [title = '', date = '', description = ''] = line.split(' - ');
                        return { title: title.trim(), date: date.trim(), description: description.trim() };
                      });
                      reset((prev) => ({
                        ...prev,
                        eventSchedules: events,
                      }));
                    }}
                    helperText="Enter one event per line: Title - Date - Description"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Promotional Materials Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" color="white">
                Promotional Materials
              </Typography>
              <TextField
                label="Promotional Materials"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                size="small"
                {...register('promotionalMaterials')}
                error={!!errors.promotionalMaterials}
                helperText={errors.promotionalMaterials?.message || 'Optional promotional text or HTML'}
                sx={textFieldStyles}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </form>
    </Container>
  );
}

export default CreatorLandingPageManager;