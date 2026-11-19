const fs = require('fs');

try {
    const rawData = fs.readFileSync('channels.json', 'utf8');
    const data = JSON.parse(rawData);

    let m3uContent = "#EXTM3U\n";

    // 1. Canali principali Rai/Mediaset (non più presenti nel JSON di Zappr, li inseriamo noi in testa)
    const coreChannels = [
        { name: "Rai 1", epgId: "rai-1", logo: "rai1.png", url: "https://stmv.bolls.tv/rai1/playlist.m3u8" },
        { name: "Rai 2", epgId: "rai-2", logo: "rai2.png", url: "https://stmv.bolls.tv/rai2/playlist.m3u8" },
        { name: "Rai 3", epgId: "rai-3", logo: "rai3.png", url: "https://stmv.bolls.tv/rai3/playlist.m3u8" },
        { name: "Rete 4", epgId: "348", logo: "rete4.png", url: "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8" },
        { name: "Canale 5", epgId: "79", logo: "canale5.png", url: "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8" },
        { name: "Italia 1", epgId: "215", logo: "italia1.png", url: "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8" },
        { name: "20 Mediaset", epgId: "1379", logo: "20.png", url: "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(lb)/index.m3u8" }
    ];

    coreChannels.forEach(ch => {
        const logoUrl = `https://raw.githubusercontent.com/freetv-ita/tv-logos/main/logos/${ch.logo}`;
        m3uContent += `#EXTINF:-1 tvg-id="${ch.epgId}" tvg-logo="${logoUrl}",${ch.name}\n`;
        m3uContent += `${ch.url}\n`;
    });

    // 2. Flussi HLS liberi alternativi per bypassare DASH/ClearKey (TV8, NOVE, Discovery, ecc.)
    const stableLinks = {
        "LA7": "https://d1chghleocc9sm.cloudfront.net/Live.m3u8",
        "TV8": "https://skylive-lh.akamaihd.net/i/tv8_1@404090/master.m3u8",
        "NOVE": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S81643194/master.m3u8",
        "Cielo": "https://skylive-lh.akamaihd.net/i/cielo_1@404091/master.m3u8",
        "Real Time": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S34263124/master.m3u8",
        "DMAX": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S13746312/master.m3u8",
        "Giallo": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S19146312/master.m3u8",
        "HGTV - Home & Garden": "https://d1tidto9vz737l.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-joaw4f4kh2en1/HGTV_IT.m3u8",
        "Discovery Turbo": "https://d205m6k582pec4.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-asg5puyzdtnqu/Motortrend_IT.m3u8"
    };

    // 3. Elaborazione canali dal nuovo channels.json
    data.channels.forEach(channel => {
        // Ignoriamo i canali disabilitati da Zappr (es. K2, Frisbee)
        if (channel.disabled) return;

        let streamUrl = "";

        if (stableLinks[channel.name]) {
            streamUrl = stableLinks[channel.name];
        } else if (channel.fallback && channel.fallback.type === 'hls' && channel.fallback.url.startsWith('http')) {
            streamUrl = channel.fallback.url;
        } else if (channel.nativeHLS && channel.nativeHLS.url) {
            streamUrl = channel.nativeHLS.url;
        } else if (channel.url && channel.url.startsWith('http') && !['iframe', 'popup', 'dash'].includes(channel.type)) {
            streamUrl = channel.url;
        }

        if (!streamUrl || !streamUrl.startsWith('http')) return;

        // Correzione estensione logo (.svg -> .png, oppure aggiunta .png se mancante)
        let logoUrl = "";
        if (channel.logo) {
            const cleanName = channel.logo.replace(/\.svg$/i, '');
            const logoName = cleanName.endsWith('.png') ? cleanName : `${cleanName}.png`;
            logoUrl = `https://raw.githubusercontent.com/freetv-ita/tv-logos/main/logos/${logoName}`;
        }

        const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${logoUrl}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    });

    fs.writeFileSync('lista.m3u', m3uContent);
    console.log("✅ lista.m3u generata con successo!");

} catch (error) {
    console.error("❌ Errore durante la generazione:", error.message);
}