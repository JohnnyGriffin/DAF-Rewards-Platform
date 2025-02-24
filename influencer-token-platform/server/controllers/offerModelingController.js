// server/controllers/offerModelingController.js
exports.simulate = (req, res) => {
    // Extract parameters from request body
    const { manual_revenue, use_public_data, platforms, conversion_factor, discount_rate, time_horizon, offer_factor, revenue_share_percent } = req.body;
    
    let R = 0;
    if (manual_revenue) {
      R = parseFloat(manual_revenue);
    } else if (use_public_data && platforms && platforms.length > 0) {
      const effectiveFollowers = platforms.reduce((sum, platform) => {
        return sum + (platform.followers * (platform.engagement_rate / 100) * (platform.weight || 1));
      }, 0);
      R = effectiveFollowers * parseFloat(conversion_factor);
    }
    
    const annualCashFlow = R * (parseFloat(revenue_share_percent) / 100);
    let npv = 0;
    for (let t = 1; t <= time_horizon; t++) {
      npv += annualCashFlow / Math.pow(1 + discount_rate / 100, t);
    }
    const recommendedOffer = (offer_factor / 100) * npv;
  
    res.json({
      estimated_revenue: R,
      annual_cash_flow: annualCashFlow,
      npv,
      recommended_offer: recommendedOffer,
      scenarios: {
        high: { npv: npv * 1.1, offer: (offer_factor / 100) * npv * 1.1 },
        medium: { npv, offer: recommendedOffer },
        low: { npv: npv * 0.9, offer: (offer_factor / 100) * npv * 0.9 }
      }
    });
  };
  