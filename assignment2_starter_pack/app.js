const API_URL = "http://localhost:3000/api/v1/tunes";

const keyMap = {
  // white keys
  a: "c4",
  s: "d4",
  d: "e4",
  f: "f4",
  g: "g4",
  h: "a4",
  j: "b4",
  k: "c5",
  l: "d5",
  æ: "e5",

  // black keys
  w: "c#4",
  e: "d#4",
  t: "f#4",
  y: "g#4",
  u: "bb4",
  o: "c#5",
  p: "d#5",
};

let tunes = [];
let recording = [];
let isRecording = false;
let startTime = 0;

const fetchAndPopulateTunes = async () => {
  //Perform a GET request to the url
  try {
    const response = await axios(API_URL);
    console.log("Success: ", response.data);
    tunes = response.data;
    populateSelector();
  } catch (error) {
    console.log(error);
  }
  // This code is always executed, independent of whether the request succeeds or fails.
};

const createTune = async () => {
  const recordName = document.getElementById("recordName").value;

  //Perform a POST request to the url
  try {
    const response = await axios.post(API_URL, {
      name: recordName,
      tune: recording,
    });
    //When successful, print the received data
    console.log("Successfully written: ", response.data);
    fetchAndPopulateTunes();
  } catch (error) {
    //When unsuccessful, print the error.
    console.log(error);
  }
  // This code is always executed, independent of whether the request succeeds or fails.
};

const populateSelector = () => {
  const selector = document.getElementById("tunesDrop");
  selector.innerHTML = "";

  // Here we use forEach instead of map as we are not retuning anything from our loop
  tunes.forEach((tune, index) => {
    const currentOpt = document.createElement("option");
    currentOpt.value = index;
    currentOpt.textContent = tune.name;
    selector.appendChild(currentOpt);
  });
};

const synth = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

document.getElementById("tunebtn").addEventListener("click", (e) => {
  const tune = tunes[document.getElementById("tunesDrop").value].tune;
  const now = Tone.now();

  tune.forEach((tune) => {
    // Here we use object destructuring to extract attributes from tune.
    // It is not neccessary, but can make for cleaner code.
    const { note, duration, timing } = tune;
    synth.triggerAttackRelease(note, duration, now + timing);
    // This is the same as using the line below, without desctructuring
    // synth.triggerAttackRelease(tune.note, tune.duration, now + tune.timing)
  });
});

document.getElementById("recordbtn").addEventListener("click", (e) => {
  const recordBtn = document.getElementById("recordbtn");
  const stopBtn = document.getElementById("stopbtn");
  recordBtn.disabled = true;
  stopBtn.disabled = false;
  document.activeElement.blur();

  recording = [];
  startTime = Date.now();
  isRecording = true;
});

document.getElementById("stopbtn").addEventListener("click", (e) => {
  const recordBtn = document.getElementById("recordbtn");
  const stopBtn = document.getElementById("stopbtn");
  recordBtn.disabled = false;
  stopBtn.disabled = true;

  startTime = 0;
  isRecording = false;

  if (recording.length > 0) {
    createTune();
  }
});

document.addEventListener("keydown", (e) => {
  // No more spam when keys are held down
  if (e.repeat) {
    return;
  }

  if (e.key in keyMap && document.activeElement.id !== "recordName") {
    const tone = keyMap[e.key];
    if (isRecording) {
      const seconds = Date.now() - startTime;
      recording.push({ note: tone, duration: "8n", timing: seconds / 1000 });
    }

    const pianoKey = document.getElementById(tone);
    pianoKey.style.backgroundColor = "gray";

    synth.triggerAttackRelease(tone, "8n");

    setTimeout(() => (pianoKey.style.backgroundColor = ""), 200);
  }
});

const pianoKeyClick = (note) => {
  synth.triggerAttackRelease(note, "8n");

  if (isRecording) {
    const seconds = Date.now() - startTime;
    recording.push({ note, duration: "8n", timing: seconds / 1000 });
  }
};

fetchAndPopulateTunes();
