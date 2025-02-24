// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const offerModelingController = require('./controllers/offerModelingController');
const tokenController = require('./controllers/tokenController');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Sample authentication middleware (stub)
// In production, you'll verify JWT tokens here.
function authenticate(req, res, next) {
  next();
}

// Endpoint for offer modeling simulation
app.post('/api/offer-modeling/simulate', authenticate, offerModelingController.simulate);

// Endpoint for token creation
app.post('/api/token/create', authenticate, tokenController.createToken);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
