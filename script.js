const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const volumeValue = document.getElementById('volume-value');
const songTitle = document.getElementById('song-title');
const artist = document.getElementById('artist');
const songList = document.getElementById('song-list');
const albumArt = document.getElementById('album-art');

// Equalizer controls
const eqSliders = [
    document.getElementById('eq0'),
    document.getElementById('eq1'),
    document.getElementById('eq2'),
    document.getElementById('eq3'),
    document.getElementById('eq4')
];

// Sample songs - replace with your own
const songs = [
    { title: 'Sawariya DJ AAy gyo', artist: 'Artist 1', src: 'music/धमाकेदार टिमली 🔥__ सावरिया Dj आय गुया वो __ Dj 🔥 Remix Song __ Singer Ramesh mujhalda Rahul Baghel.mp3', art: '' },
    { title: 'Kele wala aaya', artist: 'Artist 2', src: 'music/केले वाला _Kele Wala _ VISHAL JAMUNE.mp3', art: '' },
    { title: 'Kotda ma veri khodeli re', artist: 'pankesh RATHVA', src: 'music/Kotda ma veri khodeli re_Pani bhrva aav janu _ pankesh RATHVA _ mp adivasi timli.mp3', art: '' },
    { title: 'Reshmi Baal', artist: 'Artist 2', src: 'music/Reshmi Baal.mp3', art: '' },
    { title: 'एक साथ 5 old आदिवासी गाने', artist: 'Artist 2', src: 'music/एक साथ 5 old आदिवासी गाने.mp3', art: '' },
    { title: 'Lalda wali ladi lene aaya', artist: 'VISHAL JAMUNE', src: 'music\\New Adivasi Song _ Lada Ladi _ Official Video _ Sanjay Kirade & Heena Dawar _ AVP #adivasisong.mp3', art: '' },
    { title: 'GADI TUY RUY KARE', artist: 'VISHAL JAMUNE', src: 'music\\GADI TUY RUY KARE _  Vijay Chouhan.mp3', art: '' },
    { title: 'Damper Ne 12 Tayr', artist: 'VISHAL JAMUNE', src: 'music\\Damper Ne 12 Tayr _ Singer Hasiram Alawe.mp3', art: '' },
    { title: 'Ajju Bhai Roast Dialogue Mix Mandal', artist: 'VISHAL JAMUNE', src: 'music\\Ajju Bhai Roast Dialogue Mix Mandal _ OLD Fefriya Mandal 2025 _ Dj Ram Pawar.mp3', art: '' },
    { title: '🔥Mandal - पावली मांदल‼️Dailuge Mixe 2025 Dhamak', artist: 'VISHAL JAMUNE', src: 'music\\🔥Mandal - पावली मांदल‼️Dailuge Mixe 2025 Dhamak‼️Aadiwasi Remix Mandal - Dj Ajay Badole.mp3', art: '' },
    { title: 'Bhongriyu Dekhne Akhali Guyli', artist: 'VISHAL JAMUNE', src: 'music\\Bhongriyu Dekhne Akhali Guyli _ Singer Vishal Jamune.mp3', art: '' },
    { title: 'timli', artist: 'VISHAL JAMUNE', src: 'music\\Adivasi song 2019  _ adivasi gana _ आदिवासी _ adivasi mp timli.mp3', art: '' },
    // Add more songs here
];

let favourites = [];
let currentSongIndex = 0;
let audioContext;
let source;
let gainNode;
let eqFilters = [];

// Initialize audio context and filters
function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    gainNode = audioContext.createGain();

    // Create 5-band equalizer filters
    eqFilters = [
        { filter: audioContext.createBiquadFilter(), freq: 60, label: '60Hz' },
        { filter: audioContext.createBiquadFilter(), freq: 250, label: '250Hz' },
        { filter: audioContext.createBiquadFilter(), freq: 1000, label: '1kHz' },
        { filter: audioContext.createBiquadFilter(), freq: 4000, label: '4kHz' },
        { filter: audioContext.createBiquadFilter(), freq: 16000, label: '16kHz' },
    ];

    // Configure and connect filters
    eqFilters.forEach((band, index) => {
        band.filter.type = 'peaking';
        band.filter.frequency.value = band.freq;
        band.filter.Q.value = 1; // Quality factor
        band.filter.gain.value = 0; // Start at 0 dB

        if (index === 0) {
            source.connect(band.filter);
        } else {
            eqFilters[index - 1].filter.connect(band.filter);
        }
    });

    // Connect last filter to gain node
    eqFilters[eqFilters.length - 1].filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
}

