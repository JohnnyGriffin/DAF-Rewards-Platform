// src/components/OfferModelingTool.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTooltip,
  Legend
);

// Reusable slider with label, editable number and tooltip
const SliderWithLabel = ({ label, value, onChange, min, max, step, tooltip, disabled = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', my: 1, opacity: disabled ? 0.5 : 1 }}>
    <Tooltip title={tooltip} arrow>
      <Typography variant="caption" color="white" sx={{ minWidth: 150 }}>
        {label}
      </Typography>
    </Tooltip>
    {/* Adjusted flex value to shorten the slider */}
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      min={min}
      max={max}
      step={step}
      valueLabelDisplay="auto"
      sx={{ flex: 0.7, color: 'primary.main', mx: 1 }}
      disabled={disabled}
    />
    {/* Increased width of the input field to accommodate a 7-digit number */}
    <TextField
      value={typeof value === 'number' ? value.toLocaleString() : value}
      onChange={(e) => {
        let newVal = Number(e.target.value.replace(/,/g, ''));
        if (isNaN(newVal)) newVal = min;
        if (newVal < min) newVal = min;
        if (newVal > max) newVal = max;
        onChange(newVal);
      }}
      size="small"
      variant="outlined"
      sx={{
        width: 120,
        ml: 1,
        input: { color: 'white', textAlign: 'center' },
        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } },
      }}
      disabled={disabled}
    />
  </Box>
);

