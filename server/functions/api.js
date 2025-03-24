const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const path = event.path.replace('/api/ebird/', '');
    const queryParams = event.queryStringParameters || {};
    
    console.log('Proxying request to:', `https://api.ebird.org/v2/${path}`);
    
    const response = await axios.get(`https://api.ebird.org/v2/${path}`, {
      params: queryParams,
      headers: {
        'X-eBirdApiToken': process.env.EBIRD_API_KEY
      }
    });

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