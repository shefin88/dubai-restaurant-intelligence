const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Dubai Areas Configuration
const AREAS = {
  'Deira': { lat: 25.2697, lon: 55.3293, radius: 3000 },
  'Bur Dubai': { lat: 25.2632, lon: 55.2972, radius: 3000 },
  'Dubai Marina': { lat: 25.0805, lon: 55.1396, radius: 3000 },
  'JLT': { lat: 25.0693, lon: 55.1467, radius: 2500 },
  'Downtown Dubai': { lat: 25.1972, lon: 55.2744, radius: 3000 },
  'Business Bay': { lat: 25.1867, lon: 55.2633, radius: 2500 },
  'Al Qusais': { lat: 25.2867, lon: 55.3833, radius: 3500 },
  'Al Barsha': { lat: 25.1089, lon: 55.1989, radius: 3000 },
  'Palm Jumeirah': { lat: 25.1133, lon: 55.1383, radius: 3500 },
  'International City': { lat: 25.1683, lon: 55.4117, radius: 3500 }
};

// ✅ Cuisine Menu Database
const CUISINE_DB = {
  'fine dining': { menu:['Tasting Menu','Wagyu Beef','Lobster','Foie Gras','Caviar'], ingredients:['truffle','saffron','wagyu','lobster','caviar'] },
  'italian': { menu:['Risotto','Truffle Pasta','Osso Buco','Tiramisu'], ingredients:['parmesan','truffle','basil','mozzarella'] },
  'indian': { menu:['Butter Chicken','Biryani','Tandoori','Naan','Dal'], ingredients:['chicken','rice','ghee','cumin','turmeric'] },
  'arabic': { menu:['Mandi','Kabsa','Shawarma','Falafel','Hummus'], ingredients:['chicken','lamb','rice','chickpeas','tahini'] },
  'default': { menu:['Grilled Chicken','Fresh Salad','Rice','Soup'], ingredients:['chicken','vegetables','rice','oil','salt'] }
};

// ✅ Get Menu Function (with fallback)
async function getMenu(name, cuisine) {
  try {
    const d = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(name+' menu')}&hl=en`, {
      headers: {'User-Agent':'Mozilla/5.0'}, timeout: 8000
    });
    const $ = cheerio.load(d.data); 
    let txt=''; 
    $('body').each((i,e)=>txt+=$(e).text()+' ');
    const dishes=[];
    [/\b(\w+\s+biryani)\b/gi,/\b(\w+\s+kebab)\b/gi,/\b(\w+\s+curry)\b/gi].forEach(p=>{
      const m=txt.match(p); 
      if(m) m.forEach(x=>{if(!dishes.includes(x.trim()))dishes.push(x.trim())});
    });
    if(dishes.length>0) return {menu:dishes.slice(0,8),ingredients:['See menu']};
  } catch(e) {}
  const c=(cuisine||'').toLowerCase(); 
  let k='default';
  for(let key in CUISINE_DB){if(c.includes(key)){k=key;break;}}
  return CUISINE_DB[k];
}

// ✅ API Endpoint: Fetch Restaurants
app.get('/api/restaurants', async(req,res)=>{
  const area=req.query.area; 
  if(!area||!AREAS[area]) return res.status(400).json({error:'Invalid area'});
  const{lat,lon,radius}=AREAS[area];
  const q=`[out:json][timeout:25];(node["amenity"="restaurant"](around:${radius},${lat},${lon});way["amenity"="restaurant"](around:${radius},${lat},${lon}););out body center;`;
  try{
    const r=await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`,{
      headers:{'User-Agent':'DubaiDemo/1.0'}, timeout: 30000
    });
    const el=r.data.elements||[]; 
    const list=[]; 
    const max=Math.min(el.length,6);
    for(let i=0;i<max;i++){
      const tags=el[i].tags||{}; 
      const name=tags.name||tags['name:en']; 
      if(!name)continue;
      const{menu,ingredients}=await getMenu(name,tags.cuisine);
      list.push({
        name, mainArea:area,
        subArea:tags['addr:suburb']||'Not specified',
        street:tags['addr:street']||'Not specified',
        cuisine:tags.cuisine||'Restaurant',
        phone:tags.phone||'Not listed',
        website:tags.website||'Not listed',
        hours:tags.opening_hours||'Not listed',
        menu, ingredients
      });
      await new Promise(r=>setTimeout(r,1500));
    }
    res.json({area,count:list.length,restaurants:list});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Failed to fetch'});
  }
});

// ✅ Serve static files from 'public' folder (FRONTEND)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Catch-all route: Serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Export for Vercel serverless + Start server for local
const PORT = process.env.PORT || 3001;

// Vercel uses module.exports, local uses app.listen
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}