const fs = require('fs');

// Leggiamo il file JSON
const rawData = fs.readFileSync('channels.json');
const data = JSON.parse(rawData);

let m3uContent = "#EXTM3U\n";

data.channels.forEach(channel => {
    // 1. Controllo URL: Priorità a nativeHLS, poi url standard
    const streamUrl = channel.nativeHLS ? channel.nativeHLS.url : channel.url;

    // 2. Controllo EPG (Il punto dove crashava): 
    // Se channel.epg esiste, prende l'id, altrimenti mette una stringa vuota
    const epgId = (channel.epg && channel.epg.id) ? channel.epg.id : "";

    // 3. Costruiamo la riga solo se abbiamo un URL valido
    if (streamUrl) {
        m3uContent += `#EXTINF:-1 tvg-id="${epgId}" tvg-logo="${channel.logo || ""}",${channel.name}\n`;
        m3uContent += `${streamUrl}\n`;
    }
});

// Salviamo il file
fs.writeFileSync('lista.m3u', m3uContent);
console.log("Successo! Il file lista.m3u è stato generato nella cartella.");