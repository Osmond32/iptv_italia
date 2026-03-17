const fs = require('fs');

const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // TRUCCO: Diamo priorità ai link alternativi/geoblock che di solito sono più liberi
    if (channel.geoblock && typeof channel.geoblock === 'object' && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    } else if (channel.nativeHLS) {
        streamUrl = channel.nativeHLS.url;
    } else {
        streamUrl = channel.url;
    }

    // Saltiamo link non validi o protocolli strani (zappr://)
    if (!streamUrl || !streamUrl.startsWith('http')) return;

    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
    
    // User-Agent specifico per "ingannare" i server Mediaset/Rai
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
    
    // Aggiungiamo l'User-Agent sia come opzione che nell'URL (massima compatibilità)
    m3uContent += `#EXTVLCOPT:http-user-agent=${ua}\n`;
    m3uContent += `${streamUrl}|User-Agent=${encodeURIComponent(ua)}\n`;
});
fs.writeFileSync('lista.m3u', m3uContent);
console.log("Lista ottimizzata generata!");