const fs = require('fs');

const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";
    let drmTags = "";

    // 1. Logica di selezione URL (Priorità Geoblock per TV8 e Mediaset)
    if (channel.geoblock && typeof channel.geoblock === 'object' && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    } else if (channel.nativeHLS && channel.nativeHLS.url) {
        streamUrl = channel.nativeHLS.url;
    } else {
        streamUrl = channel.url;
    }
const fs = require('fs');

const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // 1. Diamo priorità a nativeHLS (il formato più compatibile)
    if (channel.nativeHLS && channel.nativeHLS.url) {
        streamUrl = channel.nativeHLS.url;
    } 
    // 2. Se non c'è nativeHLS, usiamo geoblock.url se esiste
    else if (channel.geoblock && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    }
    // 3. Altrimenti usiamo l'URL principale, ma SOLO se è un vero link http
    else if (channel.url && channel.url.startsWith('http')) {
        // Scartiamo gli iframe/popup perché i decoder non li leggono
        if (channel.type !== 'iframe' && channel.type !== 'popup') {
            streamUrl = channel.url;
        }
    }

    // Se non abbiamo trovato un URL valido, saltiamo il canale
    if (!streamUrl) return;

    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
    const userAgent = "AppleCoreMedia/1.0.0.19E258 (Apple TV; U; CPU OS 15_4 like Mac OS X; it_it)";

    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
    // Trucco User-Agent per sbloccare Mediaset/Rai
    m3uContent += `${streamUrl}|User-Agent=${encodeURIComponent(userAgent)}\n`;
});

fs.writeFileSync('lista.m3u', m3uContent);
console.log("Lista pulita e ottimizzata generata con successo!");
    // 2. Gestione DRM per LA7 (Sperimentale per alcuni decoder)
    if (channel.license === "clearkey" && channel.licensedetails) {
        // Questi tag servono a dire al decoder: "Usa questa chiave per decriptare"
        drmTags = `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
        drmTags += `#KODIPROP:inputstream.adaptive.license_key=${channel.licensedetails}\n`;
    }

    // 3. Scrittura nel file
    if (streamUrl && streamUrl.startsWith('http')) {
        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
        
        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
        if (drmTags) m3uContent += drmTags; // Aggiunge i tag licenza solo se esistono
        m3uContent += `${streamUrl}\n`;
    }
});

fs.writeFileSync('lista.m3u', m3uContent);
console.log("Lista semplificata e pulita generata!");