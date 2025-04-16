const BASE_URL = "http://localhost:8000";

let score = 0;
let highScore = 0;
let currentQuestion = null;
let gameOver = false;
let attemptHistory = [];

const scoreDisplay = document.getElementById("scoreDisplay");
const questionDiv = document.getElementById("question");
const form = document.getElementById("answerForm");
const feedback = document.getElementById("feedback");
const resetBtn = document.getElementById("resetBtn");
const attemptList = document.getElementById("attemptList");
const attemptCount = document.getElementById("attemptCount");
const searchInput = document.getElementById("search");

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function updateAttempts() {
  const search = searchInput.value.toLowerCase();
  const filtered = attemptHistory.filter(a =>
    a.question.toLowerCase().includes(search)
  );

  attemptList.innerHTML = filtered.map(a => `
    <div>
      <strong>${a.question}</strong><br/>
      Your answer: ${a.answer} — ${a.result}
    </div>
  `).join("");

  attemptCount.textContent = `Total attempts: ${filtered.length}`;
}

searchInput.addEventListener("input", updateAttempts);
// how is life ?
async function loadHighScore() {
  try {
    const res = await fetch(`${BASE_URL}/quiz/highscore`);
    const data = await res.json();
    highScore = data.high_score;
    updateScoreDisplay();
  } catch {
    feedback.textContent = "Failed to load high score.";
  }
}

async function loadQuestion() {
  if (gameOver) return;

  try {
    const res = await fetch(`${BASE_URL}/quiz/question`);
    const data = await res.json();
    currentQuestion = data;

    questionDiv.textContent = data.text;

    form.innerHTML = data.options.map(option => `
      <label>
        <input type="radio" name="answer" value="${option}" required>
        ${option}
      </label><br/>
    `).join("") + `<button type="submit">Submit</button>`;

    form.dataset.id = data.id;
    feedback.textContent = "";
  } catch {
    feedback.textContent = "Failed to load question.";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (gameOver) return;

  const selected = form.querySelector("input[name=answer]:checked");
  if (!selected) return;

  const answer = selected.value;
  const id = parseInt(form.dataset.id);

  try {
    const res = await fetch(`${BASE_URL}/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, answer, score })
    });

    const data = await res.json();

    if (data.error) {
      feedback.textContent = data.error;
      return;
    }

    attemptHistory.push({
      question: currentQuestion.text,
      answer,
      result: data.is_correct ? "✅ Correct" : `❌ Wrong (Correct: ${data.correct_answer})`
    });

    updateAttempts();

    if (data.is_correct) {
      score = data.score;
      highScore = data.high_score;
      updateScoreDisplay();
      feedback.textContent = "✅ Correct!";
      await loadQuestion();
    } else {
      feedback.textContent = `❌ Incorrect. Correct answer: ${data.correct_answer}. Game Over.`;
      gameOver = true;
      form.innerHTML = "";
      resetBtn.classList.remove("hidden");
    }
  } catch {
    feedback.textContent = "Error submitting answer.";
  }
});

resetBtn.addEventListener("click", () => {
  score = 0;
  gameOver = false;
  attemptHistory = [];
  updateScoreDisplay();
  updateAttempts();
  resetBtn.classList.add("hidden");
  loadQuestion();
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadHighScore();
  loadQuestion();
});
