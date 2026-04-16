const fs = require('fs');

// 1. CARICAMENTO DATI
const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    let streamUrl = "";

    // 2. LOGICA TRUCCO MEDIASET (Link diretti Akamai)
    const mediasetIds = {
        "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
        "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8",
        "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
        "20 Mediaset": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8"
    };

    if (mediasetIds[channel.name]) {
        streamUrl = mediasetIds[channel.name];
    } else {
        // Logica standard per gli altri canali
        if (channel.nativeHLS) streamUrl = channel.nativeHLS.url;
        else if (channel.geoblock && channel.geoblock.url) streamUrl = channel.geoblock.url;
        else if (channel.url && channel.url.startsWith('http') && channel.type !== 'iframe') streamUrl = channel.url;
    }

    // Salta se l'URL non è valido
    if (!streamUrl || !streamUrl.startsWith('http')) return;

    // 3. DATI CANALE E HEADERS
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const ref = "https://www.mediasetinfinity.mediaset.it/";
    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
    
    // Formattazione speciale per Mediaset (URL | User-Agent e Referer)
    m3uContent += `${streamUrl}|User-Agent=${encodeURIComponent(ua)}&Referer=${encodeURIComponent(ref)}\n`;
});

// 4. SALVATAGGIO
fs.writeFileSync('lista.m3u', m3uContent);
console.log("✅ Lista aggiornata con i link Mediaset diretti!");