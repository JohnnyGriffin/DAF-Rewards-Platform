// src/backend/offerModelingController.js
const express = require('express');
const router = express.Router();

router.post('/simulate', (req, res) => {
  const {
    manual_revenue,
    use_public_data,
    platforms,
    conversion_factor,
    discount_rate,
    time_horizon,
    offer_factor,
    revenue_share_percent,
  } = req.body;

  let estimatedRevenue = 0;
  if (manual_revenue) {
    estimatedRevenue = parseFloat(manual_revenue);
  } else if (use_public_data && Array.isArray(platforms) && platforms.length > 0) {
    estimatedRevenue = platforms.reduce((acc, p) => {
      return acc + (p.followers * (p.engagement_rate / 100) * (p.weight || 1));
    }, 0) * conversion_factor;
  }

  const annualCashFlow = estimatedRevenue * (revenue_share_percent / 100);
  let npv = 0;
  for (let t = 1; t <= time_horizon; t++) {
    npv += annualCashFlow / Math.pow(1 + discount_rate / 100, t);
  }
  const recommendedOffer = (offer_factor / 100) * npv;

  res.json({
    estimated_revenue: estimatedRevenue,
    annual_cash_flow: annualCashFlow,
    npv: npv,
    recommended_offer: recommendedOffer,
    scenarios: {
      high: { npv: npv * 1.1, offer: recommendedOffer * 1.1 },
      medium: { npv, offer: recommendedOffer },
      low: { npv: npv * 0.9, offer: recommendedOffer * 0.9 },
    },
  });
});

module.exports = router;
