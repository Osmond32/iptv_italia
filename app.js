const fs = require('fs');

// 1. Caricamento dati dal JSON
try {
    const rawData = fs.readFileSync('channels.json', 'utf8');
    const data = JSON.parse(rawData);

    let m3uContent = "#EXTM3U\n";

    data.channels.forEach(channel => {
        let streamUrl = "";

        // 2. Link ad alta compatibilità per i canali principali
        const backupLinks = {
            "Rai 1": "https://stmv.bolls.tv/rai1/playlist.m3u8",
            "Rai 2": "https://stmv.bolls.tv/rai2/playlist.m3u8",
            "Rai 3": "https://stmv.bolls.tv/rai3/playlist.m3u8",
            "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
            "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
            "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8",
            "20 Mediaset": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8"
        };

        // Selezione URL (Backup > nativeHLS > Geoblock > URL standard)
        if (backupLinks[channel.name]) {
            streamUrl = backupLinks[channel.name];
        } else if (channel.nativeHLS && channel.nativeHLS.url) {
            streamUrl = channel.nativeHLS.url;
        } else if (channel.geoblock && channel.geoblock.url) {
            streamUrl = channel.geoblock.url;
        } else {
            streamUrl = channel.url;
        }

        // Filtro: saltiamo link non validi o iframe
        if (!streamUrl || !streamUrl.startsWith('http') || channel.type === 'iframe' || channel.type === 'popup') {
            return;
        }

        // 3. Gestione LOGHI (Strada A: Conversione in PNG e URL assoluto)
        let logoUrl = "";
        if (channel.logo) {
            // Trasformiamo rai1.svg in rai1.png e puntiamo al server GitHub freetv-ita
            const logoName = channel.logo.replace('.svg', '.png');
            logoUrl = `https://raw.githubusercontent.com/freetv-ita/tv-logos/main/logos/${logoName}`;
        }

        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

        // 4. Scrittura riga M3U
        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logoUrl}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    });

    // 5. Salvataggio file
    fs.writeFileSync('lista.m3u', m3uContent);
    console.log("✅ Lista con loghi generata con successo!");

} catch (error) {
    console.error("❌ Errore durante l'esecuzione:", error.message);
}