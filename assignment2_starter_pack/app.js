// Constants for API and key mappings
const API_URL = "http://localhost:3000/api/v1/tunes";
const KEY_MAP = {
  a: "c4", s: "d4", d: "e4", f: "f4", g: "g4", h: "a4", j: "b4", k: "c5", l: "d5", æ: "e5", // White keys
  w: "c#4", e: "d#4", t: "f#4", y: "g#4", u: "bb4", o: "c#5", p: "d#5" // Black keys
};

// State variables
let tunes = [], recording = [], isRecording = false, startTime = 0;

// Fetch and display tunes from API
async function fetchAndDisplayTunes() {
  try {
    const { data } = await axios.get(API_URL);
    console.log("Fetched Tunes: ", data);
    tunes = data;
    updateTuneSelector();
  } catch (error) {
    console.error("Fetching Error: ", error);
  }
}

// Update tune selector dropdown
function updateTuneSelector() {
  const selector = document.getElementById("tunesDrop");
  selector.innerHTML = tunes.map((tune, index) => `<option value="${index}">${tune.name}</option>`).join('');
}

// Record and create a new tune
async function recordAndCreateTune() {
  const tuneName = document.getElementById("recordName").value;
  try {
    const { data } = await axios.post(API_URL, { name: tuneName, tune: recording });
    console.log("Tune Created: ", data);
    fetchAndDisplayTunes();
  } catch (error) {
    console.error("Creation Error: ", error);
  }
}

// Event listeners for buttons and keys
function setupEventListeners() {
  document.getElementById("tunebtn").addEventListener("click", playSelectedTune);
  document.getElementById("recordbtn").addEventListener("click", startRecording);
  document.getElementById("stopbtn").addEventListener("click", stopRecording);
  document.addEventListener("keydown", handleKeydown);
}

// Play the selected tune
function playSelectedTune() {
  const selectedTune = tunes[document.getElementById("tunesDrop").value].tune;
  selectedTune.forEach(({ note, duration, timing }) => synth.triggerAttackRelease(note, duration, Tone.now() + timing));
}

// Start recording a new tune
function startRecording() {
  document.getElementById("recordbtn").disabled = true;
  document.getElementById("stopbtn").disabled = false;
  recording = [];
  startTime = Date.now();
  isRecording = true;
}

// Stop recording the tune
function stopRecording() {
  document.getElementById("recordbtn").disabled = false;
  document.getElementById("stopbtn").disabled = true;
  isRecording = false;
  if (recording.length) recordAndCreateTune();
}

// Handle keydown for recording and playing notes
function handleKeydown(e) {
  if (e.repeat || document.activeElement.id === "recordName" || !(e.key in KEY_MAP)) return;
  playAndRecord(KEY_MAP[e.key]);
}

// Function to handle piano key clicks, called from HTML
function pianoKeyClick(note) {
  playAndRecord(note);
}

// Play and record a note
function playAndRecord(note) {
  const pianoKey = document.getElementById(note);
  if (pianoKey) {
    pianoKey.style.backgroundColor = "gray";
    synth.triggerAttackRelease(note, "8n");
    setTimeout(() => pianoKey.style.backgroundColor = "", 200);
  }

  if (isRecording) {
    recording.push({ note, duration: "8n", timing: (Date.now() - startTime) / 1000 });
  }
}

// Initialize the application
function init() {
  fetchAndDisplayTunes();
  setupEventListeners();
}

// Tone.js Sampler for playing notes
const synth = new Tone.Sampler({ urls: { C4: "C4.mp3" }, release: 1, baseUrl: "https://tonejs.github.io/audio/salamander/" }).toDestination();

init(); // Start the application
