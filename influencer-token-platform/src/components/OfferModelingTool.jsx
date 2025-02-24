// src/components/OfferModelingTool.jsx
import React, { useState } from 'react';
import {
  Container,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

function OfferModelingTool() {
  const navigate = useNavigate();
  const [manualRevenue, setManualRevenue] = useState('');
  const [usePublicData, setUsePublicData] = useState(false);
  const [followers, setFollowers] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [conversionFactor, setConversionFactor] = useState(0.005);
  const [discountRate, setDiscountRate] = useState(10);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [offerFactor, setOfferFactor] = useState(50);
  const [result, setResult] = useState(null);

  // Advanced discount inputs
  const [riskFreeRate, setRiskFreeRate] = useState(3);
  const [equityRiskPremium, setEquityRiskPremium] = useState(5);
  const [industryRiskPremium, setIndustryRiskPremium] = useState(2.5);
  const computedDiscountRate = riskFreeRate + equityRiskPremium + industryRiskPremium;

  const updateDiscountRate = () => {
    setDiscountRate(computedDiscountRate);
  };

  const runSimulation = () => {
    let R = 0;
    if (manualRevenue) {
      R = parseFloat(manualRevenue);
    } else if (usePublicData && followers && engagementRate) {
      const effectiveFollowers = parseFloat(followers) * (parseFloat(engagementRate) / 100);
      R = effectiveFollowers * conversionFactor;
    }

    const annualCashFlow = R * 0.1; // Assume 10% revenue share
    let npv = 0;
    for (let t = 1; t <= timeHorizon; t++) {
      npv += annualCashFlow / Math.pow(1 + discountRate / 100, t);
    }
    const recommendedOffer = (offerFactor / 100) * npv;

    setResult({ R, annualCashFlow, npv, recommendedOffer });
  };

  const proceedToTokenomicsSuite = () => {
    if (result) {
      localStorage.setItem('simulationResult', JSON.stringify(result));
    }
    navigate('/admin?tab=tokenomics');
  };

  const chartData = {
    labels: Array.from({ length: timeHorizon }, (_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Optimistic Scenario',
        data: Array.from({ length: timeHorizon }, (_, i) =>
          result ? (result.npv * 1.1) / (i + 1) : 0
        ),
        borderColor: 'green',
        tension: 0.3,
      },
      {
        label: 'Base Scenario',
        data: Array.from({ length: timeHorizon }, (_, i) =>
          result ? result.npv / (i + 1) : 0
        ),
        borderColor: 'blue',
        tension: 0.3,
      },
      {
        label: 'Pessimistic Scenario',
        data: Array.from({ length: timeHorizon }, (_, i) =>
          result ? (result.npv * 0.9) / (i + 1) : 0
        ),
        borderColor: 'red',
        tension: 0.3,
      },
    ],
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Creator Offer Evaluation Tool
      </Typography>
      <Typography variant="subtitle1" color="white" gutterBottom>
        Estimate future tokenized revenue using manual inputs or public social media data.
      </Typography>

      <Box component="form" noValidate sx={{ mt: 2 }}>
        {/* Annual Net Revenue */}
        <Typography variant="subtitle1" color="white">
          Annual Net Revenue ($) – Optional
        </Typography>
        <TextField
          placeholder="Enter annual net revenue"
          type="number"
          value={manualRevenue}
          onChange={(e) => setManualRevenue(e.target.value)}
          fullWidth
          margin="normal"
          helperText="If provided, this value is used directly."
          sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
        />

        {/* Use Public Data Toggle */}
        <FormControlLabel
          control={
            <Switch checked={usePublicData} onChange={(e) => setUsePublicData(e.target.checked)} />
          }
          label="Use Public Data"
          sx={{ color: 'white', mt: 1 }}
        />

        {usePublicData && (
          <>
            <Typography variant="subtitle1" color="white">
              Total Followers (Primary Platform)
            </Typography>
            <TextField
              placeholder="Enter total followers"
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              fullWidth
              margin="normal"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />

            <Typography variant="subtitle1" color="white">
              Engagement Rate (%)
            </Typography>
            <TextField
              placeholder="Enter engagement rate"
              type="number"
              value={engagementRate}
              onChange={(e) => setEngagementRate(e.target.value)}
              fullWidth
              margin="normal"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />
          </>
        )}

        <Typography variant="subtitle1" color="white">
          Conversion Factor (CF) ($ per effective follower per year)
        </Typography>
        <TextField
          placeholder="Enter conversion factor"
          type="number"
          step="0.001"
          value={conversionFactor}
          onChange={(e) => setConversionFactor(e.target.value)}
          fullWidth
          margin="normal"
          helperText="Default: 0.005 $ per effective follower per year"
          sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
        />

        {/* Discount Rate Slider */}
        <Box sx={{ mt: 3 }}>
          <Typography color="white">Discount Rate (r): {discountRate}%</Typography>
          <Slider
            value={discountRate}
            min={5}
            max={15}
            step={0.5}
            onChange={(e, newValue) => setDiscountRate(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
        </Box>

        {/* Advanced Discount Rate Calculator */}
        <Accordion sx={{ mt: 2, bgcolor: 'black', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography>Advanced Discount Rate Calculator</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle1" color="white">
              Risk-Free Rate (%)
            </Typography>
            <TextField
              placeholder="Enter risk-free rate"
              type="number"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
              fullWidth
              margin="normal"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />

            <Typography variant="subtitle1" color="white">
              Equity Risk Premium (%)
            </Typography>
            <TextField
              placeholder="Enter equity risk premium"
              type="number"
              value={equityRiskPremium}
              onChange={(e) => setEquityRiskPremium(parseFloat(e.target.value))}
              fullWidth
              margin="normal"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />

            <Typography variant="subtitle1" color="white">
              Industry/Influencer Risk Premium (%)
            </Typography>
            <TextField
              placeholder="Enter industry risk premium"
              type="number"
              value={industryRiskPremium}
              onChange={(e) => setIndustryRiskPremium(parseFloat(e.target.value))}
              fullWidth
              margin="normal"
              sx={{ bgcolor: 'white', borderRadius: 1, input: { color: 'black' } }}
            />

            <Typography sx={{ mt: 2 }} color="white">
              Overall Discount Rate: {computedDiscountRate}%
            </Typography>
            <Button variant="contained" color="primary" onClick={updateDiscountRate} sx={{ mt: 1 }}>
              Calculate Discount Rate
            </Button>
          </AccordionDetails>
        </Accordion>

        {/* Time Horizon Slider */}
        <Box sx={{ mt: 3 }}>
          <Typography color="white">Time Horizon (T): {timeHorizon} years</Typography>
          <Slider
            value={timeHorizon}
            min={1}
            max={10}
            step={1}
            onChange={(e, newValue) => setTimeHorizon(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
        </Box>

        {/* Offer Factor Slider */}
        <Box sx={{ mt: 3 }}>
          <Typography color="white">Offer Factor (α): {offerFactor}%</Typography>
          <Slider
            value={offerFactor}
            min={5}
            max={70}
            step={1}
            onChange={(e, newValue) => setOfferFactor(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={runSimulation}>
            Run Simulation
          </Button>
          <Button variant="contained" color="primary" onClick={proceedToTokenomicsSuite}>
            Proceed to Tokenomics Suite
          </Button>
        </Box>
      </Box>

      {/* Results & Chart */}
      {result && (
        <>
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.900', borderRadius: 2 }}>
            <Typography variant="h6" color="white">
              Simulation Summary
            </Typography>
            <Typography color="white">NPV: ${result.npv.toFixed(2)}</Typography>
            <Typography color="white">
              Recommended Upfront Offer: ${result.recommendedOffer.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Fundraising Outcome under Different Market Scenarios ($)',
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Container>
  );
}

export default OfferModelingTool;
