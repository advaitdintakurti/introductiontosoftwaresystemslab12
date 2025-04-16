from fastapi import APIRouter
import random

router = APIRouter(tags=["quiz"])

# I actually could have added this to a collection in mongodb
questions = [
    {
        "id": 1,
        "text": "What command lists directory contents?",
        "options": ["ls", "cd", "rm", "pwd"],
        "correct": "ls"
    },
    {
        "id": 2,
        "text": "Which command searches for text in files?",
        "options": ["find", "grep", "locate", "cat"],
        "correct": "grep"
    },
    {
        "id": 3,
        "text": "What changes file permissions?",
        "options": ["chmod", "chown", "mv", "cp"],
        "correct": "chmod"
    },
    {
        "id": 4,
        "text": "Which command displays the current directory?",
        "options": ["dir", "pwd", "path", "where"],
        "correct": "pwd"
    },
    {
        "id": 5,
        "text": "What removes a file?",
        "options": ["rm", "del", "erase", "unlink"],
        "correct": "rm"
    }
]

# Add session state to track asked questions
game_state = {
    "high_score": 0,
    "asked_questions": set()  # Track questions asked in current session
}

@router.get("/question")
async def get_question(previous_id: int = None):
    # If all questions have been asked, reset the tracking
    if len(game_state["asked_questions"]) >= len(questions):
        game_state["asked_questions"].clear()
    
    # Get available questions that haven't been asked yet
    available_questions = [q for q in questions if q["id"] not in game_state["asked_questions"]]
    
    # Select a random question from available ones
    question = random.choice(available_questions)
    
    # Add the question ID to asked questions
    game_state["asked_questions"].add(question["id"])
    
    return {
        "id": question["id"],
        "text": question["text"],
        "options": question["options"],
        "total_questions": len(questions)
    }

@router.post("/answer") 
async def submit_answer(data: dict):
    question_id = data.get("id")
    answer = data.get("answer")
    score = data.get("score", 0)

    question = next((q for q in questions if q["id"] == question_id), None)
    if not question:
        return {"error": "Invalid question ID"}

    is_correct = answer == question["correct"]
    if is_correct:
        score += 10
        if score > game_state["high_score"]:
            game_state["high_score"] = score

    return {
        "is_correct": is_correct,
        "correct_answer": question["correct"],  # Use consistent property name for frontend
        "score": score,
        "high_score": game_state["high_score"]
    }

@router.get("/highscore")
async def get_highscore():
    return {"high_score": game_state["high_score"]}

# Modify the reset endpoint to clear asked questions
@router.post("/reset")
async def reset_quiz():
    game_state["asked_questions"].clear()  # Clear asked questions on reset
    return {"status": "Quiz reset successfully"}
