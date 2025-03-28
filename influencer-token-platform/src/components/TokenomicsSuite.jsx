// src/components/TokenomicsSuite.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Slider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ChartTooltip,
  Legend
);

// Reusable slider with label and tooltip
const SliderWithValue = ({ label, value, onChange, min, max, step, tooltip, disabled = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
    <Tooltip title={tooltip} arrow>
      <Typography variant="caption" sx={{ minWidth: 150, color: 'white' }}>
        {label}
      </Typography>
    </Tooltip>
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      min={min}
      max={max}
      step={step}
      valueLabelDisplay="auto"
      sx={{ flex: 1, color: 'primary.main' }}
      disabled={disabled}
    />
    <Typography variant="caption" sx={{ ml: 2, minWidth: 80, color: 'white' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Typography>
  </Box>
);

// Box–Muller transform for normally distributed random number
function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Chart helper: Generate Density Data for the Plot Density Chart (with heatmap colors)
const generateDensityData = (finalTokenPrice, recommendedSupply) => {
  const points = [];
  const epsilon = 0.001;
  const priceMin = finalTokenPrice * 0.8;
  const priceMax = finalTokenPrice * 1.2;
  const supplyMin = recommendedSupply * 0.8;
  const supplyMax = recommendedSupply * 1.2;
  const numPoints = 10;
  for (let i = 0; i < numPoints; i++) {
    const price = priceMin + ((priceMax - priceMin) / (numPoints - 1)) * i;
    for (let j = 0; j < numPoints; j++) {
      const supply = supplyMin + ((supplyMax - supplyMin) / (numPoints - 1)) * j;
      const normPriceDiff = (price - finalTokenPrice) / finalTokenPrice;
      const normSupplyDiff = (supply - recommendedSupply) / recommendedSupply;
      const distanceSq = normPriceDiff ** 2 + normSupplyDiff ** 2;
      const density = 1 / (epsilon + distanceSq);
      let color = '#0000FF'; // blue by default
      if (density > 5) color = '#FF0000'; // red for high density
      else if (density > 3) color = '#FFA500'; // orange for medium
      points.push({ x: price, y: supply, r: Math.min(10, density * 0.5), color });
    }
  }
  return {
    datasets: [
      {
        label: 'Optimal Density',
        data: points,
        pointBackgroundColor: (context) => context.raw.color,
        pointRadius: (context) => context.raw.r,
      },
    ],
  };
};

// Chart helper: Generate Parallel Coordinates Data
const generateParallelData = (finalTokenPrice, recommendedSupply, presentValue, discountRate) => {
  const labels = ['Token Price', 'Token Supply', 'NPV', 'Discount Rate'];
  const currentMetrics = [
    finalTokenPrice * 0.97,
    recommendedSupply * 1.03,
    presentValue * 0.99,
    discountRate,
  ];
  const optimizedMetrics = [finalTokenPrice, recommendedSupply, presentValue, discountRate];
  const normalizedCurrent = optimizedMetrics.map((opt, idx) => currentMetrics[idx] / opt);
  const normalizedOptimized = optimizedMetrics.map(() => 1);
  return {
    labels,
    datasets: [
      {
        label: 'Current Metrics',
        data: normalizedCurrent,
        borderColor: 'rgba(255,159,64,1)',
        backgroundColor: 'rgba(255,159,64,0.3)',
        tension: 0.3,
        fill: false,
        pointStyle: 'circle',
        pointRadius: 4,
      },
      {
        label: 'Optimized Metrics',
        data: normalizedOptimized,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.3)',
        tension: 0.3,
        fill: false,
        pointStyle: 'rectRot',
        pointRadius: 4,
      },
    ],
  };
};

// Chart helper: Generate Sensitivity Data for the Multi-Line Sensitivity Chart
const generateSensitivityData = (targetUnitValue) => {
  const premiumRange = [];
  for (let p = 5; p <= 20; p += 1) {
    premiumRange.push(p);
  }
  const marketFactors = [0.9, 1.0, 1.1];
  const datasets = marketFactors.map((mf, index) => {
    const data = premiumRange.map((p) => targetUnitValue * (1 + p / 100) * mf);
    const colors = ['#ff4081', '#00aeff', '#4caf50'];
    return {
      label: `Market Factor ${mf}`,
      data,
      borderColor: colors[index],
      fill: false,
      tension: 0.3,
      pointRadius: 3,
    };
  });
  return {
    labels: premiumRange.map((p) => `${p}%`),
    datasets,
  };
};

// Chart helper: Generate Price Discovery Data
const generatePriceDiscoveryData = (projectedRevenue, rDecimal, timeHorizon, recommendedSupply, finalTokenPrice) => {
  const labels = [];
  const perTokenValues = [];
  let cumulative = 0;
  for (let t = 1; t <= timeHorizon; t++) {
    labels.push(`Year ${t}`);
    cumulative += projectedRevenue / Math.pow(1 + rDecimal, t);
    perTokenValues.push(cumulative / recommendedSupply);
  }
  return {
    labels,
    datasets: [
      {
        label: 'Per-Token Intrinsic Value',
        data: perTokenValues,
        borderColor: '#ff4081',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Final Recommended Price',
        data: Array(timeHorizon).fill(finalTokenPrice),
        borderColor: '#00aeff',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };
};

function TokenomicsSuite() {
  // Load saved offer evaluation data (if any) from localStorage
  const savedData = localStorage.getItem('offerEvaluationData');
  const initialData = savedData ? JSON.parse(savedData) : {};

  // Basic Inputs (with defaults or saved values)
  // Projected Revenue slider: min 50,000; max 500,000; step 1.
  const [projectedRevenue, setProjectedRevenue] = useState(initialData.manualProjectedRevenue || 100000);
  // Time Horizon slider now goes from 1 to 2 years.
  const [timeHorizon, setTimeHorizon] = useState(initialData.timeHorizon || 1);

  // Discount factors
  const [riskFreeRate, setRiskFreeRate] = useState(initialData.riskFreeRate || 3);
  const [equityRiskPremium, setEquityRiskPremium] = useState(initialData.equityRiskPremium || 5);
  const [industryPremium, setIndustryPremium] = useState(initialData.industryPremium || 2.5);
  const [manualDiscount, setManualDiscount] = useState(initialData.manualDiscount || false);

  // Revenue Share percentage slider
  const [revSharePct, setRevSharePct] = useState(initialData.revSharePct || 10);

  // Offer Discount slider (default 10% discount on intrinsic value)
  const [offerDiscount, setOfferDiscount] = useState(initialData.offerDiscount || 10);

  // Market & Utility Inputs
  const [marketFactor, setMarketFactor] = useState(initialData.marketFactor || 1.0);
  const [targetUnitValue, setTargetUnitValue] = useState(initialData.targetUnitValue || 0.10);
  const [offeringPremium, setOfferingPremium] = useState(initialData.offeringPremium || 10);

  // New Input: Distribution Frequency in Days
  const [distributionFrequency, setDistributionFrequency] = useState(initialData.distributionFrequency || 7);

  // New Toggle: Allow Secondary Market Trading and its fields
  const [allowSecondaryTrading, setAllowSecondaryTrading] = useState(initialData.allowSecondaryTrading || false);
  const [platformFee, setPlatformFee] = useState(initialData.platformFee || 2);
  const [creatorRoyalty, setCreatorRoyalty] = useState(initialData.creatorRoyalty || 5);

  // Calculate effective intrinsic value
  const effectiveIntrinsic = targetUnitValue * marketFactor;

  // Calculate discount rate based on risk factors when enabled; otherwise, discount is 0.
  const discountRate = manualDiscount ? (riskFreeRate + equityRiskPremium + industryPremium) : 0;
  const rDecimal = discountRate / 100;

  // Calculate overall NPV using Discounted Cash Flow
  const [presentValue, setPresentValue] = useState(0);
  useEffect(() => {
    let pvCalc = 0;
    if (rDecimal > 0) {
      for (let t = 1; t <= timeHorizon; t++) {
        pvCalc += projectedRevenue / Math.pow(1 + rDecimal, t);
      }
    } else {
      pvCalc = projectedRevenue * timeHorizon;
    }
    setPresentValue(pvCalc);
  }, [projectedRevenue, rDecimal, timeHorizon]);

  // Calculate revenue share NPV, recommended supply, etc.
  const npvRevShare = presentValue * (revSharePct / 100);
  const recommendedSupply = effectiveIntrinsic > 0 ? npvRevShare / effectiveIntrinsic : 0;
  const offerPrice = effectiveIntrinsic * (1 - offerDiscount / 100);
  const recommendedTokenPrice = effectiveIntrinsic * (1 + offeringPremium / 100);
  const tokenSaleRevenue = recommendedSupply * recommendedTokenPrice;
  const percentRevenuePerToken = recommendedSupply ? (revSharePct / recommendedSupply) * 100 : 0;

  // Helper to format numbers with commas
  const formatNumber = (num) => Number(num).toLocaleString();

  // Recommendation Breakdown Data
  const recommendationBreakdown = {
    offerPrice: offerPrice.toFixed(2),
    recommendedTokenPrice: recommendedTokenPrice.toFixed(2),
    recommendedSupply: Math.round(recommendedSupply),
    tokenSaleRevenue: tokenSaleRevenue.toFixed(2),
  };

  // Advanced Analysis (Monte Carlo Simulation) – omitted from UI
  const [mcData, setMcData] = useState(null);
  const [mcStats, setMcStats] = useState({ avg: 0, stdDev: 0 });
  useEffect(() => {
    const iterations = 1000;
    const simulatedPrices = [];
    for (let i = 0; i < iterations; i++) {
      const revenueSim = projectedRevenue * (1 + 0.10 * randn_bm());
      const rSim = rDecimal * (1 + 0.01 * randn_bm());
      let pvSim = 0;
      for (let t = 1; t <= timeHorizon; t++) {
        pvSim += projectedRevenue / Math.pow(1 + rSim, t);
      }
      const priceSim = (pvSim / effectiveIntrinsic) * (1 + offeringPremium / 100);
      simulatedPrices.push(priceSim);
    }
    const avg = simulatedPrices.reduce((sum, v) => sum + v, 0) / iterations;
    const variance = simulatedPrices.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / iterations;
    const stdDev = Math.sqrt(variance);
    setMcStats({ avg, stdDev });
    const binCount = 20;
    const minPrice = Math.min(...simulatedPrices);
    const maxPrice = Math.max(...simulatedPrices);
    const binSize = (maxPrice - minPrice) / binCount;
    const bins = Array(binCount).fill(0);
    simulatedPrices.forEach((price) => {
      let binIndex = Math.floor((price - minPrice) / binSize);
      if (binIndex >= binCount) binIndex = binCount - 1;
      bins[binIndex]++;
    });
    setMcData({
      labels: Array.from({ length: binCount }, (_, i) => (minPrice + binSize * i).toFixed(2)),
      datasets: [
        {
          label: 'Final Price Distribution',
          data: bins,
          backgroundColor: 'rgba(75,192,192,0.6)',
        },
      ],
    });
  }, [projectedRevenue, rDecimal, timeHorizon, effectiveIntrinsic, offeringPremium]);

  // Break-even Analysis
  const costThreshold = 0.5 * projectedRevenue * timeHorizon;
  let breakEvenYear = 'N/A';
  const cumulativeDCF = [];
  let cumulative = 0;
  for (let t = 1; t <= timeHorizon; t++) {
    cumulative += projectedRevenue / Math.pow(1 + rDecimal, t);
    cumulativeDCF.push(cumulative);
    if (breakEvenYear === 'N/A' && cumulative >= costThreshold) {
      breakEvenYear = t;
    }
  }
  const breakEvenData = {
    labels: Array.from({ length: timeHorizon }, (_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Cumulative DCF',
        data: cumulativeDCF,
        borderColor: '#ff4081',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Cost Threshold',
        data: Array(timeHorizon).fill(costThreshold),
        borderColor: '#00aeff',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  // Handle Preview and Deploy: Connect to wallet and deploy token live.
  const handleDeploy = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected account:", accounts[0]);
        const { ethers } = await import("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // TODO: Replace the following placeholder values with your token contract's ABI and bytecode.
        const tokenAbi = [ /* Your token contract ABI here */ ];
        const tokenBytecode = "0x..."; // Your token contract bytecode here
        const factory = new ethers.ContractFactory(tokenAbi, tokenBytecode, signer);
        // Optionally, pass constructor parameters if required.
        const contract = await factory.deploy(/* constructor parameters if any */);
        await contract.deployed();
        alert(`Token deployed successfully at address: ${contract.address}`);
      } catch (error) {
        console.error("Error deploying token:", error);
        alert("Failed to deploy token.");
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet extension.");
    }
  };

  // Proceed button: Save slider state to localStorage for Tokenomics Suite.
  const handleProceed = () => {
    const dataToSave = {
      manualProjectedRevenue,
      totalFollowers: initialData.totalFollowers,  // if applicable
      engagementRate: initialData.engagementRate,      // if applicable
      conversionFactor: initialData.conversionFactor,    // if applicable
      totalViews: initialData.totalViews,                // if applicable
      cpm: initialData.cpm,                              // if applicable
      numberOfSubscribers: initialData.numberOfSubscribers, // if applicable
      monthlySubscriptionFee: initialData.monthlySubscriptionFee, // if applicable
      numberOfPPVPurchases: initialData.numberOfPPVPurchases, // if applicable
      ppvPrice: initialData.ppvPrice,                    // if applicable
      timeHorizon,
      riskFreeRate,
      equityRiskPremium,
      industryPremium,
      revSharePct,
      offerDiscount,
      targetUnitValue,
      manualDiscount,
      distributionFrequency,
      allowSecondaryTrading,
      platformFee,
      creatorRoyalty,
    };
    localStorage.setItem('offerEvaluationData', JSON.stringify(dataToSave));
    // Proceed to the next page if needed.
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>Tokenomics Suite</Typography>
      
      {/* Financial and Market Inputs */}
      <Grid container spacing={2}>
        {/* Left Column: Financial Inputs */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'black', borderRadius: 2 }}>
            <Typography variant="h6" color="white">Financial Inputs</Typography>
            <SliderWithValue
              label="Projected Revenue ($)"
              value={projectedRevenue}
              onChange={setProjectedRevenue}
              min={50000}
              max={500000}
              step={1}
              tooltip="Enter the annual revenue expected (50,000 - 500,000)"
            />
            <SliderWithValue
              label="Time Horizon (Years)"
              value={timeHorizon}
              onChange={setTimeHorizon}
              min={1}
              max={2}
              step={1}
              tooltip="Years to discount future revenue"
         
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.checked)}
                    color="primary"
                  />
                }
                label="Apply Discount Rate"
                sx={{ color: 'white' }}
              />
              {manualDiscount && (
                <Box sx={{ mt: 1 }}>
                  {/* Inline risk sliders matching the style of other sliders */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="white" sx={{ display: 'block' }}>Risk-Free (%)</Typography>
                      <Slider
                        value={riskFreeRate}
                        onChange={(e, newValue) => setRiskFreeRate(newValue)}
                        min={0}
                        max={10}
                        step={0.5}
                        valueLabelDisplay="auto"
                        sx={{ color: 'primary.main' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="white" sx={{ display: 'block' }}>Equity (%)</Typography>
                      <Slider
                        value={equityRiskPremium}
                        onChange={(e, newValue) => setEquityRiskPremium(newValue)}
                        min={0}
                        max={10}
                        step={0.5}
                        valueLabelDisplay="auto"
                        sx={{ color: 'primary.main' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="white" sx={{ display: 'block' }}>Industry (%)</Typography>
                      <Slider
                        value={industryPremium}
                        onChange={(e, newValue) => setIndustryPremium(newValue)}
                        min={0}
                        max={5}
                        step={0.5}
                        valueLabelDisplay="auto"
                        sx={{ color: 'primary.main' }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color="white">
                      Current Discount Rate: {(riskFreeRate + equityRiskPremium + industryPremium).toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="white">
                      (Risk-Free: {riskFreeRate}%, Equity: {equityRiskPremium}%, Industry: {industryPremium}%)
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            <SliderWithValue
              label="Revenue Share (%)"
              value={revSharePct}
              onChange={setRevSharePct}
              min={0}
              max={100}
              step={1}
              tooltip="Percentage of future revenue to acquire"
            />
            <SliderWithValue
              label="Offer Discount (%)"
              value={offerDiscount}
              onChange={setOfferDiscount}
              min={0}
              max={50}
              step={1}
              tooltip="Discount applied to intrinsic value for offer price (default 10%)"
            />
          </Box>
        </Grid>
        {/* Right Column: Market & Utility Inputs */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'black', borderRadius: 2 }}>
            <Typography variant="h6" color="white">Market & Utility Inputs</Typography>
            <SliderWithValue
              label="Market Factor"
              value={marketFactor}
              onChange={setMarketFactor}
              min={0.5}
              max={2.0}
              step={0.1}
              tooltip="Market multiplier (1.0 = neutral)"
            />
            <SliderWithValue
              label="Target Unit Value ($/token)"
              value={targetUnitValue}
              onChange={setTargetUnitValue}
              min={0.001}
              max={5.0}
              step={0.001}
              tooltip="Desired intrinsic value per token"
            />
            <SliderWithValue
              label="Offering Premium (%)"
              value={offeringPremium}
              onChange={setOfferingPremium}
              min={0}
              max={50}
              step={1}
              tooltip="Premium over intrinsic value (Recommended Token Price = Intrinsic Value × (1 + Premium/100))"
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Full-Width Offer and Token Recommendations Panel */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'black', borderRadius: 2, width: '100%' }}>
        <Typography variant="h6" color="white" align="center" gutterBottom>
          Offer and Token Recommendations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Offer Price = Intrinsic Value × (1 - Offer Discount/100)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Offer Price
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              ${formatNumber(recommendationBreakdown.offerPrice)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Recommended Token Price = Intrinsic Value × (1 + Offering Premium/100)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Recommended Token Price
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              ${formatNumber(recommendationBreakdown.recommendedTokenPrice)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Tooltip title="Recommended Token Supply = (NPV of Revenue Share) ÷ (Intrinsic Value)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Recommended Token Supply
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              {formatNumber(recommendationBreakdown.recommendedSupply)} tokens
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Tooltip title="Token Sale Revenue = Recommended Supply × Recommended Token Price" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Token Sale Revenue
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              ${formatNumber(recommendationBreakdown.tokenSaleRevenue)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Percent Revenue per Token = (Revenue Share (%) ÷ Recommended Token Supply) × 100" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                % Revenue per Token
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              {percentRevenuePerToken.toFixed(3)}%
            </Typography>
          </Grid>
        </Grid>
      </Box>
  
      {/* Advanced Analysis section removed as per requirements */}
  
    </Container>
  );
}

export default TokenomicsSuite;