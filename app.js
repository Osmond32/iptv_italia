const fs = require('fs');

try {
    const rawData = fs.readFileSync('channels.json', 'utf8');
    const data = JSON.parse(rawData);

    let m3uContent = "#EXTM3U\n";

    data.channels.forEach(channel => {
        let streamUrl = "";

        // DATABASE DI LINK DIRETTI SBLOCCATI (HLS)
        // Sostituiamo i link DASH/ClearKey di Zappr con flussi liberi per il decoder
        const stableLinks = {
            "Rai 1": "https://stmv.bolls.tv/rai1/playlist.m3u8",
            "Rai 2": "https://stmv.bolls.tv/rai2/playlist.m3u8",
            "Rai 3": "https://stmv.bolls.tv/rai3/playlist.m3u8",
            "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
            "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
            "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8",
            "20 Mediaset": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8",
            
            // Nuovi link HLS sbloccati per i canali Discovery/Sky che davano schermo nero
            "LA7": "https://d1chghleocc9sm.cloudfront.net/Live.m3u8",
            "TV8": "https://skylive-lh.akamaihd.net/i/tv8_1@404090/master.m3u8",
            "NOVE": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S81643194/master.m3u8",
            "Cielo": "https://skylive-lh.akamaihd.net/i/cielo_1@404091/master.m3u8",
            "Real Time": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S34263124/master.m3u8",
            "DMAX": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S13746312/master.m3u8",
            "Giallo": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S19146312/master.m3u8"
        };

        // Selezione dell'URL
        if (stableLinks[channel.name]) {
            streamUrl = stableLinks[channel.name];
        } else if (channel.fallback && channel.fallback.type === 'hls') {
            streamUrl = channel.fallback.url;
        } else if (channel.nativeHLS && channel.nativeHLS.url) {
            streamUrl = channel.nativeHLS.url;
        } else if (channel.url && channel.url.startsWith('http') && channel.type !== 'iframe' && channel.type !== 'popup' && channel.type !== 'dash') {
            streamUrl = channel.url;
        }

        // Se il canale non ha un link compatibile (es. è ancora rimasto in DASH o zappr://), lo saltiamo
        if (!streamUrl || !streamUrl.startsWith('http')) {
            return;
        }

        // Gestione loghi
        let logoUrl = "";
        if (channel.logo) {
            const logoName = channel.logo.replace('.svg', '.png');
            logoUrl = `https://raw.githubusercontent.com/freetv-ita/tv-logos/main/logos/${logoName}`;
        }

        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logoUrl}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    });

    fs.writeFileSync('lista.m3u', m3uContent);
    console.log("🔥 Lista rigenerata con flussi HLS alternativi per bypassare ClearKey!");

} catch (error) {
    console.error("❌ Errore:", error.message);
}