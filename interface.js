let jsonData = null;

const dropdown = new Choices('#title-dropdown', {
    searchEnabled: true,
    removeItemButton: true,
    searchPlaceholderValue: "Type to search...",
    placeholderValue: "Choose a title"
});

fetch('playlist_metadata.json')
    .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
    })
    .then(data => {
    // Save JSON data to a variable
    jsonData = data;

    const titles = data.map(item => ({
        value: item.cleaned_title,
        label: item.cleaned_title
    }));
    dropdown.setChoices(titles, 'value', 'label', true);
    Initialize();
    // Log the data to the console
    console.log('JSON Data:', jsonData);
    })
    .catch(error => {
    console.error('Error fetching JSON data:', error);
    });

let currentVideo = null;
let playDurations = [1, 2, 5, 8, 15, 25]; // Durations in seconds
let currentPlayCount = 0;

const audioPlayer = document.getElementById('audio-player');
const currentDurationElement = document.getElementById('current-duration');
const progressBar = document.getElementById('progress-bar');
const canvas = document.getElementById('waveform-canvas');
const canvasContext = canvas.getContext('2d');

const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const popupMessage = document.getElementById("popup-message");
const newGame = document.getElementById("new-game-popup");


// Set canvas dimensions
const waveformContainer = document.getElementById('waveform-container');
canvas.width = waveformContainer.offsetWidth;
canvas.height = waveformContainer.offsetHeight;

// Initialize Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const source = audioContext.createMediaElementSource(audioPlayer);
source.connect(analyser);
analyser.connect(audioContext.destination);

// Draw waveform
function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    analyser.getByteTimeDomainData(dataArray);

    canvasContext.fillStyle = '#f3f3f3';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#007BFF';
    canvasContext.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
        canvasContext.moveTo(x, y);
    } else {
        canvasContext.lineTo(x, y);
    }

    x += sliceWidth;
    }

    canvasContext.lineTo(canvas.width, canvas.height / 2);
    canvasContext.stroke();
}

drawWaveform();

// Play a random audio file for the current increment duration
document.getElementById('play-button').addEventListener('click', () => {
audioContext.resume()
    if (!currentVideo) {
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    console.log(randomIndex);
    currentVideo = jsonData[randomIndex];
    audioPlayer.src = currentVideo.file_path;
    }
    console.log(audioPlayer.src)

    const duration = playDurations[Math.min(currentPlayCount, playDurations.length - 1)];
    audioPlayer.play().then(() => {
    console.log('Audio is playing.');
    }).catch(error => {
    console.error('Error playing audio:', error);
    });
    setTimeout(() => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0; // Reset to the beginning
    }, duration * 1000);
});

// Increment the playback duration
document.getElementById('increment-button').addEventListener('click', () => {
    if (currentPlayCount < playDurations.length - 1) {
        currentPlayCount++;
    } else {
        showPopup("Fake Fan",  false);
    }
    const duration = playDurations[currentPlayCount];
    currentDurationElement.textContent = duration;

    // Update progress bar width
    const progressPercentage = ((duration + 1) / playDurations[playDurations.length-1]) * 100;
    progressBar.style.width = `${progressPercentage}%`;
});

// Add event listener to the submit button
document.getElementById('submit-button').addEventListener('click', () => {
    const userInput = dropdown.getValue(true); // Get the selected/typed value
    const resultDiv = document.getElementById('result');

    // Check if the user input matches any cleaned title
    if (currentVideo.cleaned_title == userInput) {
        resultDiv.textContent = 'Correct!';
        resultDiv.className = 'success';
        showPopup(`Real Fan! <br><br> Guessed it in ${playDurations[currentPlayCount]} seconds`, true);
    } else {
        resultDiv.textContent = 'Incorrect. Try again!';
        resultDiv.className = 'error';
        document.getElementById('increment-button').click();
    }
});

function Initialize() {
    currentPlayCount = 0;
    progressBar.style.width = `${(playDurations[0] / playDurations[playDurations.length-1]) * 100}%`;
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    currentVideo = jsonData[randomIndex];
    audioPlayer.src = currentVideo.file_path;
    currentDurationElement.innerText = playDurations[0];
}



console.log(newGame);

function showPopup(message, isSuccess) {
    popupMessage.innerHTML = message + " <br> " + currentVideo.video_url;
    popupMessage.className = isSuccess ? "success" : "error";
    popup.style.display = "block";
    overlay.style.display = "block";

    // Trigger confetti for success
    if (isSuccess) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }

  console.log(newGame);
  // Function to close the popup
  newGame.addEventListener("click", () => {
    popup.style.display = "none";
    overlay.style.display = "none";
    Initialize();
  });