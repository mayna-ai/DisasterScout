
// =====================
// 🔑 API KEY
// =====================
const API_KEY = "729d9b4f550845d00dc31e74d908f418";

// =====================
// 🌦️ WEATHER API
// =====================
async function getWeather(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const res = await fetch(url);
        const data = await res.json();

        return {
            pluie: data.rain ? (data.rain["1h"] || 0) : 0,
            humidite: data.main.humidity,
            vent: data.wind.speed,
            temp: data.main.temp
        };

    } catch {
        return { pluie: 0, humidite: 50, vent: 10, temp: 25 };
    }
}

// =====================
// 🧠 MODÈLE IA SIMPLIFIÉ (jury-friendly)
// =====================
function calculateRisk(p, h, v) {

    // modèle pondéré (facile à expliquer au jury)
    const score =
        (p * 4) +        // pluie = facteur principal
        (h * 0.4) +      // humidité
        (v * 1.8);       // vent

    if (score > 110) return "critical";
    if (score > 75) return "high";
    if (score > 45) return "medium";
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
// 🇹🇳 TUNISIA DATASET
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
// 🚀 INIT MAP
// =====================
document.addEventListener("DOMContentLoaded", async function () {

    const map = L.map("map").setView([33.9, 9.5], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "DisasterScout - Tunisia Risk System"
    }).addTo(map);

    // =====================
    // ⏳ LOADER
    // =====================
    const loader = document.createElement("div");
    loader.innerHTML = "🧠 Analyse des risques en cours...";
    loader.style.cssText = `
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:white;
        padding:15px 20px;
        border-radius:10px;
        font-weight:bold;
        z-index:999;
        box-shadow:0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(loader);

    let riskStats = { low:0, medium:0, high:0, critical:0 };

    // =====================
    // 🔁 GENERATION MAP
    // =====================
    for (let v of villes) {

        const w = await getWeather(v.coords[0], v.coords[1]);

        const risk = calculateRisk(w.pluie, w.humidite, w.vent);
        const color = colors[risk];

        riskStats[risk]++;

        const circle = L.circle(v.coords, {
            color,
            fillColor: color,
            fillOpacity: 0.55,
            radius: 12000
        }).addTo(map);

        const popup = `
            <div style="font-family:Arial">
                <h3>${v.nom}</h3>
                <hr>
                🌧️ Pluie: ${w.pluie} mm<br>
                💧 Humidité: ${w.humidite}%<br>
                🌬️ Vent: ${w.vent} m/s<br>
                🌡️ Temp: ${w.temp}°C<br>
                <br>
                <b style="color:${color}">
                    ⚠️ RISQUE: ${risk.toUpperCase()}
                </b>
            </div>
        `;

        circle.bindPopup(popup);

        L.marker(v.coords).addTo(map).bindPopup(popup);
    }

    loader.remove();

    // =====================
    // 📊 DASHBOARD JURY
    // =====================
    const panel = document.createElement("div");

    panel.innerHTML = `
        📊 <b>Dashboard Risk Analysis</b><br><br>
        🟢 Low: ${riskStats.low}<br>
        🟡 Medium: ${riskStats.medium}<br>
        🟠 High: ${riskStats.high}<br>
        🔴 Critical: ${riskStats.critical}<br>
    `;

    panel.style.cssText = `
        position:absolute;
        top:10px;
        right:10px;
        background:white;
        padding:12px;
        border-radius:10px;
        font-size:14px;
        z-index:999;
        box-shadow:0 4px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(panel);

});
// Remplir la liste d'auto-complétion au chargement
document.addEventListener("DOMContentLoaded", function() {
    const dataList = document.getElementById('villesList');
    villes.forEach(v => {
        const option = document.createElement('option');
        option.value = v.nom;
        dataList.appendChild(option);
    });
});

// Fonction pour rechercher et zoomer
function searchCity() {
    const input = document.getElementById('citySearch').value.toLowerCase();
    const villeTrouvee = villes.find(v => v.nom.toLowerCase() === input);

    if (villeTrouvee) {
        // 'map' doit être accessible globalement ou passé en paramètre
        // On récupère l'instance de la carte (assurez-vous que 'map' est déclaré en dehors du scope DOMContentLoaded)
        window.mapInstance.setView(villeTrouvee.coords, 10);
        
        // Optionnel : ouvrir le popup automatiquement
        L.popup()
            .setLatLng(villeTrouvee.coords)
            .setContent(`<b>${villeTrouvee.nom}</b><br>Zoom automatique`)
            .openOn(window.mapInstance);
    } else {
        alert("Ville non trouvée dans la base DisasterScout.");
    }
}