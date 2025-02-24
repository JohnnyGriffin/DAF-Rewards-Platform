// src/components/TokenomicsSuite.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend);

function TokenomicsSuite() {
  // Market Condition Factor Module
  const [marketFactor, setMarketFactor] = useState(1.0);
  const [advancedMarketInput, setAdvancedMarketInput] = useState('');

  // Global Simulation Parameters
  const [discountRate, setDiscountRate] = useState(10);
  const [timeHorizon, setTimeHorizon] = useState(5);

  // Token Supply & Pricing Optimization (in $)
  const [supply, setSupply] = useState(1000000);
  const [basePrice, setBasePrice] = useState(100);

  // Break‑even Analysis Inputs (in $ per year)
  const [upfrontOffer, setUpfrontOffer] = useState(50000);
  const [influencerRevenueShare, setInfluencerRevenueShare] = useState(50);
  const [adminRevenueShare, setAdminRevenueShare] = useState(50);
  const [annualInfluencerRevenue, setAnnualInfluencerRevenue] = useState(1000);
  const [annualAdminRevenue, setAnnualAdminRevenue] = useState(1000);
  const [breakEvenInfluencer, setBreakEvenInfluencer] = useState(null);
  const [breakEvenAdmin, setBreakEvenAdmin] = useState(null);
  const [breakEvenTokens, setBreakEvenTokens] = useState(null);

  // Sensitivity Analysis & Monte Carlo Simulation States
  const [sensitivityParam, setSensitivityParam] = useState(10);
  const [monteCarloResult, setMonteCarloResult] = useState(null);
  const [simulationStats, setSimulationStats] = useState(null);

  // Derived Calculations
  const optimizedPrice = basePrice * marketFactor;
  const totalFundsRaised = supply * optimizedPrice;

  // Break‑even Analysis Calculation
  const computeBreakEven = () => {
    const influencerCashFlow = totalFundsRaised * (influencerRevenueShare / 100);
    const adminCashFlow = totalFundsRaised * (adminRevenueShare / 100);
    let cumulativeInfluencer = 0;
    let cumulativeAdmin = 0;
    let breakEvenYearInfluencer = null;
    let breakEvenYearAdmin = null;
    for (let year = 1; year <= timeHorizon; year++) {
      cumulativeInfluencer += influencerCashFlow / Math.pow(1 + discountRate / 100, year);
      cumulativeAdmin += adminCashFlow / Math.pow(1 + discountRate / 100, year);
      if (!breakEvenYearInfluencer && cumulativeInfluencer >= upfrontOffer) {
        breakEvenYearInfluencer = year;
      }
      if (!breakEvenYearAdmin && cumulativeAdmin >= upfrontOffer) {
        breakEvenYearAdmin = year;
      }
    }
    const cashFlowPerTokenInfluencer = influencerCashFlow / supply;
    const breakEvenTokensInfluencer = upfrontOffer / cashFlowPerTokenInfluencer;
    setBreakEvenInfluencer(breakEvenYearInfluencer);
    setBreakEvenAdmin(breakEvenYearAdmin);
    setBreakEvenTokens(breakEvenTokensInfluencer);
  };

  // Sensitivity Analysis Helper
  function sensitivityParameters() {
    return [
      { name: 'Discount Rate', delta: (discountRate - 15) * 100 },
      { name: 'Conversion Factor', delta: (0.005 - 0.005) * 20000 },
      { name: 'Revenue Share', delta: (influencerRevenueShare - 10) * 300 },
      { name: 'Token Price', delta: (basePrice - 100) * 50 },
      { name: 'Total Supply', delta: (supply - 1000000) / 1000 },
      { name: 'Time Horizon', delta: (timeHorizon - 5) * 200 },
      { name: 'Market Factor', delta: (marketFactor - 1) * 500 }
    ];
  }

  const tornadoData = {
    labels: sensitivityParameters().map(p => p.name),
    datasets: [
      {
        label: 'NPV Change ($)',
        data: sensitivityParameters().map(p => p.delta),
        backgroundColor: 'orange'
      }
    ]
  };

  // Dummy Monte Carlo Simulation
  const runMonteCarlo = () => {
    const iterations = 1000;
    const simulatedNPVs = Array.from({ length: iterations }, () => {
      const randomDiscount = discountRate + (Math.random() - 0.5) * 5;
      const randomConversion = 0.005 + (Math.random() - 0.5) * 0.002;
      const annualCashFlow = totalFundsRaised * (influencerRevenueShare / 100) * randomConversion;
      let npv = 0;
      for (let t = 1; t <= timeHorizon; t++) {
        npv += annualCashFlow / Math.pow(1 + randomDiscount / 100, t);
      }
      return npv;
    });
    const mean = simulatedNPVs.reduce((a, b) => a + b, 0) / iterations;
    const sorted = [...simulatedNPVs].sort((a, b) => a - b);
    const median = sorted[Math.floor(iterations / 2)];
    const variance = simulatedNPVs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / iterations;
    setSimulationStats({ mean, median, variance });
    const bins = Array(10).fill(0);
    simulatedNPVs.forEach(npv => {
      const index = Math.min(Math.floor((npv / mean) * 5), 9);
      bins[index]++;
    });
    setMonteCarloResult(bins);
  };

  const monteCarloChartData = {
    labels: Array.from({ length: 10 }, (_, i) => `Bin ${i + 1}`),
    datasets: [
      {
        label: 'NPV Distribution ($)',
        data: monteCarloResult ? monteCarloResult : Array(10).fill(0),
        backgroundColor: 'purple'
      }
    ]
  };

  const supplyPricingData = {
    labels: ['Optimistic', 'Base', 'Pessimistic'],
    datasets: [
      {
        label: 'Projected Funds Raised ($)',
        data: [totalFundsRaised * 1.1, totalFundsRaised, totalFundsRaised * 0.9],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336']
      }
    ]
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Tokenomics Suite
      </Typography>
      <Typography variant="subtitle1" color="white" gutterBottom>
        Analyze token supply, pricing, break‑even points, sensitivity, and run simulations. All values are in $.
      </Typography>
  
      {/* Market Condition Factor Module */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Market Condition Factor
        </Typography>
        <Tooltip title="Adjust this slider to reflect overall market conditions. A value > 1 indicates favorable conditions.">
          <Slider
            value={marketFactor}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(e, newValue) => setMarketFactor(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main', mt: 2 }}
          />
        </Tooltip>
        <Accordion sx={{ mt: 2, bgcolor: 'black', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography>Advanced Market Condition Calculator</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Manual Market Factor"
              type="number"
              value={advancedMarketInput}
              onChange={(e) => setAdvancedMarketInput(e.target.value)}
              fullWidth
              margin="normal"
              helperText="Enter a custom market factor if known."
            />
            <Button variant="contained" color="secondary" onClick={() => {
              if (advancedMarketInput) setMarketFactor(parseFloat(advancedMarketInput));
            }} sx={{ mt: 1 }}>
              Update Market Factor
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
  
      {/* Global Simulation Sliders */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Simulation Parameters
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography color="white">Discount Rate (r): {discountRate}%</Typography>
          <Slider
            value={discountRate}
            min={5}
            max={25}
            step={0.5}
            onChange={(e, newValue) => setDiscountRate(newValue)}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
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
      </Box>
  
      {/* Token Supply & Pricing Optimization Module */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Token Supply & Pricing Optimization
        </Typography>
        <TextField
          label="Total Token Supply"
          type="number"
          value={supply}
          onChange={(e) => setSupply(parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Base Token Price ($)"
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
          helperText="Enter the base token price in dollars."
        />
        <Typography variant="body1" color="white" sx={{ mt: 2 }}>
          Optimized Token Price ($): {optimizedPrice.toFixed(2)}
        </Typography>
        <Typography variant="body1" color="white">
          Total Funds Raised Projection ($): {totalFundsRaised.toFixed(2)}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Line
            data={supplyPricingData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Projected Funds Raised under Different Market Scenarios' }
              }
            }}
          />
        </Box>
      </Box>
  
      {/* Break‑even Analysis Module */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Break-even Analysis
        </Typography>
        <Typography variant="body2" color="white" sx={{ mb: 1 }}>
          Enter the upfront offer and annual revenue figures to compute the break‑even point.
        </Typography>
        <TextField
          label="Upfront Offer ($)"
          type="number"
          value={upfrontOffer}
          onChange={(e) => setUpfrontOffer(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Influencer Revenue Share (%)"
          type="number"
          value={influencerRevenueShare}
          onChange={(e) => setInfluencerRevenueShare(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Annual Influencer Revenue ($)"
          type="number"
          value={annualInfluencerRevenue}
          onChange={(e) => setAnnualInfluencerRevenue(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Admin Revenue Share (%)"
          type="number"
          value={adminRevenueShare}
          onChange={(e) => setAdminRevenueShare(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Annual Admin Revenue ($)"
          type="number"
          value={annualAdminRevenue}
          onChange={(e) => setAnnualAdminRevenue(parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={computeBreakEven} sx={{ mt: 2 }}>
          Compute Break-even
        </Button>
        {(breakEvenInfluencer !== null || breakEvenAdmin !== null) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="white">
              Influencer Break-even (years): {breakEvenInfluencer ? breakEvenInfluencer.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant="body1" color="white">
              Admin Break-even (years): {breakEvenAdmin ? breakEvenAdmin.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant="body1" color="white">
              Break-even Tokens (for influencer): {breakEvenTokens ? breakEvenTokens.toFixed(0) : 'N/A'}
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="white">
            Cumulative Cash Flow Projection
          </Typography>
          <Line
            data={{
              labels: Array.from({ length: timeHorizon }, (_, i) => `Year ${i + 1}`),
              datasets: [
                {
                  label: 'Cumulative Cash Flow ($)',
                  data: Array.from({ length: timeHorizon }, (_, year) => {
                    let cumulative = 0;
                    const annualCF = totalFundsRaised * (influencerRevenueShare / 100);
                    for (let t = 1; t <= year + 1; t++) {
                      cumulative += annualCF / Math.pow(1 + discountRate / 100, t);
                    }
                    return cumulative;
                  }),
                  borderColor: 'cyan',
                  fill: false,
                  tension: 0.3
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Cumulative Discounted Cash Flow' }
              },
              scales: {
                x: { title: { display: true, text: 'Time (Years)' } },
                y: { title: { display: true, text: 'Cumulative Cash Flow ($)' } }
              }
            }}
          />
        </Box>
      </Box>
  
      {/* Sensitivity Analysis Module */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Sensitivity Analysis
        </Typography>
        <Typography variant="body2" color="white" sx={{ mt: 1 }}>
          Adjust the parameters below to see their impact on NPV.
        </Typography>
        <Slider
          value={sensitivityParam}
          min={0}
          max={20}
          step={1}
          onChange={(e, newValue) => setSensitivityParam(newValue)}
          valueLabelDisplay="auto"
          sx={{ color: 'primary.main', mt: 2 }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="white">
            NPV Sensitivity:
          </Typography>
          <Bar
            data={tornadoData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Tornado Diagram: Impact on NPV' }
              },
              scales: {
                x: { title: { display: true, text: 'Parameters' } },
                y: { title: { display: true, text: 'NPV Change ($)' } }
              }
            }}
          />
        </Box>
      </Box>
  
      {/* Monte Carlo Simulation Module */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Monte Carlo Simulation
        </Typography>
        <Typography variant="body2" color="white" sx={{ mt: 1 }}>
          Run the simulation to obtain a probability distribution of NPV outcomes.
        </Typography>
        <Button variant="contained" color="primary" onClick={runMonteCarlo} sx={{ mt: 2 }}>
          Run Monte Carlo Simulation
        </Button>
        {monteCarloResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="white">
              Monte Carlo Simulation Histogram:
            </Typography>
            <Bar
              data={monteCarloChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: true, text: 'NPV Distribution from Monte Carlo Simulation' }
                },
                scales: {
                  x: { title: { display: true, text: 'Bins' } },
                  y: { title: { display: true, text: 'Frequency' } }
                }
              }}
            />
            {simulationStats && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="white">
                  Mean NPV: ${simulationStats.mean.toFixed(2)} | Median: ${simulationStats.median.toFixed(2)} | Variance: {simulationStats.variance.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                  Recommendation: 70% of outcomes fall between ${simulationStats.median - 5000} and ${simulationStats.median + 5000}. Consider adjusting your discount rate if volatility increases.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
  
      {/* Performance Metrics Dashboard & Reporting Section */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Performance Metrics Dashboard
        </Typography>
        <Typography variant="body1" color="white">
          ROI Projections, Liquidity Analysis, Creator Royalty Forecasts, etc.
        </Typography>
      </Box>
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2 }}>
        <Typography variant="h6" color="white">
          Reporting
        </Typography>
        <Button variant="outlined" color="primary">
          Download Report (PDF/CSV)
        </Button>
      </Box>
    </Container>
  );
}

export default TokenomicsSuite;
