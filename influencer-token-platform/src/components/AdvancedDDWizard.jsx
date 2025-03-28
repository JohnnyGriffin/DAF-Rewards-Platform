// src/components/AdvancedDDWizard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Slider,
  TextField,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, ChartTooltip, Legend);

const steps = [
  'Financial Modeling',
  'Cost of Capital (WACC)',
  'Scenario & Sensitivity',
  'Comparative Valuation & Risk',
  'Summary & Export'
];

function AdvancedDDWizard({ onProceed }) {
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Financial Modeling inputs
  const [annualNetRevenue, setAnnualNetRevenue] = useState(1000000);
  const [usePublicData, setUsePublicData] = useState(false);
  const [conversionFactor, setConversionFactor] = useState(0.005);

  // Step 2: Cost of Capital (WACC) inputs
  const [discountRate, setDiscountRate] = useState(10);
  const [riskFreeRate, setRiskFreeRate] = useState(3);
  const [equityRiskPremium, setEquityRiskPremium] = useState(5);
  const [industryRiskPremium, setIndustryRiskPremium] = useState(2.5);
  const [debtCost, setDebtCost] = useState(4);
  const [debtRatio, setDebtRatio] = useState(30);
  const optimizedDiscountRate = (
    ((100 - debtRatio) / 100) * discountRate +
    (debtRatio / 100) * debtCost +
    Number(industryRiskPremium)
  ).toFixed(2);

  // Step 3: Scenario & Sensitivity inputs
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [offerFactor, setOfferFactor] = useState(50);

  // Step 4: Comparative Valuation & Risk inputs
  // (Additional inputs can be added as needed – for demonstration, we add a market multiple and a risk adjustment factor)
  const [marketMultiple, setMarketMultiple] = useState(10);
  const [riskAdjustment, setRiskAdjustment] = useState(1);

  // Step 5: Summary will compile all information
  const [npv, setNpv] = useState(0);
  const [irr, setIrr] = useState(0);
  const recommendedTokenPrice = npv / 1000000;

  // Update simulation based on inputs (for Steps 1-3, common calculation)
  useEffect(() => {
    const annualCashFlow = annualNetRevenue * 0.10;
    let npvCalc = 0;
    for (let t = 1; t <= timeHorizon; t++) {
      npvCalc += annualCashFlow / Math.pow(1 + optimizedDiscountRate / 100, t);
    }
    const irrCalc = (annualCashFlow / npvCalc) * 100;
    setNpv(npvCalc.toFixed(2));
    setIrr(irrCalc.toFixed(2));
  }, [annualNetRevenue, discountRate, debtCost, debtRatio, industryRiskPremium, timeHorizon, offerFactor, optimizedDiscountRate]);

  // Price Discovery Chart Data (simulate area chart with fill)
  const priceDiscoveryData = {
    labels: Array.from({ length: timeHorizon }, (_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Discounted Cash Flow',
        data: Array.from({ length: timeHorizon }, (_, t) => {
          let cumulative = 0;
          for (let i = 1; i <= t + 1; i++) {
            cumulative += (annualNetRevenue * 0.10) / Math.pow(1 + optimizedDiscountRate / 100, i);
          }
          return cumulative;
        }),
        fill: true,
        backgroundColor: 'rgba(0, 174, 255, 0.2)',
        borderColor: '#00aeff'
      },
      {
        label: 'Offer Threshold',
        data: Array.from({ length: timeHorizon }, () => (offerFactor / 100) * npv),
        fill: false,
        borderColor: '#ff4081'
      }
    ]
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // Compile all advanced DD data and store it, then call onProceed to move forward
    localStorage.setItem('advancedDDData', JSON.stringify({
      annualNetRevenue,
      conversionFactor,
      discountRate,
      riskFreeRate,
      equityRiskPremium,
      industryRiskPremium,
      debtCost,
      debtRatio,
      optimizedDiscountRate,
      timeHorizon,
      offerFactor,
      marketMultiple,
      riskAdjustment,
      npv,
      irr,
      recommendedTokenPrice
    }));
    if (onProceed) onProceed();
  };

  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" color="white">Financial Modeling</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the expected annual net revenue (in $) from the creator’s revenue stream." arrow>
                  <Typography variant="subtitle1">Annual Net Revenue ($)</Typography>
                </Tooltip>
                <TextField
                  type="number"
                  value={annualNetRevenue}
                  onChange={(e) => setAnnualNetRevenue(Number(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Conversion factor: converts effective followers to revenue ($ per follower per year)." arrow>
                  <Typography variant="subtitle1">Conversion Factor</Typography>
                </Tooltip>
                <Slider
                  value={conversionFactor}
                  min={0.001}
                  max={0.01}
                  step={0.0005}
                  onChange={(e, newValue) => setConversionFactor(newValue)}
                  valueLabelDisplay="on"
                />
                <FormControlLabel
                  control={<Switch checked={usePublicData} onChange={(e) => setUsePublicData(e.target.checked)} />}
                  label="Use Public Data"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" color="white">Cost of Capital (WACC)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Tooltip title="Set the base discount rate for discounting future cash flows." arrow>
                  <Typography variant="subtitle1">Discount Rate (%)</Typography>
                </Tooltip>
                <Slider
                  value={discountRate}
                  min={5}
                  max={25}
                  step={0.5}
                  onChange={(e, newValue) => setDiscountRate(newValue)}
                  valueLabelDisplay="on"
                />
              </Grid>
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Advanced Discount Calculator (WACC)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="Risk-Free Rate (%)"
                      type="number"
                      value={riskFreeRate}
                      onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      label="Equity Risk Premium (%)"
                      type="number"
                      value={equityRiskPremium}
                      onChange={(e) => setEquityRiskPremium(Number(e.target.value))}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      label="Industry Risk Premium (%)"
                      type="number"
                      value={industryRiskPremium}
                      onChange={(e) => setIndustryRiskPremium(Number(e.target.value))}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      label="Debt Cost (%)"
                      type="number"
                      value={debtCost}
                      onChange={(e) => setDebtCost(Number(e.target.value))}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      label="Debt Ratio (%)"
                      type="number"
                      value={debtRatio}
                      onChange={(e) => setDebtRatio(Number(e.target.value))}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Optimized Discount Rate (WACC): {optimizedDiscountRate}%
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" color="white">Scenario &amp; Sensitivity</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the number of years over which future cash flows are discounted." arrow>
                  <Typography variant="subtitle1">Time Horizon (Years)</Typography>
                </Tooltip>
                <Slider
                  value={timeHorizon}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(e, newValue) => setTimeHorizon(newValue)}
                  valueLabelDisplay="on"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Offer factor: percentage of NPV offered as upfront payment." arrow>
                  <Typography variant="subtitle1">Offer Factor (% of NPV)</Typography>
                </Tooltip>
                <Slider
                  value={offerFactor}
                  min={5}
                  max={70}
                  step={1}
                  onChange={(e, newValue) => setOfferFactor(newValue)}
                  valueLabelDisplay="on"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" color="white">Comparative Valuation &amp; Risk</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter a market multiple (e.g., EBITDA multiple) for comparative valuation." arrow>
                  <Typography variant="subtitle1">Market Multiple</Typography>
                </Tooltip>
                <Slider
                  value={marketMultiple}
                  min={5}
                  max={20}
                  step={0.5}
                  onChange={(e, newValue) => setMarketMultiple(newValue)}
                  valueLabelDisplay="on"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter a risk adjustment factor to account for industry or other risks." arrow>
                  <Typography variant="subtitle1">Risk Adjustment Factor</Typography>
                </Tooltip>
                <Slider
                  value={riskAdjustment}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(e, newValue) => setRiskAdjustment(newValue)}
                  valueLabelDisplay="on"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" color="white">Summary &amp; Export</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">NPV: ${npv}</Typography>
              <Typography variant="body1">Estimated IRR: {irr}%</Typography>
              <Typography variant="body1">
                Recommended Token Price: ${recommendedTokenPrice ? recommendedTokenPrice.toFixed(4) : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mt: 3, width: '100%', height: 300 }}>
              <Tooltip title="This chart overlays the cumulative discounted cash flows and the offer threshold." arrow>
                <Typography variant="h6" color="white" gutterBottom>
                  Price Discovery Chart
                </Typography>
              </Tooltip>
              <Line
                data={priceDiscoveryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleFinish}>
                Finish &amp; Export
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Advanced Due Diligence Wizard
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent()}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" color="primary" onClick={handleBack} disabled={activeStep === 0}>
          Previous
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        ) : null}
      </Box>
    </Container>
  );
}

export default AdvancedDDWizard;