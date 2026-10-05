// =====================
// 🌍 DISASTER NEWS LOCAL (100% OFFLINE)
// =====================

function generateFakeNews() {

    const container = document.querySelector(".news-grid");
    if (!container) return;

    const catastrophes = [
        "Inondations majeures",
        "Séisme détecté",
        "Tempête violente",
        "Incendie de forêt",
        "Cyclone tropical",
        "Glissement de terrain",
        "Canicule extrême"
    ];

    const villes = [
        "États-Unis", "Japon", "Inde", "France", "Brésil",
        "Indonésie", "Italie", "Canada", "Australie", "Espagne"
    ];

    container.innerHTML = "";

    for (let i = 0; i < 12; i++) {

        const type = catastrophes[Math.floor(Math.random() * catastrophes.length)];
        const lieu = villes[Math.floor(Math.random() * villes.length)];

        const date = new Date().toLocaleString();

        container.innerHTML += `
            <div class="news-card" style="border-left:5px solid red">
                
                <div class="news-badge urgent">🚨 CATASTROPHE</div>

                <h3>⚠️ ${type} en ${lieu}</h3>

                <p class="news-date">
                    🌍 ${lieu} • ${date}
                </p>

                <p>Système de surveillance DisasterScout</p>

            </div>
        `;
    }
}

// =====================
// 🔄 UPDATE AUTO
// =====================
setInterval(generateFakeNews, 10000);

// START
document.addEventListener("DOMContentLoaded", generateFakeNews);
