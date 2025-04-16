from pydantic import BaseModel, Field
from typing import Optional # Optional can be used for fields that are not required

# Pydantic models define the structure and types of data for API requests/responses.
# FastAPI uses these for automatic data validation and documentation generation.

# Fix 29: Make Item inherit from Pydantic's BaseModel
class Item(BaseModel):
    # Fix 30: Change the type hint for name from int to str
    name: str = Field(..., min_length=1, max_length=100, description="The name of the item") # Added validation
    description: Optional[str] = Field(None, max_length=500, description="An optional description of the item") # Made description optional

    # Example of adding configuration or example data for documentation
    class Config:
        schema_extra = {
            "example": {
                "name": "My Awesome Item",
                "description": "This item is truly awesome and does amazing things."
            }
        }

# User model also inherits from BaseModel
class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="The user's unique username")
    bio: Optional[str] = Field(None, max_length=200, description="A short biography for the user")

    # You can raise your hands and give the answer to the chocolate question
    # Answer: GraphQL is a popular modern alternative to REST, designed to address
    # over-fetching (getting more data than needed) and under-fetching (needing
    # multiple requests to get related data). Clients request exactly the data they need.

    class Config:
        schema_extra = {
            "example": {
                "username": "coder123",
                "bio": "Loves coding and solving problems."
            }
        }

# Example model for Quiz Answer submission (if needed for validation)
class QuizAnswer(BaseModel):
    question_id: int # Or str, depending on how questions are identified
    selected_option: str # Or int, depending on option format

    class Config:
        schema_extra = {
            "example": {
                "question_id": 1,
                "selected_option": "B"
            }
        } 