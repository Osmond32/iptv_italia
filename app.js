const fs = require('fs');

// 1. Caricamento dati
const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // Priorità: nativeHLS > geoblock.url > url standard
    if (channel.nativeHLS && channel.nativeHLS.url) {
        streamUrl = channel.nativeHLS.url;
    } else if (channel.geoblock && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    } else {
        streamUrl = channel.url;
    }

    // FILTRO DI SICUREZZA:
    // Saltiamo i link che non sono URL internet (http)
    // Saltiamo i link che portano a pagine web (iframe/popup)
    if (!streamUrl || !streamUrl.startsWith('http') || channel.type === 'iframe' || channel.type === 'popup') {
        return;
    }

    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
    const logo = channel.logo || "";

    // Formato M3U base (il più compatibile in assoluto)
    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logo}",${channel.name}\n`;
    m3uContent += `${streamUrl}\n`;
});

// Salvataggio
fs.writeFileSync('lista.m3u', m3uContent);
console.log("✅ Lista 'pulita' generata in lista.m3u");