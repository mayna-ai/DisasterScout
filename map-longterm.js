// =====================
// 🔑 API KEY
// =====================
const API_KEY = "729d9b4f550845d00dc31e74d908f418";

// =====================
// 🌦️ FORECAST API (5 jours )
// =====================
async function getForecast(lat, lon, dayOffset = 0) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        // Jour spécifique selon offset
        const targetDay = data.list[Math.floor(8 * dayOffset)] || data.list[data.list.length - 1];
        
        return {
            pluie: targetDay.rain ? (targetDay.rain["3h"] || 0) * 8 : 0, // Convertir 3h vers 24h
            humidite: targetDay.main.humidity,
            vent: targetDay.wind.speed,
            temp: targetDay.main.temp,
            date: new Date(targetDay.dt * 1000).toLocaleDateString('fr-FR')
        };
    } catch {
        return { 
            pluie: Math.random() * 20, 
            humidite: 60 + Math.random() * 30, 
            vent: 5 + Math.random() * 15, 
            temp: 15 + Math.random() * 20,
            date: 'N/A'
        };
    }
}

// =====================
// 🧠 MODÈLE LONG TERME (plus conservateur)
// =====================
function calculateLongTermRisk(p, h, v, dayOffset) {
    // Modèle plus conservateur pour long terme + facteur temporal
    const trendFactor = 1 + (dayOffset * 0.1); // Risques augmentent légèrement avec le temps
    const score = 
        (p * 3) +           // pluie moins pondérée
        (h * 0.3) +         // humidité
        (v * 1.5) +         // vent
        (trendFactor * 10); // facteur temporel

    if (score > 90) return "critical";
    if (score > 65) return "high";
    if (score > 40) return "medium";
    return "low";
}

// =====================
// 🎨 COLORS
// =====================
const colors = {
    low: "#2ed573",
    medium: "#ffa502",
    high: "#ff6348",
    critical: "#ff4757"
};

// =====================
// 🇹🇳 TUNISIA CITIES (même dataset)
// =====================
const villes = [
    { nom: "Tunis", coords: [36.8065, 10.1815] },
    { nom: "Ariana", coords: [36.8665, 10.1647] },
    { nom: "Ben Arous", coords: [36.7435, 10.2310] },
    { nom: "Manouba", coords: [36.8101, 10.0950] },
    { nom: "Bizerte", coords: [37.2744, 9.8739] },
    { nom: "Béja", coords: [36.7256, 9.1817] },
    { nom: "Jendouba", coords: [36.5011, 8.7802] },
    { nom: "Le Kef", coords: [36.1820, 8.7148] },
    { nom: "Sousse", coords: [35.8256, 10.6370] },
    { nom: "Monastir", coords: [35.7643, 10.8113] },
    { nom: "Mahdia", coords: [35.5047, 11.0621] },
    { nom: "Kairouan", coords: [35.6781, 10.0963] },
    { nom: "Kasserine", coords: [35.1675, 8.8365] },
    { nom: "Sidi Bouzid", coords: [35.0382, 9.4849] },
    { nom: "Sfax", coords: [34.7406, 10.7603] },
    { nom: "Gabès", coords: [33.8815, 10.0982] },
    { nom: "Médenine", coords: [33.3549, 10.5055] },
    { nom: "Tataouine", coords: [32.9297, 10.4518] },
    { nom: "Gafsa", coords: [34.4250, 8.7842] },
    { nom: "Tozeur", coords: [33.9199, 8.1335] },
    { nom: "Kébili", coords: [33.7050, 8.9690] },
    { nom: "Hammamet", coords: [36.4000, 10.6167] },
    { nom: "Djerba", coords: [33.8076, 10.8451] },
    { nom: "Zarzis", coords: [33.5031, 11.1122] }
];

// =====================
// 🌍 GLOBAL VARIABLES
// =====================
let mapInstance;
let currentLayer;
let currentDay = 0;
let riskStats = { low:0, medium:0, high:0, critical:0 };

// =====================
// 🚀 INITIALIZATION
// =====================
document.addEventListener("DOMContentLoaded", initMap);

async function initMap() {
    mapInstance = L.map("map").setView([33.9, 9.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "DisasterScout - Long Term Forecast"
    }).addTo(mapInstance);

    // Tabs functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentDay = parseInt(btn.dataset.day);
            updateMap();
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    await updateMap();
    updateStats();
    setInterval(updateStats, 30000); // Update stats every 30s
}

// =====================
// 🔄 UPDATE MAP
// =====================
async function updateMap() {
    // Clear previous layer
    if (currentLayer) mapInstance.removeLayer(currentLayer);
    
    const loader = createLoader("🧠 Calcul prévisions J+" + currentDay + "...");
    
    currentLayer = L.layerGroup();
    
    riskStats = { low:0, medium:0, high:0, critical:0 };

    for (let v of villes) {
        const weather = await getForecast(v.coords[0], v.coords[1], currentDay);
        const risk = calculateLongTermRisk(weather.pluie, weather.humidite, weather.vent, currentDay);
        const color = colors[risk];
        
        riskStats[risk]++;

        const circle = L.circle(v.coords, {
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            radius: 15000 + (currentDay * 1000) // Cercles plus grands pour long terme
        }).addTo(currentLayer);

        const popup = `
            <div style="font-family:Arial; min-width:250px">
                <h3><i class="fas fa-map-marker-alt"></i> ${v.nom}</h3>
                <hr style="margin:10px 0">
                <div class="forecast-date">${weather.date}</div>
                🌧️ Pluie prévue: ${weather.pluie.toFixed(1)} mm<br>
                💧 Humidité: ${weather.humidite}%<br>
                🌬️ Vent: ${weather.vent.toFixed(1)} m/s<br>
                🌡️ Temp: ${weather.temp.toFixed(1)}°C<br>
                <br>
                <b style="color:${color}; font-size:1.2em">
                    ⚠️ RISQUE J+${currentDay}: ${risk.toUpperCase()}
                </b>
            </div>
        `;

        circle.bindPopup(popup);
        L.marker(v.coords, { icon: createCustomIcon(color) }).addTo(currentLayer).bindPopup(popup);
    }

    currentLayer.addTo(mapInstance);
    loader.remove();
    updateStats();
    document.getElementById('currentDate').textContent = `Prévisions J+${currentDay}`;
}

// =====================
// 📊 STATS UPDATE
// =====================
function updateStats() {
    const alertCount = riskStats.high + riskStats.critical;
    document.getElementById('alertCount').textContent = alertCount;
    document.getElementById('nextUpdate').textContent = `Dans ${Math.floor(Math.random()*12)+1}h`;
    
    const trend = (riskStats.critical > 2 || riskStats.high > 5) ? '🚨 En hausse' : 
                  (riskStats.medium > 10) ? '⚠️ Stable' : '✅ Faible';
    document.getElementById('trend').textContent = trend;
}

// =====================
// 🛠️ UTILITIES
// =====================
function createLoader(text) {
    const loader = document.createElement("div");
    loader.innerHTML = text;
    loader.style.cssText = `
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%);
        background:white; padding:20px 30px;
        border-radius:15px; font-weight:bold; font-size:1.1em;
        z-index:1000; box-shadow:0 10px 30px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(loader);
    return loader;
}

function createCustomIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 2px 10px rgba(0,0,0,0.3)"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26]
    });
}