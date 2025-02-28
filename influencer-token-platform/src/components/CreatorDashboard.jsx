// src/components/CreatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid, Button, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { auth, firestore } from '../firebase';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function CreatorDashboard() {
  const [tokens, setTokens] = useState([]);
  const [creator, setCreator] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch creator and tokens for the logged-in creator
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // For demo purposes, we also set dummy profile info
      setCreator({
        uid: user.uid,
        email: user.email,
        name: "Creator Name",
        bio: "This is a sample bio for the creator. It briefly describes their work and achievements.",
        profilePic: "https://via.placeholder.com/100",
        social: {
          twitter: "https://twitter.com",
          instagram: "https://instagram.com",
        },
        landingPageVisits: 1500, // Dummy value
      });
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

  // Calculate KPI metrics (using dummy calculations where needed)
  const totalTokensSold = tokens.reduce((acc, token) => acc + (token.sold || 0), 0);
  const totalRevenueGenerated = tokens.reduce((acc, token) => acc + ((token.price || 0) * (token.sold || 0)), 0);
  const avgTokenPrice = tokens.length > 0 ? tokens.reduce((acc, token) => acc + (token.price || 0), 0) / tokens.length : 0;
  const totalRevenueShareEarned = tokens.reduce((acc, token) => acc + (token.revenueEarned || 0), 0);
  const fanEngagementLevel = tokens.length > 0 ? tokens.reduce((acc, token) => acc + (token.fanEngagement || 0), 0) / tokens.length : 0;
  const landingPageVisits = creator ? creator.landingPageVisits : 0;

  // Chart Data (dummy data)
  const tokenSalesTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Tokens Sold',
        data: [100, 150, 200, 250, 300],
        borderColor: 'green',
        backgroundColor: 'rgba(0, 174, 255, 0.5)',
        fill: false,
      },
    ],
  };

  const revenueGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [100000, 150000, 210000, 280000, 350000],
        backgroundColor: 'blue',
      },
    ],
  };

  const fanEngagementData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Fan Engagement',
        data: [50, 60, 70, 65, 80],
        borderColor: 'purple',
        fill: false,
      },
    ],
  };

  const roiRevenueShareTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'ROI (%)',
        data: [5, 6, 7, 6.5, 7.2],
        borderColor: 'orange',
        yAxisID: 'y1',
        fill: false,
      },
      {
        label: 'Revenue Share Earned ($)',
        data: [5000, 6000, 7000, 6500, 7200],
        borderColor: 'cyan',
        yAxisID: 'y2',
        fill: false,
      },
    ],
  };

  const audienceDemographicsData = {
    labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
    datasets: [
      {
        data: [20, 35, 25, 15, 5],
        backgroundColor: ['#00aeff', '#ff4081', '#4caf50', '#ff9800', '#9c27b0'],
      },
    ],
  };

  // Handler to close the Profile Details Modal
  const handleProfileClose = () => {
    setProfileModalOpen(false);
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Card sx={{ bgcolor: 'grey.900', p: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={creator?.profilePic || 'https://via.placeholder.com/100'}
              alt="Profile"
              style={{ borderRadius: '50%', width: 100, height: 100 }}
            />
            <Box>
              <Typography variant="h5" color="white">
                {creator?.name || 'Creator Name'}
              </Typography>
              <Typography variant="body1" color="white">
                {creator?.bio || 'This is a brief bio about the creator.'}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Link href={creator?.social?.twitter} target="_blank" sx={{ color: '#00aeff', mr: 1 }}>
                  Twitter
                </Link>
                <Link href={creator?.social?.instagram} target="_blank" sx={{ color: '#00aeff' }}>
                  Instagram
                </Link>
              </Box>
              <Button variant="outlined" color="primary" sx={{ mt: 1 }} onClick={() => setProfileModalOpen(true)}>
                View Profile Details
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Tiles Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Total Tokens Sold
          </Typography>
          <Typography variant="h5" color="white">
            {totalTokensSold}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Total Revenue Generated
          </Typography>
          <Typography variant="h5" color="white">
            ${totalRevenueGenerated.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Average Token Price
          </Typography>
          <Typography variant="h5" color="white">
            ${avgTokenPrice.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Revenue Share Earned
          </Typography>
          <Typography variant="h5" color="white">
            ${totalRevenueShareEarned.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Fan Engagement Level
          </Typography>
          <Typography variant="h5" color="white">
            {fanEngagementLevel.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, flex: '1 1 200px' }}>
          <Typography variant="subtitle1" color="white">
            Landing Page Visits
          </Typography>
          <Typography variant="h5" color="white">
            {landingPageVisits}
          </Typography>
        </Box>
      </Box>

      {/* Detailed Charts & Graphs Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Detailed Analytics
        </Typography>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Token Sales Trend
          </Typography>
          <Line data={tokenSalesTrendData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Revenue Growth
          </Typography>
          <Bar data={revenueGrowthData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            Fan Engagement Trend
          </Typography>
          <Line data={fanEngagementData} options={{ responsive: true }} />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="white">
            ROI & Revenue Share Trend
          </Typography>
          <Line
            data={roiRevenueShareTrendData}
            options={{
              responsive: true,
              scales: {
                y1: {
                  type: 'linear',
                  position: 'left',
                  title: { display: true, text: 'ROI (%)' },
                },
                y2: {
                  type: 'linear',
                  position: 'right',
                  title: { display: true, text: 'Revenue Share ($)' },
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" color="white">
            Audience Demographics
          </Typography>
          <Pie data={audienceDemographicsData} options={{ responsive: true }} />
        </Box>
      </Box>

      {/* Actionable Tools and Alerts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Actionable Insights & Alerts
        </Typography>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle1" color="white">
            Real-Time Alerts
          </Typography>
          <Typography variant="body2" color="white">
            [Alerts will display here when thresholds are breached]
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => alert('Drill-down report coming soon!')}>
            Drill-Down Report
          </Button>
          <Button variant="outlined" color="primary" onClick={() => alert('Exporting report as CSV/PDF...')}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Additional Information and Tools Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="white" gutterBottom>
          Additional Information
        </Typography>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle1" color="white">
            Historical Performance Data
          </Typography>
          <Typography variant="body2" color="white">
            [Timeline/Comparison Chart Placeholder]
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle1" color="white">
            Customization Options
          </Typography>
          <Typography variant="body2" color="white">
            [Options to rearrange widgets, hide/show charts, etc.]
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" color="white">
            Guided Tips & Recommendations
          </Typography>
          <Typography variant="body2" color="white">
            [Tips: Consider running a promotional campaign if token sales are trending down.]
          </Typography>
        </Box>
      </Box>

      {/* Profile Details Modal */}
      <Dialog open={profileModalOpen} onClose={handleProfileClose}>
        <DialogTitle>Profile Details</DialogTitle>
        <DialogContent>
          {creator && (
            <Box>
              <Typography variant="h6" color="black">
                {creator.name}
              </Typography>
              <Typography variant="body1" color="black">
                {creator.bio}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Link href={creator.social.twitter} target="_blank" sx={{ color: '#00aeff', mr: 1 }}>
                  Twitter
                </Link>
                <Link href={creator.social.instagram} target="_blank" sx={{ color: '#00aeff' }}>
                  Instagram
                </Link>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreatorDashboard;
