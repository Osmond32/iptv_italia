const fs = require('fs');

// 1. Caricamento del file JSON
// Assicurati che il file si chiami esattamente channels.json nella stessa cartella
try {
    const rawData = fs.readFileSync('channels.json', 'utf8');
    const data = JSON.parse(rawData);

    let m3uContent = "#EXTM3U\n";

    // 2. Ciclo sui canali
    data.channels.forEach(channel => {
        let streamUrl = "";

        // TRUCCO MEDIASET: Usiamo link diretti Akamai per stabilità
        const mediasetIds = {
            "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
            "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8",
            "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
            "20 Mediaset": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8"
        };

        // Selezione dell'URL migliore
        if (mediasetIds[channel.name]) {
            streamUrl = mediasetIds[channel.name];
        } else if (channel.nativeHLS && channel.nativeHLS.url) {
            streamUrl = channel.nativeHLS.url;
        } else if (channel.geoblock && channel.geoblock.url) {
            streamUrl = channel.geoblock.url;
        } else if (channel.url && channel.url.startsWith('http')) {
            // Escludiamo pagine web che il decoder non sa leggere
            if (channel.type !== 'iframe' && channel.type !== 'popup') {
                streamUrl = channel.url;
            }
        }

        // Saltiamo il canale se non c'è un URL valido o se è un comando proprietario (zappr://)
        if (!streamUrl || !streamUrl.startsWith('http')) return;

        // 3. Preparazione metadati
        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
        const logo = channel.logo ? channel.logo : "";
        
        // Headers per "ingannare" i server (User-Agent e Referer)
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        const ref = "https://www.mediasetinfinity.mediaset.it/";

        // 4. Costruzione riga M3U
        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logo}",${channel.name}\n`;
        
        // Aggiungiamo i parametri extra dopo il pipe | (funziona su smartphone e decoder moderni)
        m3uContent += `${streamUrl}|User-Agent=${encodeURIComponent(ua)}&Referer=${encodeURIComponent(ref)}\n`;
    });

    // 5. Scrittura del file finale
    fs.writeFileSync('lista.m3u', m3uContent, 'utf8');
    console.log("✅ File 'lista.m3u' generato con successo!");
    console.log("Ora puoi fare: git add . && git commit -m 'update' && git push");

} catch (error) {
    console.error("❌ Errore durante la generazione della lista:", error.message);
}