// src/components/EditLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { firestore } from '../firebase';

function EditLandingPage() {
  const { tokenId } = useParams();
  const [landingPageData, setLandingPageData] = useState({
    url: '',
    imageUrl: '',
    socialLinks: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doc = await firestore.collection('tokens').doc(tokenId).get();
        if (doc.exists) {
          setLandingPageData({
            url: doc.data().landingPage || '',
            imageUrl: doc.data().imageUrl || '',
            socialLinks: doc.data().socialLinks || '',
          });
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };
    fetchData();
  }, [tokenId]);

  const handleSave = async () => {
    try {
      await firestore.collection('tokens').doc(tokenId).update({
        landingPage: landingPageData.url,
        imageUrl: landingPageData.imageUrl,
        socialLinks: landingPageData.socialLinks,
      });
      alert(`Landing page for token ${tokenId} updated!`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Edit Landing Page
      </Typography>
      <TextField
        label="Landing Page URL"
        fullWidth
        margin="normal"
        value={landingPageData.url}
        onChange={(e) => setLandingPageData({ ...landingPageData, url: e.target.value })}
        sx={{ bgcolor: 'white', borderRadius: 1 }}
      />
      <TextField
        label="Image URL"
        fullWidth
        margin="normal"
        value={landingPageData.imageUrl}
        onChange={(e) => setLandingPageData({ ...landingPageData, imageUrl: e.target.value })}
        helperText="Enter the URL for the landing page image."
        sx={{ bgcolor: 'white', borderRadius: 1 }}
      />
      <TextField
        label="Social Media Links"
        fullWidth
        margin="normal"
        value={landingPageData.socialLinks}
        onChange={(e) => setLandingPageData({ ...landingPageData, socialLinks: e.target.value })}
        helperText="Enter comma-separated social media URLs."
        sx={{ bgcolor: 'white', borderRadius: 1 }}
      />
      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
        Save Changes
      </Button>
    </Container>
  );
}

export default EditLandingPage;
