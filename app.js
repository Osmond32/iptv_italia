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