// Box–Muller transform for normally distributed random number
function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function OfferModelingTool({ onProceed }) {
  // Load saved values from localStorage if available
  const savedData = localStorage.getItem('offerEvaluationData');
  const initialData = savedData ? JSON.parse(savedData) : {};

  // Public data toggle and revenue inputs
  const [usePublicData, setUsePublicData] = useState(initialData.usePublicData || false);
  const [manualProjectedRevenue, setManualProjectedRevenue] = useState(initialData.manualProjectedRevenue || 1000000);
  const [totalFollowers, setTotalFollowers] = useState(initialData.totalFollowers || 1000000);
  const [engagementRate, setEngagementRate] = useState(initialData.engagementRate || 3.88);
  const [conversionFactor, setConversionFactor] = useState(initialData.conversionFactor || 0.003);

  // New state for additional public data inputs
  const [totalViews, setTotalViews] = useState(initialData.totalViews || 1000000);
  const [cpm, setCpm] = useState(initialData.cpm || 5);
  const [numberOfSubscribers, setNumberOfSubscribers] = useState(initialData.numberOfSubscribers || 1000000);
  const [monthlySubscriptionFee, setMonthlySubscriptionFee] = useState(initialData.monthlySubscriptionFee || 10);
  const [numberOfPPVPurchases, setNumberOfPPVPurchases] = useState(initialData.numberOfPPVPurchases || 1000);
  const [ppvPrice, setPpvPrice] = useState(initialData.ppvPrice || 10);

  // Financial inputs via sliders
  // Offer specific: Time Horizon now goes from 1 to 2 years.
  const [timeHorizon, setTimeHorizon] = useState(initialData.timeHorizon || 1);
  const [riskFreeRate, setRiskFreeRate] = useState(initialData.riskFreeRate || 3);
  const [equityRiskPremium, setEquityRiskPremium] = useState(initialData.equityRiskPremium || 5);
  const [industryPremium, setIndustryPremium] = useState(initialData.industryPremium || 2.5);
  const [revenueSharePercentage, setRevenueSharePercentage] = useState(initialData.revenueSharePercentage || 10);

  // New state for Offer Discount (%) (default 10%)
  const [offerDiscount, setOfferDiscount] = useState(initialData.offerDiscount || 10);

  // State for target unit value (not used in output now)
  const [targetUnitValue, setTargetUnitValue] = useState(initialData.targetUnitValue || 0.10);

  // Determine discount rate based on toggle
  // If manualDiscount is off, discount rate = 0 (i.e. no discounting)
  const [manualDiscount, setManualDiscount] = useState(initialData.manualDiscount || false);
  const discountRate = manualDiscount ? (riskFreeRate + equityRiskPremium + industryPremium) : 0;
  const discountRateDecimal = discountRate / 100;

  // Derived revenue: if using public data, compute from public inputs; otherwise, use manual value.
  const computedRevenue = usePublicData
    ? (totalFollowers * (engagementRate / 100) * conversionFactor) +
      (totalViews * (cpm / 1000)) +
      (numberOfSubscribers * monthlySubscriptionFee * 12) +
      (numberOfPPVPurchases * ppvPrice)
    : manualProjectedRevenue;

  // Calculate overall NPV using Discounted Cash Flow
  const [npv, setNpv] = useState(0);
  useEffect(() => {
    let pvCalc = 0;
    if (discountRateDecimal > 0) {
      for (let t = 1; t <= timeHorizon; t++) {
        pvCalc += computedRevenue / Math.pow(1 + discountRateDecimal, t);
      }
    } else {
      pvCalc = computedRevenue * timeHorizon;
    }
    setNpv(pvCalc);
  }, [computedRevenue, discountRateDecimal, timeHorizon]);

  // Calculations for the NPV and Recommended Offer section:
  const npvRevShare = npv * (revenueSharePercentage / 100);
  const recommendedOffer = npvRevShare * (1 - offerDiscount / 100);

  // Proceed button: save all slider state to localStorage so that Tokenomics Suite can reuse them.
  const handleProceed = () => {
    const dataToSave = {
      usePublicData,
      manualProjectedRevenue,
      totalFollowers,
      engagementRate,
      conversionFactor,
      totalViews,
      cpm,
      numberOfSubscribers,
      monthlySubscriptionFee,
      numberOfPPVPurchases,
      ppvPrice,
      timeHorizon,
      riskFreeRate,
      equityRiskPremium,
      industryPremium,
      revenueSharePercentage,
      offerDiscount,
      targetUnitValue,
      manualDiscount,
    };
    localStorage.setItem('offerEvaluationData', JSON.stringify(dataToSave));
    onProceed();
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" color="white" gutterBottom>
        Offer Evaluation Tool
      </Typography>

      {/* Toggle for Public Data */}
      <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={usePublicData}
              onChange={(e) => setUsePublicData(e.target.checked)}
              color="primary"
            />
          }
          label="Use Public Data"
        />
      </Box>

      {/* Projected Revenue Input (Slider with Editable Number) */}
      <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" color="white" sx={{ minWidth: 150 }}>
          Projected Revenue ($)
        </Typography>
        <Slider
          value={usePublicData ? computedRevenue : manualProjectedRevenue}
          onChange={(e, newValue) => {
            if (!usePublicData) setManualProjectedRevenue(newValue);
          }}
          min={0}
          max={1000000}
          step={1}
          valueLabelDisplay="auto"
          sx={{ flex: 0.65, color: 'primary.main', mx: 1 }}
        />
        <TextField
          value={typeof (usePublicData ? computedRevenue : manualProjectedRevenue) === 'number' ? (usePublicData ? computedRevenue : manualProjectedRevenue).toLocaleString() : ''}
          onChange={(e) => {
            let newVal = Number(e.target.value.replace(/,/g, ''));
            if (isNaN(newVal)) newVal = 0;
            if (newVal < 0) newVal = 0;
            if (newVal > 1000000) newVal = 1000000;
            if (!usePublicData) setManualProjectedRevenue(newVal);
          }}
          size="small"
          variant="outlined"
          sx={{
            width: 120,
            ml: 2,
            input: { color: 'white', textAlign: 'center' },
            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } },
          }}
          disabled={usePublicData}
        />
      </Box>

      {/* Public Data Inputs */}
      {usePublicData && (
        <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Public Data Inputs
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Followers"
                value={totalFollowers}
                onChange={setTotalFollowers}
                min={0}
                max={10000000}
                step={1000}
                tooltip="Number of followers across platforms"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Engagement Rate (%)"
                value={engagementRate}
                onChange={setEngagementRate}
                min={0}
                max={10}
                step={0.1}
                tooltip="Engagement rate percentage"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Conversion Factor"
                value={conversionFactor}
                onChange={setConversionFactor}
                min={0}
                max={0.03}
                step={0.001}
                tooltip="Conversion factor for sponsored content"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Total Views"
                value={totalViews}
                onChange={setTotalViews}
                min={0}
                max={10000000}
                step={500}
                tooltip="Total views for ad revenue calculations"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="CPM ($)"
                value={cpm}
                onChange={setCpm}
                min={0}
                max={10}
                step={0.1}
                tooltip="Cost Per Mille (CPM) for ad revenue"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Subscribers"
                value={numberOfSubscribers}
                onChange={setNumberOfSubscribers}
                min={0}
                max={10000000}
                step={1000}
                tooltip="Number of subscribers for subscription-based platforms"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="Monthly Fee ($)"
                value={monthlySubscriptionFee}
                onChange={setMonthlySubscriptionFee}
                min={0}
                max={50}
                step={1}
                tooltip="Monthly subscription fee"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="PPV Purchases"
                value={numberOfPPVPurchases}
                onChange={setNumberOfPPVPurchases}
                min={0}
                max={10000}
                step={100}
                tooltip="Number of pay-per-view (PPV) purchases"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SliderWithLabel
                label="PPV Price ($)"
                value={ppvPrice}
                onChange={setPpvPrice}
                min={0}
                max={50}
                step={1}
                tooltip="Price for PPV content"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Discount Rate Inputs */}
      <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" color="white">Discount Rate Inputs</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <SliderWithLabel
              label="Risk-Free Rate (%)"
              value={riskFreeRate}
              onChange={setRiskFreeRate}
              min={1}
              max={10}
              step={0.5}
              tooltip="Government bond yield"
              disabled={!manualDiscount}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SliderWithLabel
              label="Equity Risk Premium (%)"
              value={equityRiskPremium}
              onChange={setEquityRiskPremium}
              min={1}
              max={10}
              step={0.5}
              tooltip="Additional return expected for equities"
              disabled={!manualDiscount}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SliderWithLabel
              label="Industry Premium (%)"
              value={industryPremium}
              onChange={setIndustryPremium}
              min={0.5}
              max={5}
              step={0.5}
              tooltip="Premium based on industry/influencer risk"
              disabled={!manualDiscount}
            />
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Switch
              checked={manualDiscount}
              onChange={(e) => setManualDiscount(e.target.checked)}
              color="primary"
            />
          }
          label="Apply Discount Rate"
          sx={{ mt: 1, color: 'white' }}
        />
        {manualDiscount && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" color="white">
              Current Discount Rate: {discountRate.toFixed(2)}%
            </Typography>
            <Typography variant="caption" color="white">
              (Risk-Free: {riskFreeRate}%, Equity: {equityRiskPremium}%, Industry: {industryPremium}%)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Offer Specific Inputs */}
      <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" color="white">Offer Specific Inputs</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SliderWithLabel
              label="Time Horizon (Years)"
              value={timeHorizon}
              onChange={setTimeHorizon}
              min={1}
              max={2}
              step={1}
              tooltip="Years for discounting"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderWithLabel
              label="Revenue Share (%)"
              value={revenueSharePercentage}
              onChange={setRevenueSharePercentage}
              min={5}
              max={20}
              step={1}
              tooltip="Agreed revenue share percentage"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderWithLabel
              label="Offer Discount (%)"
              value={offerDiscount}
              onChange={setOfferDiscount}
              min={0}
              max={50}
              step={1}
              tooltip="Discount applied to NPV of revenue share (e.g., 10% means offer price is 10% less than intrinsic value)"
            />
          </Grid>
        </Grid>
      </Box>

      {/* NPV and Recommended Offer Section */}
      <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" color="white" gutterBottom>
          NPV and Recommended Offer
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="space-around">
          <Grid item xs={12} sm={2}>
            <Tooltip title="NPV of revenue share = NPV × (Revenue Share %)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                NPV
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              ${Number((npv * (revenueSharePercentage / 100)).toFixed(2)).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Recommended Offer = NPV of revenue share minus offer discount" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Recommended Offer
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              ${Number((npv * (revenueSharePercentage / 100) * (1 - offerDiscount / 100)).toFixed(2)).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Time Horizon (years)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Time Horizon
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              {timeHorizon} yrs
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Revenue Share (%)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Revenue Share
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              {revenueSharePercentage}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Offer Discount (%)" arrow>
              <Typography variant="subtitle2" color="white" align="center">
                Offer Discount
              </Typography>
            </Tooltip>
            <Typography variant="h6" color="white" align="center">
              {offerDiscount}%
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Button variant="contained" color="primary" onClick={handleProceed}>
        Proceed to Tokenomics Suite
      </Button>
    </Container>
  );
}

export default OfferModelingTool;