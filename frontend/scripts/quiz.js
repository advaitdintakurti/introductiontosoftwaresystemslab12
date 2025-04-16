const BASE_URL = "http://localhost:8000";

let score = 0;
let highScore = 0;
let currentQuestion = null;
let gameOver = false;
let attemptHistory = [];
let seenQuestionIds = [];
let currentQuestionIndex = -1;

// Local Bash quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: "Which command is used to list files in a directory?",
    options: ["ls", "cd", "rm", "pwd"],
    correct_answer: "ls"
  },
  {
    id: 2,
    text: "What command would you use to print the current working directory?",
    options: ["pwd", "cd", "dir", "path"],
    correct_answer: "pwd"
  },
  {
    id: 3,
    text: "Which symbol redirects output to a file, overwriting previous content?",
    options: [">", ">>", "|", "<"],
    correct_answer: ">"
  },
  {
    id: 4,
    text: "What command is used to create a new directory?",
    options: ["mkdir", "touch", "mk", "md"],
    correct_answer: "mkdir"
  },
  {
    id: 5,
    text: "Which command is used to find text in files?",
    options: ["grep", "find", "locate", "search"],
    correct_answer: "grep"
  },
  {
    id: 6,
    text: "How do you make a shell script executable?",
    options: ["chmod +x filename", "chmod +r filename", "exec filename", "run filename"],
    correct_answer: "chmod +x filename"
  },
  {
    id: 7,
    text: "What command shows running processes?",
    options: ["ps", "processes", "top", "proc"],
    correct_answer: "ps"
  },
  {
    id: 8,
    text: "What does the command 'cat' do?",
    options: ["Display file content", "Run a program", "Create directories", "List files"],
    correct_answer: "Display file content"
  },
  {
    id: 9,
    text: "Which command is used to remove a file?",
    options: ["rm", "del", "remove", "erase"],
    correct_answer: "rm"
  },
  {
    id: 10,
    text: "How do you display the first 10 lines of a file?",
    options: ["head -10", "top -10", "first 10", "start -10"],
    correct_answer: "head -10"
  }
];

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
    // Use localStorage instead of API
    const storedHighScore = localStorage.getItem('bashQuizHighScore');
    highScore = storedHighScore ? parseInt(storedHighScore) : 0;
    updateScoreDisplay();
  } catch (error) {
    console.error("Error loading high score:", error);
    feedback.textContent = "Failed to load high score.";
  }
}

async function loadQuestion() {
  if (gameOver) return;

  try {
    // Get next question from our local question bank
    currentQuestionIndex = (currentQuestionIndex + 1) % QUIZ_QUESTIONS.length;
    const data = QUIZ_QUESTIONS[currentQuestionIndex];
    
    // Check if we've seen all questions
    if (seenQuestionIds.includes(data.id) && seenQuestionIds.length >= QUIZ_QUESTIONS.length) {
      feedback.textContent = "You've answered all available questions!";
      gameOver = true;
      form.innerHTML = "";
      resetBtn.classList.remove("hidden");
      return;
    }
    
    seenQuestionIds.push(data.id);
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
    // Process answer locally
    const question = QUIZ_QUESTIONS.find(q => q.id === id);
    const isCorrect = question && question.correct_answer === answer;
    
    if (!question) {
      feedback.textContent = "Question not found";
      return;
    }
    
    // Update score if correct
    if (isCorrect) {
      score += 10;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('bashQuizHighScore', highScore.toString());
      }
    }

    // Prepare response data similar to what the API would return
    const data = {
      is_correct: isCorrect,
      score: score,
      high_score: highScore,
      correct_answer: question.correct_answer
    };

    attemptHistory.push({
      question: currentQuestion.text,
      answer,
      result: data.is_correct ? "✅ Correct" : `❌ Wrong (Correct: ${data.correct_answer})`
    });

    updateAttempts();

    if (data.is_correct) {
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
