# Google Places API Integration Guide

## 🎯 **Why Google Places API?**

- **Most comprehensive** UK address database
- **Real-time updates** with new developments
- **High accuracy** and reliability
- **Property-level detail** including house numbers and names
- **Postcode validation** and street name matching

## 💰 **Cost Breakdown**

### **Pricing (as of 2025):**
- **Places API (Text Search):** $17 per 1,000 requests
- **Places API (Find Place):** $17 per 1,000 requests  
- **Places API (Autocomplete):** $2.83 per 1,000 requests
- **Places API (Details):** $17 per 1,000 requests

### **Typical Campaign Usage:**
- **100 postcode searches:** $1.70
- **100 street selections:** $1.70
- **100 property lookups:** $1.70
- **Total per campaign:** ~$5.10

### **Monthly Budget Example:**
- **10 campaigns per month:** ~$51
- **50 campaigns per month:** ~$255
- **100 campaigns per month:** ~$510

## 🛠️ **Setup Steps**

### **1. Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable billing (required for Places API)
4. Enable the following APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API

### **2. Create API Key**
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. **IMPORTANT:** Restrict the API key:
   - HTTP referrers: `*.netlify.app/*`
   - API restrictions: Places API only

### **3. Environment Variables**
Add to your `.env` file:
```
REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### **4. Netlify Environment Variables**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: `REACT_APP_GOOGLE_PLACES_API_KEY` = your_api_key

## 🔧 **Implementation**

### **Current Status:**
✅ **Google Places API integration** implemented in `src/App.jsx`
✅ **Configuration file** created at `src/config.js`
✅ **Error handling** and fallback mechanisms
✅ **Real UK address lookup** with property details

### **Features:**
- **Postcode search:** "IP30 9DR" → Shows all addresses
- **Street search:** "Cross Street" → Shows all properties
- **Village search:** "Elmswell" → Shows all streets
- **Property details:** House numbers, names, full addresses
- **Auto-fill:** Street name, postcode, properties

## 🚀 **Deployment**

1. **Add your Google API key** to environment variables
2. **Deploy to Netlify** - the integration is already implemented
3. **Test the workflow:**
   - Click "Add street"
   - Click "Search for Address"
   - Type "IP30 9DR" or "Elmswell"
   - Select from real UK addresses
   - Choose properties from the list

## 💡 **Cost Optimization**

### **Strategies to Reduce Costs:**
1. **Caching:** Cache results for 24 hours
2. **Batch requests:** Group multiple searches
3. **Autocomplete:** Use cheaper autocomplete API where possible
4. **User limits:** Limit searches per user per day
5. **Fallback:** Use OpenStreetMap for basic searches

### **Budget Monitoring:**
- Set up Google Cloud billing alerts
- Monitor usage in Google Cloud Console
- Implement usage tracking in your app

## 🔒 **Security**

### **API Key Protection:**
- ✅ **Domain restrictions:** Only allow your domain
- ✅ **API restrictions:** Only Places API
- ✅ **Environment variables:** Never commit API keys
- ✅ **HTTPS only:** Secure transmission

## 📊 **Expected Results**

With Google Places API, you should see:
- **Real UK postcodes:** "IP30 9DR", "IP30 9YY"
- **Actual street names:** "Cross Street", "Station Road"
- **Property details:** "96 Cross Street", "Birch Tree House"
- **Accurate addresses:** Full formatted addresses
- **Property selection:** Choose from actual properties

## 🆘 **Support**

If you need help:
1. Check Google Cloud Console for API usage
2. Verify API key restrictions
3. Test with Google's API testing tool
4. Check Netlify environment variables

**Ready to implement? Just add your Google API key and deploy!**
