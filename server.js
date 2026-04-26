const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express(); app.use(cors());

// ✅ ALL Dubai Areas with Fine Dining Focus
const AREAS = {
  'Deira': { lat: 25.2697, lon: 55.3293, radius: 3000 },
  'Bur Dubai': { lat: 25.2632, lon: 55.2972, radius: 3000 },
  'Dubai Marina': { lat: 25.0805, lon: 55.1396, radius: 3000 },
  'JLT': { lat: 25.0693, lon: 55.1467, radius: 2500 },
  'Downtown Dubai': { lat: 25.1972, lon: 55.2744, radius: 3000 },
  'Business Bay': { lat: 25.1867, lon: 55.2633, radius: 2500 },
  'DIFC': { lat: 25.2133, lon: 55.2833, radius: 2000 },
  'Jumeirah 1': { lat: 25.2289, lon: 55.2589, radius: 2500 },
  'Jumeirah 2': { lat: 25.2367, lon: 55.2667, radius: 2500 },
  'Jumeirah 3': { lat: 25.2433, lon: 55.2733, radius: 2500 },
  'Umm Suqeim': { lat: 25.1367, lon: 55.1833, radius: 3000 },
  'Al Wasl': { lat: 25.2233, lon: 55.2633, radius: 2500 },
  'Al Safa': { lat: 25.1633, lon: 55.2233, radius: 2500 },
  'Satwa': { lat: 25.2367, lon: 55.2733, radius: 2000 },
  'JBR': { lat: 25.0767, lon: 55.1333, radius: 2000 },
  'Palm Jumeirah': { lat: 25.1133, lon: 55.1383, radius: 3500 },
  'Bluewaters Island': { lat: 25.0783, lon: 55.1183, radius: 1500 },
  'Al Barsha': { lat: 25.1089, lon: 55.1989, radius: 3000 },
  'Arabian Ranches': { lat: 25.0533, lon: 55.2633, radius: 3500 },
  'The Springs': { lat: 25.0633, lon: 55.2333, radius: 2500 },
  'The Meadows': { lat: 25.0733, lon: 55.2133, radius: 2500 },
  'Emirates Hills': { lat: 25.0833, lon: 55.1933, radius: 2500 },
  'Dubai Hills Estate': { lat: 25.1133, lon: 55.2433, radius: 3500 },
  'Al Karama': { lat: 25.2467, lon: 55.3033, radius: 2000 },
  'Oud Metha': { lat: 25.2433, lon: 55.3133, radius: 2500 },
  'Al Mankhool': { lat: 25.2533, lon: 55.2933, radius: 2000 },
  'Al Qusais': { lat: 25.2867, lon: 55.3833, radius: 3500 },
  'Al Twar': { lat: 25.2733, lon: 55.3533, radius: 3000 },
  'Al Hamriya': { lat: 25.2633, lon: 55.3233, radius: 2500 },
  'Port Saeed': { lat: 25.2567, lon: 55.3133, radius: 2000 },
  'Al Rigga': { lat: 25.2533, lon: 55.3233, radius: 2000 },
  'Naif': { lat: 25.2683, lon: 55.3133, radius: 2000 },
  'Al Murar': { lat: 25.2633, lon: 55.3333, radius: 2000 },
  'Al Nahda': { lat: 25.3036, lon: 55.3746, radius: 3000 },
  'Muhaisnah': { lat: 25.2933, lon: 55.3633, radius: 3000 },
  'Al Qiyadah': { lat: 25.2833, lon: 55.3433, radius: 2500 },
  'Mirdif': { lat: 25.2167, lon: 55.4167, radius: 4000 },
  'Al Warqa': { lat: 25.1833, lon: 55.4333, radius: 3500 },
  'Nad Al Sheba': { lat: 25.1633, lon: 55.3833, radius: 3500 },
  'Al Khawaneej': { lat: 25.2533, lon: 55.4233, radius: 3500 },
  'Al Mizhar': { lat: 25.2333, lon: 55.4033, radius: 3000 },
  'Dubai Silicon Oasis': { lat: 25.1233, lon: 55.3783, radius: 3500 },
  'International City': { lat: 25.1683, lon: 55.4117, radius: 3500 },
  'Dubai South': { lat: 24.8967, lon: 55.1617, radius: 4000 },
  'Motor City': { lat: 25.0433, lon: 55.2383, radius: 2500 },
  'Sports City': { lat: 25.0383, lon: 55.2183, radius: 2500 },
  'Studio City': { lat: 25.0533, lon: 55.2083, radius: 2500 },
  'Discovery Gardens': { lat: 25.0433, lon: 55.1283, radius: 2500 },
  'Ibn Battuta': { lat: 25.0433, lon: 55.1183, radius: 2000 },
  'Al Furjan': { lat: 25.0233, lon: 55.1483, radius: 3000 },
  'Damac Hills': { lat: 25.0633, lon: 55.2883, radius: 3000 },
  'Town Square': { lat: 25.0533, lon: 55.3183, radius: 3000 },
  'Remraam': { lat: 25.0633, lon: 55.3383, radius: 2500 },
  'Al Barari': { lat: 25.0933, lon: 55.2683, radius: 2500 }
};

