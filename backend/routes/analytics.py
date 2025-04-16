from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
from db import init_db

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

        # Initialize users as an empty list before fetching
        users = []
        async for user in users_collection.find():
            users.append(user)

        item_count = len(items)
        user_count = len(users)

        # Use correct dictionary keys and safer access
        item_name_lengths = np.array([len(item.get("name", "")) for item in items]) if items else np.array([])
        user_username_lengths = np.array([len(user.get("username", "")) for user in users]) if users else np.array([])

        # Calculate stats safely
        stats = {
            "item_count": item_count,
            "user_count": user_count,
            "avg_item_name_length": float(np.mean(item_name_lengths)) if item_name_lengths.size > 0 else 0.0,
            "avg_user_username_length": float(np.mean(user_username_lengths)) if user_username_lengths.size > 0 else 0.0,
            "max_item_name_length": int(np.max(item_name_lengths)) if item_name_lengths.size > 0 else 0,
            "max_user_username_length": int(np.max(user_username_lengths)) if user_username_lengths.size > 0 else 0,
        }

        # Create a figure with 2 subplots in a row (1 row, 2 columns)
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        fig.suptitle("Analytics Data Visualization", fontsize=16)
        
        # First subplot - Item Name Lengths Bargraph
        if item_name_lengths.size > 0:
            unique_lengths, counts = np.unique(item_name_lengths, return_counts=True)
            ax1.bar(unique_lengths, counts, color='skyblue', alpha=0.7)
            ax1.set_title("Item Name Length Distribution")
            ax1.set_xlabel("Length of Item Names")
            ax1.set_ylabel("Number of Items")
            ax1.grid(axis='y', linestyle='--', alpha=0.7)
            
            # Add data labels on top of each bar
            for i, (length, count) in enumerate(zip(unique_lengths, counts)):
                ax1.text(length, count + 0.1, str(count), ha='center')
                
            # Set x-ticks to be integers only
            ax1.set_xticks(unique_lengths)
        else:
            ax1.text(0.5, 0.5, 'No item data available', ha='center', va='center', transform=ax1.transAxes)
            
        # Second subplot - Username Lengths Pie Chart
        if user_username_lengths.size > 0:
            unique_lengths, counts = np.unique(user_username_lengths, return_counts=True)
            
            # If there are many unique lengths, group them into ranges for better visualization
            if len(unique_lengths) > 7:
                # Create bins for lengths in ranges of 3 (e.g., 1-3, 4-6, etc.)
                bins = np.arange(min(unique_lengths), max(unique_lengths) + 4, 3)
                # Create labels for legend
                bin_labels = [f"{bins[i]}-{bins[i+1]-1}" for i in range(len(bins)-1)]
                
                # Count items in each bin
                binned_data = np.histogram(user_username_lengths, bins=bins)[0]
                
                # Plot pie chart with bins
                ax2.pie(binned_data, labels=bin_labels, autopct='%1.1f%%', 
                       shadow=True, startangle=90, colors=plt.cm.Paired(np.linspace(0, 1, len(bin_labels))))
            else:
                # If few unique lengths, use them directly
                labels = [f"Length {length}" for length in unique_lengths]
                ax2.pie(counts, labels=labels, autopct='%1.1f%%', 
                       shadow=True, startangle=90, colors=plt.cm.Paired(np.linspace(0, 1, len(labels))))
                
            ax2.set_title("Username Length Distribution")
            ax2.axis('equal')  # Equal aspect ratio ensures pie is drawn as a circle
        else:
            ax2.text(0.5, 0.5, 'No user data available', ha='center', va='center', transform=ax2.transAxes)

        # Adjust layout for better spacing
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
        # Save plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png", bbox_inches='tight', dpi=100)
        buffer.seek(0)
        # Encode the image bytes to base64 string
        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        plt.close()  # Close the plot figure to free up memory

        # Return both stats and the plot
        return JSONResponse(content={
            "stats": stats,
            "plot": f"data:image/png;base64,{image_base64}"
        })

    except HTTPException as http_exc:
        # Re-raise HTTPExceptions
        raise http_exc
    except Exception as e:
        # Handle other unexpected errors
        raise HTTPException(status_code=500, detail=f"An error occurred while generating analytics: {e}")