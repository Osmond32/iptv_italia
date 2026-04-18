data.channels.forEach(channel => {
    let streamUrl = "";

    // TRUCCO: Usiamo flussi diretti alternativi per i canali principali che ti servono
    const backupLinks = {
        "Rai 1": "https://stmv.bolls.tv/rai1/playlist.m3u8",
        "Rai 2": "https://stmv.bolls.tv/rai2/playlist.m3u8",
        "Rai 3": "https://stmv.bolls.tv/rai3/playlist.m3u8",
        "Rete 4": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(r4)/index.m3u8",
        "Canale 5": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(c5)/index.m3u8",
        "Italia 1": "https://live3-mediaset-it.akamaized.net/Content/hls_h0_clr_vos/live/channel(i1)/index.m3u8"
    };

    if (backupLinks[channel.name]) {
        streamUrl = backupLinks[channel.name];
    } else if (channel.nativeHLS) {
        streamUrl = channel.nativeHLS.url;
    } else {
        streamUrl = channel.url;
    }

    if (!streamUrl || !streamUrl.startsWith('http') || channel.type === 'iframe') return;

    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";
    
    // Pulizia totale: niente pipe, niente User-Agent, solo link puro per massima compatibilità
    m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
    m3uContent += `${streamUrl}\n`;
});