// Resume audio context (required by modern browsers)
async function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

// Load song
function loadSong(index) {
    const song = songs[index];
    audio.src = song.src;
    songTitle.textContent = song.title;
    artist.textContent = song.artist;
    if (song.art) {
        albumArt.src = song.art;
        albumArt.style.display = 'block';
    } else {
        albumArt.style.display = 'none';
    }
    updateActiveSong();
}

// Update active song in playlist
function updateActiveSong() {
    const lis = songList.querySelectorAll('li');
    lis.forEach((li, index) => {
        li.classList.toggle('active', index === currentSongIndex);
    });
}

// Play/pause
async function togglePlayPause() {
    await resumeAudioContext();
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸️';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    }
}

// Next song
async function nextSong() {
    await resumeAudioContext();
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
    playPauseBtn.textContent = '⏸️';
}

// Previous song
async function prevSong() {
    await resumeAudioContext();
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
    playPauseBtn.textContent = '⏸️';
}

// Update progress bar
function updateProgress() {
    const { currentTime, duration } = audio;
    progressBar.value = (currentTime / duration) * 100 || 0;
    currentTimeSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = formatTime(duration);
}

// Seek
function seek(e) {
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
}

// Format time
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Volume control
async function setVolume() {
    await resumeAudioContext();
    const volumeValue = parseFloat(volumeSlider.value);
    audio.volume = volumeValue;

    // Update volume display
    const volumePercent = Math.round(volumeValue * 100);
    document.getElementById('volume-value').textContent = volumePercent + '%';

    // Only set gainNode if audio context is running
    if (audioContext && audioContext.state === 'running') {
        gainNode.gain.value = volumeValue;
    }
}

// Speed control
function setSpeed() {
    const speed = parseFloat(speedSlider.value);
    audio.playbackRate = speed;
    speedValue.textContent = speed.toFixed(2) + 'x';
}

// Equalizer controls
function setEQ(index) {
    eqFilters[index].filter.gain.value = eqSliders[index].value;
}

// Update favourites list
function updateFavourites() {
    const favouriteList = document.getElementById('favourite-list');
    favouriteList.innerHTML = '';
    favourites.forEach(index => {
        const song = songs[index];
        const li = document.createElement('li');
        li.textContent = `${song.title} - ${song.artist}`;
        li.addEventListener('click', async () => {
            await resumeAudioContext();
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audio.play();
            playPauseBtn.textContent = '⏸️';
            switchTab('home');
        });
        favouriteList.appendChild(li);
    });
}

// Toggle favourite
function toggleFavourite(index) {
    const songIndex = favourites.indexOf(index);
    if (songIndex > -1) {
        favourites.splice(songIndex, 1);
    } else {
        favourites.push(index);
    }
    updateFavourites();
}

// Tab switching
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Create playlist
function createPlaylist() {
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        const songDiv = document.createElement('div');
        songDiv.textContent = `${song.title} - ${song.artist}`;
        songDiv.style.flex = '1';
        const favBtn = document.createElement('button');
        favBtn.textContent = favourites.includes(index) ? '❤️' : '🤍';
        favBtn.style.background = 'none';
        favBtn.style.border = 'none';
        favBtn.style.color = 'white';
        favBtn.style.cursor = 'pointer';
        favBtn.style.fontSize = '16px';
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavourite(index);
            favBtn.textContent = favourites.includes(index) ? '❤️' : '🤍';
        });
        li.appendChild(songDiv);
        li.appendChild(favBtn);
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.addEventListener('click', async () => {
            await resumeAudioContext();
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audio.play();
            playPauseBtn.textContent = '⏸️';
            switchTab('home');
        });
        songList.appendChild(li);
    });
}

// Event listeners
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', nextSong);
progressBar.addEventListener('input', seek);
volumeSlider.addEventListener('input', setVolume);
speedSlider.addEventListener('input', setSpeed);

// Equalizer event listeners
eqSliders.forEach((slider, index) => {
    slider.addEventListener('input', () => setEQ(index));
});

// Nav event listeners
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
    });
});

// Initialize
createPlaylist();
updateFavourites();
loadSong(currentSongIndex);
initAudioContext();
setSpeed();
setVolume(); // Initialize volume display
playPauseBtn.textContent = '▶️'; // Initialize play button