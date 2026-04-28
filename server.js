const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ COMPLETE LIST OF ALL DUBAI AREAS
const ALL_DUBAI_AREAS = [
  // Old Dubai - Deira & Bur Dubai
  { name: 'Deira', lat: 25.2697, lng: 55.3293, radius: 3000 },
  { name: 'Bur Dubai', lat: 25.2632, lng: 55.2972, radius: 3000 },
  { name: 'Al Rigga', lat: 25.2523, lng: 55.3089, radius: 2000 },
  { name: 'Al Muraqqabat', lat: 25.2580, lng: 55.3250, radius: 2000 },
  { name: 'Al Qusais', lat: 25.2867, lng: 55.3833, radius: 3500 },
  { name: 'Al Twar', lat: 25.2750, lng: 55.3583, radius: 2500 },
  { name: 'Al Nahda', lat: 25.3017, lng: 55.3717, radius: 3000 },
  { name: 'Al Warqa', lat: 25.1917, lng: 55.4217, radius: 3500 },
  { name: 'Oud Metha', lat: 25.2417, lng: 55.3083, radius: 2500 },
  { name: 'Umm Hurair', lat: 25.2350, lng: 55.3150, radius: 2000 },
  { name: 'Al Karama', lat: 25.2417, lng: 55.2983, radius: 2000 },
  { name: 'Al Satwa', lat: 25.2283, lng: 55.2750, radius: 2000 },
  { name: 'Trade Centre', lat: 25.2250, lng: 55.2850, radius: 2500 },
  
  // New Dubai - Coastal & Modern
  { name: 'Dubai Marina', lat: 25.0805, lng: 55.1396, radius: 3000 },
  { name: 'JBR', lat: 25.0785, lng: 55.1336, radius: 2000 },
  { name: 'Palm Jumeirah', lat: 25.1133, lng: 55.1383, radius: 4000 },
  { name: 'JLT', lat: 25.0693, lng: 55.1467, radius: 2500 },
  { name: 'Dubai Media City', lat: 25.0983, lng: 55.1650, radius: 2000 },
  { name: 'Dubai Internet City', lat: 25.0917, lng: 55.1617, radius: 2000 },
  { name: 'Knowledge Village', lat: 25.0850, lng: 55.1550, radius: 2000 },
  { name: 'Barsha Heights', lat: 25.0950, lng: 55.1750, radius: 2000 },
  { name: 'Al Barsha', lat: 25.1089, lng: 55.1989, radius: 3000 },
  { name: 'Motor City', lat: 25.0517, lng: 55.2317, radius: 2500 },
  { name: 'Sports City', lat: 25.0417, lng: 55.2150, radius: 2500 },
  { name: 'Dubai Hills Estate', lat: 25.1150, lng: 55.2450, radius: 3000 },
  { name: 'Emirates Hills', lat: 25.0850, lng: 55.1850, radius: 2500 },
  { name: 'The Springs', lat: 25.0717, lng: 55.2383, radius: 2000 },
  { name: 'The Meadows', lat: 25.0883, lng: 55.2217, radius: 2500 },
  { name: 'The Lakes', lat: 25.0650, lng: 55.2150, radius: 2500 },
  { name: 'Arabian Ranches', lat: 25.0517, lng: 55.2650, radius: 3000 },
  
  // Downtown & Business Districts
  { name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744, radius: 3000 },
  { name: 'Business Bay', lat: 25.1867, lng: 55.2633, radius: 2500 },
  { name: 'DIFC', lat: 25.2138, lng: 55.2827, radius: 2000 },
  { name: 'City Walk', lat: 25.2283, lng: 55.2650, radius: 2000 },
  { name: 'La Mer', lat: 25.2317, lng: 55.2883, radius: 2000 },
  { name: 'Mirdif', lat: 25.2217, lng: 55.4117, radius: 3500 },
  { name: 'Festival City', lat: 25.2217, lng: 55.3550, radius: 2500 },
  { name: 'Dubai Creek Harbour', lat: 25.2350, lng: 55.3350, radius: 3000 },
  { name: 'Al Jaddaf', lat: 25.2283, lng: 55.3283, radius: 2000 },
  { name: 'Culture Village', lat: 25.2250, lng: 55.3317, radius: 1500 },
  
  // Jumeirah & Coastal
  { name: 'Jumeirah 1', lat: 25.2285, lng: 55.2593, radius: 2500 },
  { name: 'Jumeirah 2', lat: 25.2350, lng: 55.2650, radius: 2500 },
  { name: 'Jumeirah 3', lat: 25.2417, lng: 55.2717, radius: 2500 },
  { name: 'Umm Suqeim', lat: 25.1350, lng: 55.1850, radius: 3000 },
  { name: 'Al Wasl', lat: 25.2183, lng: 55.2583, radius: 2500 },
  { name: 'Safa Park Area', lat: 25.1817, lng: 55.2417, radius: 2000 },
  { name: 'Bluewaters Island', lat: 25.0783, lng: 55.1183, radius: 1500 },
  { name: 'Dubai Harbour', lat: 25.1050, lng: 55.1250, radius: 2000 },
  
  // Other Key Areas
  { name: 'International City', lat: 25.1683, lng: 55.4117, radius: 3500 },
  { name: 'Silicon Oasis', lat: 25.1250, lng: 55.3783, radius: 3500 },
  { name: 'Academic City', lat: 25.1550, lng: 55.4283, radius: 3000 },
  { name: 'Healthcare City', lat: 25.1850, lng: 55.4150, radius: 2500 },
  { name: 'Dubai South', lat: 24.9050, lng: 55.1617, radius: 4000 },
  { name: 'Al Furjan', lat: 25.0217, lng: 55.1450, radius: 3000 },
  { name: 'Discovery Gardens', lat: 25.0417, lng: 55.1383, radius: 2000 },
  { name: 'Ibn Battuta', lat: 25.0433, lng: 55.1183, radius: 2000 },
  { name: 'Green Community', lat: 25.0550, lng: 55.2250, radius: 2000 }
];

