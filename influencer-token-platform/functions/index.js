/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import Stripe (replace with your Stripe secret key)
const stripe = require("stripe")("YOUR_STRIPE_SECRET_KEY");

// Cloud Function to create a Payment Intent via Stripe
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  const {amount, currency} = data;

  if (!amount || !currency) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Amount and currency are required.",
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      payment_method_types: ["card"],
    });

    return {clientSecret: paymentIntent.client_secret};
  } catch (error) {
    console.error("Stripe error:", error);
    throw new functions.https.HttpsError("internal", "Unable to create payment intent.");
  }
});

// Scheduled Cloud Function to process revenue distribution daily
exports.processRevenue = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  // Simulate fetching external revenue data (replace with real API call)
  const revenueData = {
    totalRevenue: 1000, // e.g., $1,000 revenue
    distributionDate: new Date().toISOString(),
  };

  // Fetch all tokens
  const tokensSnapshot = await admin.firestore().collection("tokens").get();
  const tokens = tokensSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  const numTokens = tokens.length;
  const sharePerToken = numTokens > 0 ? revenueData.totalRevenue / numTokens : 0;

  const batch = admin.firestore().batch();
  tokens.forEach((token) => {
    const revenueRef = admin.firestore()
        .collection("tokens")
        .doc(token.id)
        .collection("revenue")
        .doc();

    batch.set(revenueRef, {
      distributedAt: admin.firestore.FieldValue.serverTimestamp(),
      amount: sharePerToken,
      distributionDate: revenueData.distributionDate,
    });
  });

  await batch.commit();
  console.log("Revenue distributed successfully.");
  return null;
});

// HTTPS Callable Function to process loan repayment
exports.processLoanRepayment = functions.https.onCall(async (data, context) => {
  const {userId, repaymentAmount} = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
    );
  }

  const loanRef = admin.firestore().collection("loans").doc(userId);
  const loanDoc = await loanRef.get();

  if (!loanDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Loan record not found.");
  }

  const loanData = loanDoc.data();
  const newOutstanding = Math.max(loanData.outstanding - repaymentAmount, 0);

  await loanRef.update({
    outstanding: newOutstanding,
    lastRepaymentDate: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {outstanding: newOutstanding};
});
