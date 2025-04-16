from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
# Import routers from their respective modules in the 'routes' directory
from routes.items import router as items_router
from routes.analytics import router as analytics_router
from routes.quiz import router as quiz_router
# Fix 28: Import the users_router
from routes.users import router as users_router
# Import database initialization if needed globally (e.g., for startup events)
# from db import init_db # Example if you had startup logic

# Initialize the FastAPI application
app = FastAPI(
    title="Buggy App - Fixed API",
    description="The backend API for the multi-page application, now with fewer bugs!",
    version="1.0.1"
)

# Configure CORS (Cross-Origin Resource Sharing)
# Allows the frontend (running on a different origin, e.g., file:// or another port)
# to communicate with the backend API.
origins = [
    "http://localhost", # Add the origin of your frontend if served by a local server
    "http://localhost:8080", # Example if frontend runs on 8080
    "null", # Allow 'null' origin for local file:// access
    # Add any other origins if needed, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # List of origins allowed
    allow_credentials=True, # Allow cookies
    allow_methods=["*"], # Allow all methods (GET, POST, DELETE, etc.)
    allow_headers=["*"], # Allow all headers
)


# Include routers from the 'routes' modules
# Use prefixes to group related endpoints and tags for Swagger UI organization
app.include_router(items_router, prefix="/items", tags=["Items"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(quiz_router, prefix="/quiz", tags=["Quiz"])
# Fix 28: Include the users_router
app.include_router(users_router, prefix="/users", tags=["Users"])

# Define a root endpoint ('/') for a basic health check or welcome message
@app.get("/", tags=["Root"])
async def read_root():
    # Changed from the original '/home' which might conflict if serving static files
    return {"message": "Welcome to the Fixed Multi-Page FastAPI App Backend!"}

# Optional: Add startup/shutdown events if needed (e.g., initializing DB connection pool)
# @app.on_event("startup")
# async def startup_event():
#     print("Starting up...")
#     # Initialize database connection pool or other resources
#     init_db() # Example call

# @app.on_event("shutdown")
# async def shutdown_event():
#     print("Shutting down...")
#     # Clean up resources, close database connections


# The following block allows running the app directly using `python main.py`
# However, it's more common to run FastAPI apps using Uvicorn from the terminal:
# uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    print("Starting Uvicorn server on http://localhost:8000")
    # Use host="0.0.0.0" to make it accessible on the network, or "127.0.0.1" for local only
    uvicorn.run(app, host="127.0.0.1", port=8000)