from fastapi import APIRouter, HTTPException
from db import init_db
from models import Item  # Ensure Item is imported from models
from bson import ObjectId

# Fix 22: Initialize APIRouter correctly
router = APIRouter()

async def get_items_collection():
    # Assuming init_db returns a dictionary with collection names as keys
    # Ensure your db.py correctly provides the collection
    db_conn = init_db()
    if "items_collection" not in db_conn:
        # Handle error: collection not found in db connection
        # This might involve logging or raising a specific server error
        raise HTTPException(status_code=500, detail="Database configuration error: items_collection not found")
    return db_conn["items_collection"]

# This is the corrected POST route for creating items
@router.post("/")
async def create_item(item: Item): # Ensure Item model is used for validation
    items_collection = await get_items_collection()
    # Convert Pydantic model to dict for MongoDB insertion
    item_dict = item.dict()
    try:
        result = await items_collection.insert_one(item_dict)
        if result.inserted_id:
            # Return the ID of the created item
            return {"message": "Item created successfully", "id": str(result.inserted_id)}
        else:
            # Handle case where insertion didn't return an ID (should not happen with success)
             raise HTTPException(status_code=500, detail="Item could not be created, insertion failed")
    except Exception as e:
        # Handle potential database errors during insertion
        raise HTTPException(status_code=500, detail=f"Database error during item creation: {e}")

# Fix 23: Removed the duplicate and incorrect create_item definitions that were here

# Fix 24: Correct the delete route to accept only item_id and delete one item
@router.delete("/{item_id}")
async def delete_item(item_id: str):
    items_collection = await get_items_collection()
    try:
        # Convert item_id string to ObjectId for MongoDB query
        obj_id = ObjectId(item_id)
    except Exception:
        # Handle cases where item_id is not a valid ObjectId format
        raise HTTPException(status_code=400, detail="Invalid item ID format. Must be a 12-byte input or a 24-character hex string.")

    try:
        # Attempt to delete the item with the matching _id
        result = await items_collection.delete_one({"_id": obj_id})

        if result.deleted_count == 1:
            # Successfully deleted one item
            return {"message": f"Item {item_id} deleted successfully"}
        else:
            # If deleted_count is 0, the item was not found
            raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found")
    except Exception as e:
        # Handle potential database errors during deletion
        raise HTTPException(status_code=500, detail=f"Database error during item deletion: {e}")

# GET route to retrieve all items
@router.get("/")
async def get_items():
    items_collection = await get_items_collection()
    items = []
    try:
        # Iterate through the cursor returned by find()
        async for item in items_collection.find():
            # Convert MongoDB's ObjectId to string for JSON compatibility
            # Also handle potential missing '_id' field, though unlikely
            if '_id' in item:
                item['_id'] = str(item['_id'])
            items.append(item)
        return items
    except Exception as e:
        # Handle potential database errors during find operation
        raise HTTPException(status_code=500, detail=f"Database error retrieving items: {e}")

# Note: The duplicate POST routes and the incorrect DELETE route from the original file have been removed/corrected above.