// Netlify serverless function to proxy Ideal Postcodes API requests
// This avoids CORS issues by making the request from the server side

export const handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get postcode from query string
  const postcode = event.queryStringParameters?.postcode;
  
  if (!postcode) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Postcode parameter is required' })
    };
  }

  // Get API key from environment variable (set in Netlify dashboard)
  // Fallback to hardcoded key if env var not set (for development)
  const apiKey = process.env.IDEAL_POSTCODES_API_KEY || 'ak_mjtdtn6bmxMboMnlL6AM7Mhrvle34';

  try {
    const encodedPostcode = encodeURIComponent(postcode.trim());
    const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodedPostcode}?api_key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch postcode data',
        message: error.message 
      })
    };
  }
};

