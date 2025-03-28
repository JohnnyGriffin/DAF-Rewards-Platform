// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const offerModelingController = require('./controllers/offerModelingController'); // Ensure file name and casing match exactly
const tokenController = require('./controllers/tokenController');
const utilityConfigController = require('./controllers/utilityConfigController'); // Ensure consistent casing

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Sample authentication middleware (stub)
function authenticate(req, res, next) {
  next();
}

// Endpoints
app.post('/api/offer-modeling/simulate', authenticate, offerModelingController.simulate);
app.post('/api/token/create', authenticate, tokenController.createToken);
app.post('/api/utility/config', authenticate, utilityConfigController.saveConfig);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));