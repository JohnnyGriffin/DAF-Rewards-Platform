// src/backend/utilityConfigController.js
const express = require('express');
const router = express.Router();
const { firestore } = require('../firebase');

// Endpoint to save/update utility configurations for a given token
router.post('/utility-config/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  const configData = req.body; // Expected to be an object with keys like tiers, exclusiveContent, events, etc.
  try {
    await firestore.collection('tokens').doc(tokenId).update({ utilityConfig: configData });
    res.json({ status: 'success', message: 'Utility configuration updated.' });
  } catch (error) {
    console.error('Error updating utility configuration:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Endpoint to retrieve utility configurations for a given token
router.get('/utility-config/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  try {
    const tokenDoc = await firestore.collection('tokens').doc(tokenId).get();
    if (tokenDoc.exists) {
      res.json({ status: 'success', utilityConfig: tokenDoc.data().utilityConfig || {} });
    } else {
      res.status(404).json({ status: 'error', message: 'Token not found.' });
    }
  } catch (error) {
    console.error('Error retrieving utility configuration:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;