let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;

    sounds.ambient.play()
        .then(() => {
            sounds.ambient.pause();
            sounds.ambient.currentTime = 0;
            audioUnlocked = true;

            // NOW start real ambient sound
            sounds.ambient.play();
        })
        .catch(() => {});

    document.removeEventListener("click", unlockAudio);
}

document.addEventListener("click", unlockAudio);

// ------------------ STATE ------------------
let score = 0;
let health = 3;
let current = "q1";
let timeLeft = 60;
let timer;
let gameEnded = false;

// ------------------ SOUND ------------------
const sounds = {
    ambient: new Audio("sounds/ambient.mp3"),
    heartbeat: new Audio("sounds/heartbeat.mp3"),
    jumpscare: new Audio("sounds/jumpscare.mp3")
};

sounds.ambient.loop = true;
sounds.heartbeat.loop = true;

function startAmbient() {
    sounds.ambient.volume = 0.3;
    sounds.ambient.play();
}

// ------------------ BACKGROUNDS ------------------
const backgrounds = {
    q1: "https://images.unsplash.com/photo-1509248961158-e54f6934749c",
    q2: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    q3: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    q4: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    q5: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e",
    q6: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    q7: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    q8: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913",
    q9: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    q10: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
};

// ------------------ GAME DATA ------------------
const game = {
    q1: {
        text: "A whisper: Which planet is the Red Planet?",
        choices: [
            { text: "Mars", effect: () => score++, next: "q2" },
            { text: "Jupiter", effect: () => health--, next: "q2" }
        ]
    },

    q2: {
        text: "The door locks. What gas do humans need?",
        choices: [
            { text: "Oxygen", effect: () => score++, next: "q3" },
            { text: "Carbon Dioxide", effect: () => health--, next: "q4" }
        ]
    },

    q3: {
        text: "Shadows move: Capital of France?",
        choices: [
            { text: "Paris", effect: () => score++, next: "q5" },
            { text: "Berlin", effect: () => health--, next: "q5" }
        ]
    },

    q4: {
        text: "Wrong path... 6 x 2?",
        choices: [
            { text: "12", effect: () => score++, next: "q5" },
            { text: "10", effect: () => health--, next: "q5" }
        ]
    },

    q5: {
        text: "The walls shift. Risk the dark door?",
        choices: [
            { text: "Yes", effect: () => { if (Math.random() < 0.5) health--; }, next: "q6" },
            { text: "No", effect: () => score++, next: "q6" }
        ]
    },

    q6: {
        text: "Largest ocean?",
        choices: [
            { text: "Pacific", effect: () => score++, next: "q7" },
            { text: "Atlantic", effect: () => health--, next: "q7" }
        ]
    },

    q7: {
        text: "Something follows: 9 x 3?",
        choices: [
            { text: "27", effect: () => score++, next: "q8" },
            { text: "21", effect: () => health--, next: "q9" }
        ]
    },

    q8: {
        text: "H2O is?",
        choices: [
            { text: "Water", effect: () => score++, next: "q10" },
            { text: "Hydrogen", effect: () => health--, next: "q10" }
        ]
    },

    q9: {
        text: "The Sun is?",
        choices: [
            { text: "Star", effect: () => score++, next: "q10" },
            { text: "Planet", effect: () => health--, next: "q10" }
        ]
    },

    q10: {
        text: "Final: 15 - 5?",
        choices: [
            { text: "10", effect: () => score++, next: "win" },
            { text: "12", effect: () => health--, next: "lose" }
        ]
    }
};

// ------------------ TIMER ------------------
function startTimer() {
    timer = setInterval(() => {
        if (gameEnded) return;

        timeLeft--;

        if (timeLeft <= 0) {
            current = "lose";
            endGame(false);
        }

        updateStats();
    }, 1000);
}

// ------------------ BACKGROUND TRANSITION ------------------
function changeBackground(url) {
    const fade = document.getElementById("fade");

    fade.style.opacity = 1;

    setTimeout(() => {
        document.body.style.backgroundImage = `url('${url}')`;
        fade.style.opacity = 0;
    }, 300);
}

// ------------------ EFFECTS ------------------
function triggerGlitch() {
    if (Math.random() < 0.3) {
        document.body.classList.add("glitch");
        setTimeout(() => document.body.classList.remove("glitch"), 200);
    }
}

function jumpscare() {
    if (Math.random() < 0.1) {
        sounds.jumpscare.play();

        let scare = document.createElement("div");
        scare.innerHTML = "😱";
        scare.style.position = "fixed";
        scare.style.top = "40%";
        scare.style.left = "45%";
        scare.style.fontSize = "100px";
        scare.style.zIndex = "999";

        document.body.appendChild(scare);
        setTimeout(() => scare.remove(), 400);
    }
}

// ------------------ RENDER ------------------
function render() {
    if (health <= 0) {
        current = "lose";
        endGame(false);
        return;
    }

    if (current === "win") {
        endGame(true);
        return;
    }

    if (backgrounds[current]) {
        changeBackground(backgrounds[current]);
    }

    let node = game[current];

    document.getElementById("story").innerText = node.text;

    let html = "";
    node.choices.forEach(choice => {
        html += `<button onclick="choose('${choice.text}')">${choice.text}</button>`;
    });

    document.getElementById("choices").innerHTML = html;

    updateStats();

    triggerGlitch();
    jumpscare();

    if (health === 1) {
        sounds.heartbeat.play();
        document.body.classList.add("danger");
    } else {
        sounds.heartbeat.pause();
        document.body.classList.remove("danger");
    }
}

// ------------------ CHOICE ------------------
function choose(choiceText) {
    let node = game[current];
    let choice = node.choices.find(c => c.text === choiceText);

    choice.effect();

    current = choice.next;
    render();
}

// ------------------ STATS ------------------
function updateStats() {
    document.getElementById("stats").innerText =
        `Score: ${score} | Health: ${health} | Time: ${timeLeft}s`;
}

// ------------------ END GAME ------------------
function endGame(win) {
    gameEnded = true;
    clearInterval(timer);

    sounds.ambient.pause();
    sounds.heartbeat.pause();

    document.getElementById("choices").innerHTML = "";

    document.getElementById("story").innerText =
        win
            ? (score >= 7 ? "🏆 You escaped!" : "😐 You barely survived...")
            : "💀 The house consumes you...";
}

// ------------------ START ------------------
startAmbient();
startTimer();
render();