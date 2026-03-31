const startPill = document.getElementById('start-mirror');
const video = document.getElementById('camera-feed');
const streamImage = document.getElementById('stream-image');
const mirrorGlass = document.querySelector('.mirror-glass');
const mirrorFrame = document.querySelector('.mirror-frame');
const complimentWidget = document.getElementById('compliment-container');
const complimentText = document.getElementById('compliment-text');
const adminPanel = document.getElementById('admin-panel');
const adminToggle = document.getElementById('admin-toggle');
const feedUrlInput = document.getElementById('feed-url');
const feedTypeSelect = document.getElementById('feed-type');
const saveFeedBtn = document.getElementById('save-feed');
const testFeedBtn = document.getElementById('test-feed');
const closeAdminBtn = document.getElementById('close-admin');
const adminStatus = document.getElementById('admin-status');
const feedStatus = document.getElementById('feed-status');

let stream = null;
let isComplimentActive = false;
let isManualLightOverride = false; // Tracks if user manually set light
let autoLightThreshold = 45;
let isStreamingMode = false; // Whether using external feed
let adminFeedUrl = localStorage.getItem('adminFeedUrl') || '';
let adminFeedType = localStorage.getItem('adminFeedType') || 'camera';
let streamRefreshInterval = null;
const hiddenCanvas = document.createElement('canvas');
const ctx = hiddenCanvas.getContext('2d', { willReadFrequently: true });

const compliments = [
    "look who's beautiful today ❤️",
    "you are so loved 💖",
    "that smile is my favorite thing ✨",
    "your heart is made of gold 💕",
    "shining brighter than ever ❤️",
    "absolutely radiant today 💖",
    "you are a masterpiece ✨",
    "your presence is a gift ❤️",
    "spread love everywhere you go 💕",
    "you deserve all the happiness 💖",
    "be your own kind of beautiful ✨",
    "you are enough, always ❤️",
    "grateful for you 💖",
    "your soul is beautiful 💕",
    "sending you love and light ✨",
    "keep being your amazing self ❤️"
];

// Load admin settings on page load
function loadAdminSettings() {
    if (adminFeedUrl && adminFeedType !== 'camera') {
        feedUrlInput.value = adminFeedUrl;
        feedTypeSelect.value = adminFeedType;
    }
}

// Admin Panel Functions
function openAdminPanel() {
    adminPanel.style.display = 'flex';
    loadAdminSettings();
}

function closeAdminPanelUI() {
    adminPanel.style.display = 'none';
}

function saveFeedConfig() {
    const url = feedUrlInput.value.trim();
    const type = feedTypeSelect.value;
    
    if (!url && type !== 'camera') {
        showAdminStatus('Please enter a valid URL', 'error');
        return;
    }
    
    localStorage.setItem('adminFeedUrl', url);
    localStorage.setItem('adminFeedType', type);
    adminFeedUrl = url;
    adminFeedType = type;
    showAdminStatus('✓ Configuration saved successfully!', 'success');
}

function showAdminStatus(message, type = 'info') {
    adminStatus.textContent = message;
    adminStatus.className = `admin-status admin-status-${type}`;
    adminStatus.style.display = 'block';
    if (type !== 'error') {
        setTimeout(() => {
            adminStatus.style.display = 'none';
        }, 3000);
    }
}

function testFeed() {
    if (!adminFeedUrl && adminFeedType !== 'camera') {
        showAdminStatus('No feed URL configured', 'error');
        return;
    }
    showAdminStatus('Testing feed...', 'info');
    // Feed will be tested when mirror is opened
}

// Camera Logic
async function startCamera() {
    try {
        // Check if admin has configured a feed
        if (adminFeedUrl && adminFeedType !== 'camera') {
            isStreamingMode = true;
            startStreamingFeed();
        } else {
            // Use local camera
            isStreamingMode = false;
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            video.srcObject = stream;
            video.classList.add('active');
            streamImage.style.display = 'none';
            startEngine();
        }
    } catch (err) {
        console.error("Camera access denied:", err);
        showFeedStatus('Camera access denied', 'error');
    }
}

// Streaming Feed Logic
function startStreamingFeed() {
    video.style.display = 'none';
    streamImage.style.display = 'block';
    
    if (adminFeedType === 'url' || adminFeedType === 'rtsp') {
        // For MJPEG or image stream URLs
        const refreshRate = 300; // Update every 300ms
        streamRefreshInterval = setInterval(() => {
            streamImage.src = adminFeedUrl + '?t=' + Date.now();
        }, refreshRate);
        streamImage.src = adminFeedUrl;
        showFeedStatus('📡 Connected to mirror feed', 'success');
    }
    
    startEngine();
}

