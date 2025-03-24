require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Proxy endpoint for eBird API
app.get('/api/ebird/*', async (req, res) => {
  try {
    const ebirdPath = req.params[0];
    const queryParams = req.query;
    
    // Construct the full URL with the correct path
    const url = `https://api.ebird.org/v2/${ebirdPath}`;
    console.log('Proxying request to:', url);
    
    const response = await axios.get(url, {
      params: queryParams,
      headers: {
        'X-eBirdApiToken': process.env.EBIRD_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error'
    });
  }
});

// Test endpoint to verify the server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 