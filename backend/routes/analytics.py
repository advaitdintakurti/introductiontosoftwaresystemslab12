from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
from db import init_db # Import init_db directly

router = APIRouter()

# Helper function to get the items collection
async def get_items_collection():
    db_conn = init_db()
    if "items_collection" not in db_conn:
        raise HTTPException(status_code=500, detail="Database configuration error: items_collection not found")
    return db_conn["items_collection"]

# Helper function to get the users collection
async def get_users_collection():
    db_conn = init_db()
    if "users_collection" not in db_conn:
        raise HTTPException(status_code=500, detail="Database configuration error: users_collection not found")
    return db_conn["users_collection"]

@router.get("/")
async def get_analytics():
    try:
        items_collection = await get_items_collection()
        users_collection = await get_users_collection()

        # Fetch all items
        items = []
        async for item in items_collection.find():
            items.append(item)

        # Fix 25: Initialize users as an empty list before fetching
        users = []
        async for user in users_collection.find():
            users.append(user)

        item_count = len(items)
        user_count = len(users)

        # Fix 26: Use correct dictionary keys "name" and "username"
        # Use .get() for safer access in case keys are missing
        item_name_lengths = np.array([len(item.get("name", "")) for item in items]) if items else np.array([])
        user_username_lengths = np.array([len(user.get("username", "")) for user in users]) if users else np.array([])

        # Calculate stats safely, handling potential empty arrays (division by zero)
        stats = {
            "item_count": item_count,
            "user_count": user_count,
            "avg_item_name_length": float(np.mean(item_name_lengths)) if item_name_lengths.size > 0 else 0.0,
            "avg_user_username_length": float(np.mean(user_username_lengths)) if user_username_lengths.size > 0 else 0.0,
            "max_item_name_length": int(np.max(item_name_lengths)) if item_name_lengths.size > 0 else 0,
            "max_user_username_length": int(np.max(user_username_lengths)) if user_username_lengths.size > 0 else 0,
        }

        # Generate plot using Matplotlib
        plt.figure(figsize=(10, 6)) # Adjusted figure size slightly

        # Plot histograms only if data exists
        if item_name_lengths.size > 0:
            plt.hist(item_name_lengths, bins=range(int(np.min(item_name_lengths)), int(np.max(item_name_lengths)) + 2), alpha=0.7, label="Item Name Lengths", color="skyblue")
        if user_username_lengths.size > 0:
            plt.hist(user_username_lengths, bins=range(int(np.min(user_username_lengths)), int(np.max(user_username_lengths)) + 2), alpha=0.7, label="Username Lengths", color="lightgreen")

        # Add labels and title
        plt.title("Distribution of Name and Username Lengths")
        plt.xlabel("Length")
        plt.ylabel("Frequency")

        # Add legend only if there is something to label
        if item_name_lengths.size > 0 or user_username_lengths.size > 0:
            plt.legend()
        else:
            # Optionally add text if no data
             plt.text(0.5, 0.5, 'No data available for plotting', horizontalalignment='center', verticalalignment='center', transform=plt.gca().transAxes)

        plt.grid(axis='y', alpha=0.5) # Add grid for better readability

        # Save plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png", bbox_inches='tight') # Use bbox_inches='tight'
        buffer.seek(0)
        # Encode the image bytes to base64 string
        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        plt.close() # Close the plot figure to free up memory

        # Fix 27: Include the plot base64 string in the JSON response
        return JSONResponse(content={
            "stats": stats,
            "plot": f"data:image/png;base64,{image_base64}"
        })

    except HTTPException as http_exc:
        # Re-raise HTTPExceptions (like 404, 500 from helpers)
        raise http_exc
    except Exception as e:
        # Catch any other unexpected errors during analytics generation
        # Log the error e here if you have logging setup
        raise HTTPException(status_code=500, detail=f"An error occurred while generating analytics: {e}")
