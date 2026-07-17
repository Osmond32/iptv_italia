const fs = require('fs');

try {
    const rawData = fs.readFileSync('channels.json', 'utf8');
    const data = JSON.parse(rawData);

    let m3uContent = "#EXTM3U\n";

    data.channels.forEach(channel => {
        let streamUrl = "";

        // 1. Link stabili ad alta compatibilità per i canali principali (Digitale Terrestre)
        const backupLinks = {
            "Rai 1": "https://stmv.bolls.tv/rai1/playlist.m3u8",
            "Rai 2": "https://stmv.bolls.tv/rai2/playlist.m3u8",
            "Rai 3": "https://stmv.bolls.tv/rai3/playlist.m3u8",
            "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
            "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
            "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8",
            "20 Mediaset": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8"
        };

        // 2. Selezione URL intelligente adattata alla nuova struttura
        if (backupLinks[channel.name]) {
            streamUrl = backupLinks[channel.name];
        } 
        // Se c'è un fallback di tipo HLS (es. LA7), usiamo quello per i decoder!
        else if (channel.fallback && channel.fallback.type === 'hls') {
            streamUrl = channel.fallback.url;
        } 
        // Se c'è un geoblock con un URL valido (es. NOVE, Real Time, TV8, DMAX)
        else if (channel.geoblock && channel.geoblock.url && channel.geoblock.url.startsWith('http')) {
            streamUrl = channel.geoblock.url;
        } 
        // Altrimenti usiamo l'url nativo
        else if (channel.nativeHLS && channel.nativeHLS.url) {
            streamUrl = channel.nativeHLS.url;
        } 
        // Come ultima spiaggia l'url principale, ma solo se è valido e non è un iframe bloccato
        else if (channel.url && channel.url.startsWith('http')) {
            if (channel.type !== 'iframe' && channel.type !== 'popup') {
                streamUrl = channel.url;
            }
        }

        // Filtro di sicurezza finale (scarta i comandi come zappr://)
        if (!streamUrl || !streamUrl.startsWith('http')) {
            return;
        }

        // 3. Gestione loghi automatica
        let logoUrl = "";
        if (channel.logo) {
            const logoName = channel.logo.replace('.svg', '.png');
            logoUrl = `https://raw.githubusercontent.com/freetv-ita/tv-logos/main/logos/${logoName}`;
        }

        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

        // 4. Aggiunta alla lista M3U
        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logoUrl}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    });

    fs.writeFileSync('lista.m3u', m3uContent);
    console.log("✅ Lista aggiornata e adattata alla nuova struttura di Zappr!");

} catch (error) {
    console.error("❌ Errore:", error.message);
}