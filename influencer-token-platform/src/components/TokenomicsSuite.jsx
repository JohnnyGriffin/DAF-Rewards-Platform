// src/components/TokenomicsSuite.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Slider,
  Button,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Scatter, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ChartTooltip,
  Legend
);

// Helper component: Slider with its current value displayed next to it
const SliderWithValue = ({ label, value, ...sliderProps }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
    <Typography variant="caption" color="white" sx={{ minWidth: 150 }}>
      {label}
    </Typography>
    <Slider {...sliderProps} value={value} />
    <Typography variant="caption" color="white" sx={{ ml: 2, minWidth: 50 }}>
      {value}
    </Typography>
  </Box>
);

function TokenomicsSuite() {
  // =============================================================
  // SECTION 1: CORE INPUTS
  // =============================================================
  const [projectedRevenue, setProjectedRevenue] = useState(1000000); // $1,000,000 annual revenue
  const [timeHorizon, setTimeHorizon] = useState(5); // Years
  const [targetROI, setTargetROI] = useState(20); // Target fan ROI (%)

  // =============================================================
  // SECTION 2: DISCOUNT RATE CALCULATOR
  // =============================================================
  const [riskFreeRate, setRiskFreeRate] = useState(3); // %
  const [equityRiskPremium, setEquityRiskPremium] = useState(5); // %
  const [industryPremium, setIndustryPremium] = useState(2.5); // %
  const optimizedDiscountRate = riskFreeRate + equityRiskPremium + industryPremium;

  // =============================================================
  // SECTION 3: LIQUIDITY & ROYALTY INPUTS
  // =============================================================
  const [liquidityPreference, setLiquidityPreference] = useState(50); // 0 = high liquidity, 100 = scarcity
  const [creatorRoyalty, setCreatorRoyalty] = useState(10); // Base creator royalty (%)

  // =============================================================
  // SECTION 4: LEGACY SUPPLY INPUT
  // =============================================================
  const baseSupplyValue = 1000000; // Baseline token supply

  // =============================================================
  // DERIVED CALCULATIONS
  // =============================================================
  const presentValueRevenue =
    projectedRevenue *
    (1 - Math.pow(1 + optimizedDiscountRate / 100, -timeHorizon)) /
    (optimizedDiscountRate / 100);

  const recommendedSupply = baseSupplyValue * ((100 - liquidityPreference + 50) / 150);
  const recommendedTokenPrice = presentValueRevenue / (recommendedSupply * (1 + targetROI / 100));
  const impliedFanROI = ((presentValueRevenue / recommendedSupply) / recommendedTokenPrice - 1) * 100;
  // For optimized values, force slight adjustments:
  const optimizedTokenPrice = recommendedTokenPrice * 1.05;
  const optimizedSupply = recommendedSupply * 0.95;
  const optimizedFanROI = impliedFanROI * 0.9;
  const optimizedCreatorRoyalty = creatorRoyalty * 1.1; // Use this as optimized creator royalty

  // ------------------------------------------------------------
  // COMMON SLIDER STYLE PROPS
  // ------------------------------------------------------------
  const commonSliderProps = {
    sx: { mt: 1, color: 'primary.main' },
    valueLabelDisplay: 'auto'
  };

  // =============================================================
  // SECTION 5: ADVANCED VISUALIZATIONS
  // =============================================================

  // 1. Plot Density (Contour Plot / Density Heat Map)
  const gridSize = 7;
  const contourDataPoints = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const price = recommendedTokenPrice * (0.8 + 0.4 * (i / (gridSize - 1)));
      const supplyVal = recommendedSupply * (0.8 + 0.4 * (j / (gridSize - 1)));
      const roi = impliedFanROI * (0.9 + 0.2 * ((i + j) / (2 * (gridSize - 1))));
      contourDataPoints.push({ x: price, y: supplyVal, roi });
    }
  }
  const contourRadii = contourDataPoints.map(pt => 4 + pt.roi / 50);
  const contourColors = contourDataPoints.map(pt => {
    const normalized = Math.min(1, Math.max(0, pt.roi / 100));
    const green = Math.round(normalized * 255);
    const red = 255 - green;
    return `rgb(${red}, ${green}, 0)`;
  });
  const densityData = {
    datasets: [
      {
        label: 'Density Plot',
        data: contourDataPoints,
        pointRadius: contourRadii,
        pointBackgroundColor: contourColors
      }
    ]
  };
  const densityOptions = {
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Token Price ($)' } },
      y: { title: { display: true, text: 'Token Supply' } }
    },
    plugins: { legend: { display: false } },
    responsive: true,
    layout: { padding: 10 }
  };

  // Color legend for the density plot (inside the same Box)
  const densityLegend = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="caption" color="white" sx={{ mr: 1 }}>
        Low ROI
      </Typography>
      <Box
        sx={{
          width: 100,
          height: 10,
          background: 'linear-gradient(to right, rgb(255,0,0), rgb(0,255,0))'
        }}
      />
      <Typography variant="caption" color="white" sx={{ ml: 1 }}>
        High ROI
      </Typography>
    </Box>
  );

  // 2. Parallel Coordinates Plot (Simulated via Line Chart)
  const parallelLabels = ['Token Price', 'Token Supply', 'Fan ROI', 'Creator Royalty'];
  const normalizedCurrent = [
    recommendedTokenPrice / 10,
    recommendedSupply / baseSupplyValue,
    impliedFanROI / 100,
    creatorRoyalty / 50
  ];
  const normalizedOptimized = [
    optimizedTokenPrice / 10,
    optimizedSupply / baseSupplyValue,
    optimizedFanROI / 100,
    optimizedCreatorRoyalty / 50
  ];
  const parallelData = {
    labels: parallelLabels,
    datasets: [
      {
        label: 'Current Metrics',
        data: normalizedCurrent,
        borderColor: 'rgba(255,159,64,1)',
        backgroundColor: 'rgba(255,159,64,0.3)',
        tension: 0.3,
        fill: false,
        pointStyle: 'circle',
        pointRadius: 4
      },
      {
        label: 'Optimized Metrics',
        data: normalizedOptimized,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.3)',
        tension: 0.3,
        fill: false,
        pointStyle: 'rectRot',
        pointRadius: 4
      }
    ]
  };
  const parallelOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        labels: parallelLabels,
        ticks: { font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        max: 1,
        ticks: { font: { size: 10 } },
        title: { display: true, text: 'Normalized Value' }
      }
    },
    plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
    responsive: true,
    layout: { padding: 10 }
  };

  // 3. Multi-Line Sensitivity Chart (Area Chart with Overlayed Lines)
  const targetROIValues = [];
  for (let roi = 10; roi <= 30; roi += 2) {
    const supplyFixed = baseSupplyValue * ((100 - liquidityPreference + 50) / 150);
    const price = presentValueRevenue / (supplyFixed * (1 + roi / 100));
    targetROIValues.push({ x: roi, y: price });
  }
  const liquidityValues = [];
  for (let liq = 30; liq <= 70; liq += 5) {
    const supplyVar = baseSupplyValue * ((100 - liq + 50) / 150);
    const price = presentValueRevenue / (supplyVar * (1 + targetROI / 100));
    liquidityValues.push({ x: liq, y: price });
  }
  const sensitivityData = {
    datasets: [
      {
        label: 'Target ROI Sensitivity',
        data: targetROIValues,
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        xAxisID: 'xTarget'
      },
      {
        label: 'Liquidity Sensitivity',
        data: liquidityValues,
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        xAxisID: 'xLiquidity'
      }
    ]
  };
  const sensitivityOptions = {
    maintainAspectRatio: false,
    scales: {
      xTarget: {
        type: 'linear',
        position: 'bottom',
        title: { display: true, text: 'Target ROI (%)' },
        min: 10,
        max: 30,
        ticks: { stepSize: 2, font: { size: 10 } }
      },
      xLiquidity: {
        type: 'linear',
        position: 'bottom',
        title: { display: true, text: 'Liquidity Preference' },
        min: 30,
        max: 70,
        ticks: { stepSize: 5, font: { size: 10 } }
      },
      y: {
        title: { display: true, text: 'Recommended Token Price ($)' },
        ticks: { font: { size: 10 } }
      }
    },
    plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
    responsive: true,
    layout: { padding: 10 }
  };

  // 4. Price Discovery Chart
  const perTokenDiscovery = (() => {
    const r = optimizedDiscountRate / 100;
    const annualCF = presentValueRevenue * r / (1 - Math.pow(1 + r, -timeHorizon));
    const dcfYears = [];
    const cumulativeDCF = [];
    let cumulative = 0;
    for (let t = 1; t <= timeHorizon; t++) {
      const cf = annualCF / Math.pow(1 + r, t);
      cumulative += cf;
      dcfYears.push(t);
      cumulativeDCF.push(cumulative);
    }
    return cumulativeDCF.map(c => c / recommendedSupply);
  })();
  const priceDiscoveryData = {
    labels: Array.from({ length: timeHorizon }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Per-Token Value ($)',
        data: perTokenDiscovery,
        borderColor: 'rgba(255,159,64,1)',
        backgroundColor: 'rgba(255,159,64,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Recommended Token Price',
        data: Array(timeHorizon).fill(recommendedTokenPrice),
        borderColor: 'rgba(54,162,235,1)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }
    ]
  };
  const priceDiscoveryOptions = {
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Year' }, ticks: { font: { size: 10 } } },
      y: { title: { display: true, text: 'Per-Token Value ($)' }, ticks: { font: { size: 10 } } }
    },
    plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
    responsive: true,
    layout: { padding: 10 }
  };

  // =============================================================
  // ADVANCED OPTIONS TOGGLE (Legacy Modules)
  // =============================================================
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedContent = (
    <Accordion sx={{ mt: 2, bgcolor: 'black', color: 'white' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
        <Typography>Advanced Analysis</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="white">
          Additional analyses (e.g., Monte Carlo Simulation, Break-even Analysis, and Cash Flow Projections) can be integrated here.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );

  // =============================================================
  // MOUNTED STATE: Delay rendering charts until after mount
  // =============================================================
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // =============================================================
  // RENDERING THE COMPONENT
  // =============================================================
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Tokenomics Suite
      </Typography>
      <Typography variant="subtitle1" color="white" gutterBottom>
        Determine the optimal token price, supply, and creator royalty to maximize fan ROI and promote a thriving secondary market.
      </Typography>

      {/* Top Row: Core Inputs & Discount Rate Calculator */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Core Inputs */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '48%' }, p: 2, bgcolor: 'black', borderRadius: 2 }}>
          <Typography variant="h6" color="white">Core Inputs</Typography>
          <SliderWithValue
            label="Projected Revenue ($)"
            min={0}
            max={10000000}
            step={100000}
            value={projectedRevenue}
            onChange={(e, newValue) => setProjectedRevenue(newValue)}
          />
          <SliderWithValue
            label="Time Horizon (Years)"
            min={1}
            max={20}
            step={1}
            value={timeHorizon}
            onChange={(e, newValue) => setTimeHorizon(newValue)}
          />
          <SliderWithValue
            label="Target ROI for Fans (%)"
            min={0}
            max={100}
            step={1}
            value={targetROI}
            onChange={(e, newValue) => setTargetROI(newValue)}
          />
        </Box>

        {/* Discount Rate Calculator */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '48%' }, p: 2, bgcolor: 'black', borderRadius: 2 }}>
          <Typography variant="h6" color="white">Discount Rate Calculator</Typography>
          <SliderWithValue
            label="Risk-Free Rate (%)"
            min={0}
            max={10}
            step={0.1}
            value={riskFreeRate}
            onChange={(e, newValue) => setRiskFreeRate(newValue)}
          />
          <SliderWithValue
            label="Equity Risk Premium (%)"
            min={0}
            max={20}
            step={0.1}
            value={equityRiskPremium}
            onChange={(e, newValue) => setEquityRiskPremium(newValue)}
          />
          <SliderWithValue
            label="Industry Premium (%)"
            min={0}
            max={10}
            step={0.1}
            value={industryPremium}
            onChange={(e, newValue) => setIndustryPremium(newValue)}
          />
          <Typography variant="body2" color="white" sx={{ mt: 1 }}>
            Optimized Discount Rate: {optimizedDiscountRate.toFixed(2)}%
          </Typography>
        </Box>
      </Box>

      {/* Second Row: Liquidity & Royalty Inputs & Optimized Recommendations */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
        {/* Liquidity & Royalty Inputs */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '48%' }, p: 2, bgcolor: 'black', borderRadius: 2 }}>
          <Typography variant="h6" color="white">Liquidity & Royalty Inputs</Typography>
          <SliderWithValue
            label="Liquidity Preference"
            min={0}
            max={100}
            step={1}
            value={liquidityPreference}
            onChange={(e, newValue) => setLiquidityPreference(newValue)}
          />
          <SliderWithValue
            label="Base Creator Royalty (%)"
            min={0}
            max={50}
            step={0.5}
            value={creatorRoyalty}
            onChange={(e, newValue) => setCreatorRoyalty(newValue)}
          />
        </Box>

        {/* Optimized Recommendations */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '48%' }, p: 2, bgcolor: 'black', borderRadius: 2 }}>
          <Typography variant="h6" color="white">Optimized Recommendations</Typography>
          <Typography variant="body2" color="white">
            Present Value of Revenue (over {timeHorizon} years at {optimizedDiscountRate.toFixed(2)}%):
            ${presentValueRevenue.toFixed(2)}
          </Typography>
          <Typography variant="body1" color="white" sx={{ mt: 1 }}>
            Recommended Token Supply: {Math.round(recommendedSupply).toLocaleString()} tokens
          </Typography>
          <Typography variant="body1" color="white" sx={{ mt: 1 }}>
            Recommended Token Price: ${recommendedTokenPrice.toFixed(2)} per token
          </Typography>
          <Typography variant="body1" color="white" sx={{ mt: 1 }}>
            Implied Fan ROI: {impliedFanROI.toFixed(2)}%
          </Typography>
          <Typography variant="body1" color="white" sx={{ mt: 1 }}>
            Recommended Creator Royalty: {optimizedCreatorRoyalty.toFixed(2)}%
          </Typography>
        </Box>
      </Box>

      {/* Third Section: Advanced Visualizations (4 Quadrants) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
        {/* Quadrant 1: Plot Density (Contour Plot) with Legend inside the same Box */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: '48%' },
            p: 2,
            bgcolor: 'black',
            borderRadius: 2,
            height: 350,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h6" color="white" sx={{ mb: 1, textAlign: 'center' }}>
            Plot Density
          </Typography>
          <Box sx={{ flex: 1, width: '100%' }}>
            {mounted && (
              <Scatter data={densityData} options={{ ...densityOptions, maintainAspectRatio: false }} />
            )}
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            {densityLegend}
          </Box>
        </Box>

        {/* Quadrant 2: Parallel Coordinates Plot */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: '48%' },
            p: 2,
            bgcolor: 'black',
            borderRadius: 2,
            height: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="white" sx={{ mb: 1 }}>
            Parallel Coordinates Plot
          </Typography>
          {mounted && <Line data={parallelData} options={parallelOptions} />}
        </Box>

        {/* Quadrant 3: Multi-Line Sensitivity Chart */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: '48%' },
            p: 2,
            bgcolor: 'black',
            borderRadius: 2,
            height: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="white" sx={{ mb: 1 }}>
            Multi-Line Sensitivity Chart
          </Typography>
          {mounted && (
            <Line data={sensitivityData} options={sensitivityOptions} />
          )}
        </Box>

        {/* Quadrant 4: Price Discovery Chart */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: '48%' },
            p: 2,
            bgcolor: 'black',
            borderRadius: 2,
            height: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="white" sx={{ mb: 1 }}>
            Price Discovery Chart
          </Typography>
          {mounted && (
            <Line data={priceDiscoveryData} options={priceDiscoveryOptions} />
          )}
        </Box>
      </Box>

      {/* Advanced Options Toggle */}
      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" color="primary" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Hide Advanced Analysis' : 'Show Advanced Analysis'}
        </Button>
      </Box>
      {showAdvanced && advancedContent}
    </Container>
  );
}

export default TokenomicsSuite;
