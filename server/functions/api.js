const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Extract the path from the request
    const path = event.path.replace('/.netlify/functions/api/ebird/', '');
    const queryParams = event.queryStringParameters || {};
    
    console.log('Proxying request to:', `https://api.ebird.org/v2/${path}`);
    
    // Make the request to eBird API
    const response = await axios.get(`https://api.ebird.org/v2/${path}`, {
      params: queryParams,
      headers: {
        'X-eBirdApiToken': process.env.EBIRD_API_KEY
      }
    });

    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    
    // Return appropriate error response
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.response?.data || 'Internal server error'
      })
    };
  }
}; 