// ✅ API Endpoint: Fetch Premium Restaurants from Any Dubai Area
app.get('/api/restaurants', async (req, res) => {
  const area = req.query.area || 'all';
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Google API Key is missing' });
  }

  try {
    let allRestaurants = [];

    if (area === 'all') {
      // Search across ALL Dubai areas (top 20 premium areas to avoid API limits)
      const topAreas = ALL_DUBAI_AREAS.slice(0, 20);
      for (const location of topAreas) {
        const restaurants = await fetchPremiumRestaurants(location, apiKey);
        allRestaurants = allRestaurants.concat(restaurants);
      }
    } else {
      // Search specific area
      const targetArea = ALL_DUBAI_AREAS.find(a => a.name.toLowerCase() === area.toLowerCase());
      if (targetArea) {
        const restaurants = await fetchPremiumRestaurants(targetArea, apiKey);
        allRestaurants = restaurants;
      } else {
        return res.status(400).json({ error: 'Area not found' });
      }
    }

    // Remove duplicates and sort by rating
    const uniqueRestaurants = allRestaurants
      .filter((rest, index, self) => index === self.findIndex(r => r.placeId === rest.placeId))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 30); // Top 30 premium restaurants

    res.json({ 
      area: area === 'all' ? 'All Dubai' : area,
      count: uniqueRestaurants.length, 
      restaurants: uniqueRestaurants 
    });

  } catch (error) {
    console.error('Google Places API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch premium restaurants' });
  }
});

// ✅ Helper Function: Fetch Premium Restaurants
async function fetchPremiumRestaurants(location, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${location.radius}&type=restaurant&minprice=3&keyword=fine+dining+premium&key=${apiKey}`;
    
    const response = await axios.get(url);
    const places = response.data.results || [];

    // Filter for high-rated restaurants
    const premiumPlaces = places.filter(place => 
      place.rating >= 4.0 && 
      place.user_ratings_total >= 30
    );

    return premiumPlaces.map(place => ({
      name: place.name,
      mainArea: location.name,
      subArea: place.vicinity || location.name,
      street: place.vicinity,
      cuisine: place.types ? place.types.filter(t => t !== 'restaurant' && t !== 'food' && t !== 'point_of_interest').join(', ') : 'Fine Dining',
      rating: place.rating || 'N/A',
      totalRatings: place.user_ratings_total || 0,
      priceLevel: place.price_level || 3,
      placeId: place.place_id,
      phone: 'Check Google Maps',
      hours: 'Open now',
      menu: ['Premium Menu', 'Fine Dining', 'Specialty Dishes'],
      ingredients: ['Premium Quality', 'Gourmet'],
      avgSpending: place.price_level === 4 ? '200-400 AED' : place.price_level === 3 ? '100-200 AED' : '50-100 AED'
    }));

  } catch (error) {
    console.error(`Error fetching from ${location.name}:`, error.message);
    return [];
  }
}

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Export for Vercel
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}