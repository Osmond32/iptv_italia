const fs = require('fs');

const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // SELEZIONE INTELLIGENTE DELL'URL
    // 1. Cerchiamo prima nei campi alternativi che spesso sono più compatibili
    if (channel.geoblock && typeof channel.geoblock === 'object' && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    } else if (channel.nativeHLS && channel.nativeHLS.url) {
        streamUrl = channel.nativeHLS.url;
    } else {
        streamUrl = channel.url;
    }

    // Filtro di sicurezza: carichiamo solo URL che iniziano con http/https
    // Questo esclude i link "zappr://" o "iframe" che bloccano il decoder
    if (streamUrl && streamUrl.startsWith('http')) {
        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
        const logo = channel.logo ? channel.logo : "";

        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logo}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    }
});

fs.writeFileSync('lista.m3u', m3uContent);
console.log("Lista semplificata e pulita generata!");