// src/components/CreatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Link } from '@mui/material';
import { auth, firestore } from '../firebase';

function CreatorDashboard() {
  const [tokens, setTokens] = useState([]);
  // If a creator can have multiple tokens, you might want to show them all. For now, we take the first token:
  const token = tokens[0] || null;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = firestore
        .collection('tokens')
        .where('creatorId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
          const tokensData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTokens(tokensData);
        });
      return () => unsubscribe();
    }
  }, []);

  return (
    <Container sx={{ mt: 5 }}>
      <Card sx={{ bgcolor: 'grey.900', p: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" color="white">
            Creator Performance Summary
          </Typography>
          {token ? (
            <>
              <Typography color="white">
                <strong>Token Name:</strong> {token.name}
              </Typography>
              <Typography color="white">
                <strong>Token Symbol:</strong> {token.symbol}
              </Typography>
              <Typography color="white">
                <strong>Current Price:</strong> $
                {token.price ? parseFloat(token.price).toFixed(2) : '0.00'}
              </Typography>
              <Typography color="white">
                <strong>Landing Page:</strong>{' '}
                {token.landingPage ? (
                  <Link href={token.landingPage} target="_blank" sx={{ color: '#00aeff' }}>
                    {token.landingPage}
                  </Link>
                ) : (
                  'N/A'
                )}
              </Typography>
            </>
          ) : (
            <Typography color="white">No token data available.</Typography>
          )}
        </CardContent>
      </Card>
      <Typography variant="h6" color="white" gutterBottom>
        Detailed Analytics
      </Typography>
      {/* Insert charts and additional performance data as needed */}
    </Container>
  );
}

export default CreatorDashboard;