// ✅ Fine Dining Cuisine Database
const CUISINE_DB = {
  'fine dining': { menu:['Tasting Menu','Chef\'s Special','Wagyu Beef','Lobster Thermidor','Foie Gras','Caviar Service','Sous Vide','Molecular Gastronomy'], ingredients:['truffle','saffron','wagyu','lobster','caviar','foie gras','gold leaf','michelin'] },
  'italian': { menu:['Osso Buco','Risotto','Truffle Pasta','Burrata','Tiramisu','Carpaccio','Panna Cotta'], ingredients:['parmesan','truffle','basil','mozzarella','prosciutto','balsamic','olive oil'] },
  'french': { menu:['Coq au Vin','Bouillabaisse','Duck Confit','Beef Bourguignon','Crème Brûlée','Soufflé','Escargot'], ingredients:['butter','cream','wine','herbs','cheese','shallots','dijon'] },
  'japanese': { menu:['Omakase','Wagyu Sushi','Sashimi Platter','Tempura','Ramen','Yakitori','Miso Black Cod'], ingredients:['fish','rice','wasabi','soy','seaweed','ginger','sake'] },
  'indian': { menu:['Butter Chicken','Biryani','Tandoori','Dal Makhani','Paneer Tikka','Naan','Gulab Jamun'], ingredients:['chicken','rice','ghee','cumin','turmeric','garam masala','ginger','garlic'] },
  'arabic': { menu:['Mandi','Kabsa','Shawarma','Falafel','Hummus','Fatteh','Mutabbal','Tabbouleh'], ingredients:['chicken','lamb','rice','chickpeas','tahini','lemon','garlic','parsley'] },
  'steakhouse': { menu:['Ribeye Steak','Filet Mignon','Tomahawk','Prime Rib','Lamb Chops','Seafood Tower','Caesar Salad'], ingredients:['beef','lamb','salt','pepper','garlic','butter','herbs'] },
  'seafood': { menu:['Grilled Fish','Lobster','Prawns','Calamari','Fish & Chips','Seafood Platter','Oysters'], ingredients:['fish','prawns','lobster','lemon','garlic','herbs','olive oil'] },
  'default': { menu:['Grilled Chicken','Fresh Salad','Rice Pilaf','Grilled Vegetables','Soup','Dessert'], ingredients:['chicken','vegetables','rice','oil','salt','pepper','herbs'] }
};

async function getMenu(name, cuisine) {
  try {
    const d = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(name+' fine dining menu')}&hl=en`, {headers:{'User-Agent':'Mozilla/5.0'},timeout:8000});
    const $ = cheerio.load(d.data); let txt=''; $('body').each((i,e)=>txt+=$(e).text()+' ');
    const dishes=[]; [/\b(\w+\s+steak)\b/gi,/\b(\w+\s+lobster)\b/gi,/\b(\w+\s+truffle)\b/gi,/\b(\w+\s+caviar)\b/gi,/\b(\w+\s+wagyu)\b/gi,/\b(\w+\s+risotto)\b/gi,/\b(\w+\s+carpaccio)\b/gi].forEach(p=>{const m=txt.match(p); if(m)m.forEach(x=>{if(!dishes.includes(x.trim()))dishes.push(x.trim())})});
    if(dishes.length>0) return {menu:dishes.slice(0,8),ingredients:['premium','fine dining','gourmet']};
  } catch(e) {}
  const c=(cuisine||'').toLowerCase(); let k='default';
  for(let key in CUISINE_DB){if(c.includes(key)){k=key;break;}}
  return CUISINE_DB[k];
}

app.get('/api/restaurants', async(req,res)=>{
  const area=req.query.area; if(!area||!AREAS[area])return res.status(400).json({error:'Invalid area'});
  const{lat,lon,radius}=AREAS[area];
  const q=`[out:json][timeout:25];(node["amenity"="restaurant"](around:${radius},${lat},${lon});way["amenity"="restaurant"](around:${radius},${lat},${lon}););out body center;`;
  try{
    const r=await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`,{headers:{'User-Agent':'FineDining/1.0'},timeout:30000});
    const el=r.data.elements||[]; const list=[]; const max=Math.min(el.length,8);
    for(let i=0;i<max;i++){
      const tags=el[i].tags||{}; const name=tags.name||tags['name:en']; if(!name)continue;
      const{menu,ingredients}=await getMenu(name,tags.cuisine);
      list.push({name,mainArea:area,subArea:tags['addr:suburb']||'Not specified',street:tags['addr:street']||'Not specified',cuisine:tags.cuisine||'Restaurant',phone:tags.phone||'Not listed',website:tags.website||'Not listed',hours:tags.opening_hours||'Not listed',menu,ingredients,lat:el[i].lat||el[i].center?.lat,lon:el[i].lon||el[i].center?.lon});
      await new Promise(r=>setTimeout(r,1500));
    }
    res.json({area,count:list.length,restaurants:list});
  }catch(e){console.error(e);res.status(500).json({error:'Failed'});}
});

app.listen(3001,()=>console.log('✅ Fine Dining Server: http://localhost:3001'));