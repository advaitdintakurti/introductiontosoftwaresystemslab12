const BASE_URL = "http://localhost:8000";

let score = 0;
let highScore = 0;
let currentQuestion = null;
let gameOver = false;
let attemptHistory = [];
let seenQuestionIds = [];
let currentQuestionIndex = -1;

// Remove local questions array - we'll use the backend API

// Get DOM elements
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

async function loadHighScore() {
  try {
    // Try to get high score from backend first
    try {
      const res = await fetch(`${BASE_URL}/quiz/highscore`);
      const data = await res.json();
      highScore = data.high_score;
    } catch (apiError) {
      // Fallback to localStorage if API is unavailable
      console.warn("Backend unavailable, using localStorage for high score");
      const storedHighScore = localStorage.getItem('bashQuizHighScore');
      highScore = storedHighScore ? parseInt(storedHighScore) : 0;
    }
    updateScoreDisplay();
  } catch (error) {
    console.error("Error loading high score:", error);
    feedback.textContent = "Failed to load high score.";
  }
}

// Add a shuffle function to randomize option order
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadQuestion() {
  if (gameOver) return;

  try {
    // Always get questions from the backend API
    let data;
    try {
      const url = currentQuestion 
        ? `${BASE_URL}/quiz/question?previous_id=${currentQuestion.id}` 
        : `${BASE_URL}/quiz/question`;
      
      const res = await fetch(url);
      data = await res.json();
      
      // Handle key differences between backend and frontend
      // Backend uses "correct" while frontend expects "correct_answer"
      if (data.correct && !data.correct_answer) {
        data.correct_answer = data.correct;
      }
    } catch (apiError) {
      console.error("Backend API unavailable:", apiError);
      feedback.textContent = "Backend server unavailable. Please try again later.";
      return;
    }
    
    // Check if we've seen all questions - use total_questions from backend if available
    const totalQuestions = data.total_questions || 5;
    if (seenQuestionIds.includes(data.id) && seenQuestionIds.length >= totalQuestions) {
      feedback.textContent = "You've answered all available questions!";
      gameOver = true;
      form.innerHTML = "";
      resetBtn.classList.remove("hidden");
      return;
    }
    
    seenQuestionIds.push(data.id);
    
    // Shuffle the options to randomize correct answer position
    const shuffledOptions = shuffleArray(data.options);
    
    // Save both original and shuffled data
    currentQuestion = {
      ...data,
      shuffledOptions: shuffledOptions
    };

    questionDiv.textContent = data.text;

    form.innerHTML = shuffledOptions.map(option => `
      <label>
        <input type="radio" name="answer" value="${option}" required>
        ${option}
      </label><br/>
    `).join("") + `<button type="submit">Submit</button>`;

    form.dataset.id = data.id;
    feedback.textContent = "";
  } catch (error) {
    console.error("Error loading question:", error);
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
    // Send answer to backend API
    let data;
    try {
      const res = await fetch(`${BASE_URL}/quiz/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          answer: answer,
          score: score
        })
      });
      data = await res.json();
    } catch (apiError) {
      console.error("Backend API unavailable:", apiError);
      feedback.textContent = "Backend server unavailable. Please try again later.";
      return;
    }

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
      // Also update localStorage as backup
      localStorage.setItem('bashQuizHighScore', highScore.toString());
      updateScoreDisplay();
      feedback.textContent = "✅ Correct!";
      await loadQuestion();
    } else {
      feedback.textContent = `❌ Incorrect. Correct answer: ${data.correct_answer}. Game Over.`;
      gameOver = true;
      form.innerHTML = "";
      resetBtn.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error processing answer:", error);
    feedback.textContent = "Error processing answer.";
  }
});

resetBtn.addEventListener("click", async () => {
  try {
    // Try to reset with backend first
    try {
      await fetch(`${BASE_URL}/quiz/reset`, {
        method: "POST"
      });
    } catch (apiError) {
      console.warn("Backend reset endpoint unavailable");
    }
    
    score = 0;
    gameOver = false;
    attemptHistory = [];
    seenQuestionIds = [];
    currentQuestionIndex = -1;
    updateScoreDisplay();
    updateAttempts();
    resetBtn.classList.add("hidden");
    await loadHighScore();
    loadQuestion();
  } catch (error) {
    console.error("Error resetting quiz:", error);
    feedback.textContent = "Error resetting quiz. Please try again.";
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHighScore();
    loadQuestion();
  } catch (error) {
    console.error("Error initializing quiz:", error);
    feedback.textContent = "Failed to initialize quiz.";
  }
});
