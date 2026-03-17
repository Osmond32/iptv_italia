const fs = require('fs');

const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    // 1. Logica URL (HLS nativo > Geoblock URL > URL Standard)
    let streamUrl = channel.url;
    if (channel.nativeHLS) streamUrl = channel.nativeHLS.url;
    if (channel.geoblock && channel.geoblock.url) streamUrl = channel.geoblock.url;

    // Saltiamo i link che non sono veri URL (es. zappr:// o iframe senza nativeHLS)
    if (!streamUrl || streamUrl.startsWith('http') === false) return;

    // 2. Costruzione parametri di "Trucco" (User-Agent e Referer)
    // Molti server Mediaset/Rai controllano chi sta chiedendo il video.
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    
    // Formattazione per il decoder (aggiungiamo l'User-Agent in coda all'URL con il pipe |)
    const finalUrl = `${streamUrl}|User-Agent=${encodeURIComponent(userAgent)}`;

    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

    // 3. Scrittura riga M3U
    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
    
    // Alcuni decoder leggono l'User-Agent anche tramite questo tag extra
    m3uContent += `#EXTVLCOPT:http-user-agent=${userAgent}\n`;
    m3uContent += `${finalUrl}\n`;
});

fs.writeFileSync('lista.m3u', m3uContent);
console.log("Lista ottimizzata generata!");