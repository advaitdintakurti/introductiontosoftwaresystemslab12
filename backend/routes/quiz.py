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

game_state = {"high_score": 0}

@router.get("/question")
async def get_question(previous_id: int = None):
    # Get a random question, but try to avoid returning the same question as before
    if previous_id is not None and len(questions) > 1:
        available_questions = [q for q in questions if q["id"] != previous_id]
        question = random.choice(available_questions)
    else:
        question = random.choice(questions)
        
    return {
        "id": question["id"],
        "text": question["text"],
        "options": question["options"],
        "total_questions": len(questions)  # Add total_questions count for client-side tracking
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

# Add reset endpoint to match frontend's expectations
@router.post("/reset")
async def reset_quiz():
    # Reset user's session but keep high score intact
    return {"status": "Quiz reset successfully"}
