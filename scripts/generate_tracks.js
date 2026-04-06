const fs = require('fs');
const path = require('path');

const tracksPath = 'e:\\Vibe-Coding-projects\\Project-1\\Music-Player\\my-music-player\\data\\tracks.json';
const tracksData = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));

const existingTracks = tracksData.tracks;
const newTracks = [...existingTracks];

const genres = ['synthwave', 'ambient', 'electronic', 'lo-fi', 'indie', 'pop', 'rock', 'jazz', 'classical', 'techno'];
const moods = ['chill', 'focus', 'hype', 'party', 'morning', 'sleep', 'sad'];
const adjectives = ['Electric', 'Midnight', 'Golden', 'Silent', 'Dancing', 'Neon', 'Velvet', 'Crystal', 'Wandering', 'Hidden', 'Azure', 'Crimson', 'Emerald', 'Sapphire', 'Obsidian', 'Luminous'];
const nouns = ['Dream', 'Pulse', 'Road', 'Waves', 'Memory', 'City', 'Forest', 'Ocean', 'Sky', 'Echo', 'Vibration', 'Rhythm', 'Storm', 'Shadow', 'Light', 'Vision'];
const artists = ['Neon Pulse', 'Calm Shores', 'Voltage', 'Lo-Fi Dreams', 'Sunset Collective', 'Endorphin', 'Cosmos', 'Vortex', 'Prism', 'Orbit', 'Waveform', 'Frequency'];

for (let i = existingTracks.length + 1; i <= 300; i++) {
  const id = `track-${String(i).padStart(3, '0')}`;
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const title = `${adjective} ${noun}`;
  const artist = artists[Math.floor(Math.random() * artists.length)];
  const genre = genres[Math.floor(Math.random() * genres.length)];
  const trackMoods = [moods[Math.floor(Math.random() * moods.length)]];
  if (Math.random() > 0.5) {
    trackMoods.push(moods[Math.floor(Math.random() * moods.length)]);
  }
  
  newTracks.push({
    id,
    title,
    artist,
    album: `${adjective} Journeys`,
    duration: 180 + Math.floor(Math.random() * 120),
    src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 15) + 1}.mp3`,
    cover: `https://picsum.photos/seed/${id}/400/400`,
    mood: Array.from(new Set(trackMoods)),
    genre,
    year: 2020 + Math.floor(Math.random() * 5),
    favorite: Math.random() > 0.8,
    playCount: Math.floor(Math.random() * 50),
    lastPlayed: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString() : null
  });
}

tracksData.tracks = newTracks;
fs.writeFileSync(tracksPath, JSON.stringify(tracksData, null, 2));
console.log('Successfully added 100 tracks to tracks.json');
