const fs = require('fs');

// Carichiamo il file
const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // 1. FILTRO QUALITÀ: Cerchiamo l'URL migliore partendo dal più compatibile
    if (channel.nativeHLS && channel.nativeHLS.url) {
        streamUrl = channel.nativeHLS.url;
    } else if (channel.geoblock && channel.geoblock.url) {
        streamUrl = channel.geoblock.url;
    } else if (channel.url && channel.url.startsWith('http')) {
        // Escludiamo pagine web (iframe/popup) che il decoder non apre
        if (channel.type !== 'iframe' && channel.type !== 'popup') {
            streamUrl = channel.url;
        }
    }

    // Se l'URL non è valido o è un comando strano (zappr://), lo scartiamo
    if (!streamUrl || !streamUrl.startsWith('http')) return;

    // 2. TRUCCO IDENTITÀ: Ci fingiamo un'Apple TV per sbloccare Mediaset e Rai
    const userAgent = "AppleCoreMedia/1.0.0.19E258 (Apple TV; U; CPU OS 15_4 like Mac OS X; it_it)";
    
    // Costruiamo i dati del canale
    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
    const logo = channel.logo ? channel.logo : "";

    // Scriviamo nel formato M3U
    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logo}",${channel.name}\n`;
    m3uContent += `${streamUrl}|User-Agent=${encodeURIComponent(userAgent)}\n`;
});

// Salvataggio pulito
fs.writeFileSync('lista.m3u', m3uContent);
console.log("🔥 Lista filtrata e ottimizzata creata con successo!");