function showFeedStatus(message, type = 'info') {
    feedStatus.textContent = message;
    feedStatus.className = `feed-status feed-status-${type}`;
    feedStatus.style.opacity = '1';
    if (type === 'success') {
        setTimeout(() => {
            feedStatus.style.opacity = '0';
        }, 3000);
    }
}

function stopCamera() {
    if (isStreamingMode) {
        if (streamRefreshInterval) {
            clearInterval(streamRefreshInterval);
        }
        streamImage.style.display = 'none';
        video.style.display = 'block';
        isStreamingMode = false;
    } else {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            video.classList.remove('active');
        }
    }
    hideCompliment();
}

// Fully Automated Engine: Light Analysis & Quote Rotator
function startEngine() {
    if (!stream && !isStreamingMode) return;

    // 1. Light Detection (Analyze Frame every 1s for instant response)
    setInterval(() => {
        if (isStreamingMode) return; // Skip brightness detection for streams
        if (!stream || !stream.active) return;

        if (hiddenCanvas.width !== video.videoWidth || hiddenCanvas.height !== video.videoHeight) {
            hiddenCanvas.width = video.videoWidth || 100;
            hiddenCanvas.height = video.videoHeight || 100;
        }

        ctx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
        try {
            const imageData = ctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            const data = imageData.data;
            let brightness = 0;
            for (let i = 0; i < data.length; i += 16) {
                brightness += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            }
            const avgBrightness = brightness / (hiddenCanvas.width * hiddenCanvas.height / 4);
            
            // ONLY APPLY AUTO-LIGHT IF USER HASN'T MANUALLY SET IT
            if (!isManualLightOverride) {
                if (avgBrightness < autoLightThreshold) {
                    mirrorGlass.classList.add('light-active');
                    mirrorFrame.classList.add('active-glow');
                    document.getElementById('manual-ring-light').classList.add('active');
                } else {
                    mirrorGlass.classList.remove('light-active');
                    mirrorFrame.classList.remove('active-glow');
                    document.getElementById('manual-ring-light').classList.remove('active');
                }
            }
        } catch (e) { }
    }, 1000);

    // 2. Auto Quote Rotator
    setInterval(() => {
        if (!isStreamingMode && (!stream || !stream.active)) return;
        showCompliment();
    }, 12000);

    setTimeout(showCompliment, 1000);
}

function showCompliment() {
    if (isComplimentActive) return;

    isComplimentActive = true;
    const randomIdx = Math.floor(Math.random() * compliments.length);
    complimentText.textContent = compliments[randomIdx];
    complimentWidget.classList.add('active');

    setTimeout(hideCompliment, 8000);
}

function hideCompliment() {
    complimentWidget.classList.remove('active');
    isComplimentActive = false;
}

// Removed manual toggle button logic

// Splash Screen Logic
const landingScreen = document.getElementById('landing-screen');

startPill.addEventListener('click', () => {
    // Show mirror and start camera
    mirrorFrame.classList.add('active');
    document.getElementById('mirror-controls').style.display = 'flex';
    document.getElementById('close-mirror').style.display = 'flex';
    landingScreen.style.opacity = '0';
    landingScreen.style.pointerEvents = 'none';
    setTimeout(() => {
        landingScreen.style.display = 'none';
    }, 500);
    
    startCamera();
});

document.getElementById('close-mirror').addEventListener('click', () => {
    // Hide mirror and stop camera
    mirrorFrame.classList.remove('active');
    document.getElementById('mirror-controls').style.display = 'none';
    landingScreen.style.display = 'flex';
    setTimeout(() => {
        landingScreen.style.opacity = '1';
        landingScreen.style.pointerEvents = 'auto';
    }, 10);
    
    stopCamera();
});

document.getElementById('manual-ring-light').addEventListener('click', () => {
    // Stickly Manual Toggle Override
    isManualLightOverride = true; 
    const btn = document.getElementById('manual-ring-light');
    
    if (mirrorGlass.classList.contains('light-active')) {
        // TURN OFF AND KEEP OFF
        mirrorGlass.classList.remove('light-active');
        mirrorFrame.classList.remove('active-glow');
        btn.classList.remove('active');
        console.log("Manual Override: Light OFF");
    } else {
        // TURN ON AND KEEP ON
        mirrorGlass.classList.add('light-active');
        mirrorFrame.classList.add('active-glow');
        btn.classList.add('active');
        mirrorGlass.style.setProperty('--light-opacity', '0.6'); 
        console.log("Manual Override: Light ON");
    }
});

// Admin Panel Event Listeners
adminToggle.addEventListener('click', openAdminPanel);
closeAdminBtn.addEventListener('click', closeAdminPanelUI);
saveFeedBtn.addEventListener('click', saveFeedConfig);
testFeedBtn.addEventListener('click', testFeed);

// Load settings on page load
loadAdminSettings();
