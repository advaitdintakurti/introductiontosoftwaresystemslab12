const baseURL = "http://localhost:8000";

async function loadUsers() {
  try {
    const res = await fetch(`${baseURL}/users`); // Fix: Use baseURL instead of relative path
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    const users = await res.json();
    const list = document.getElementById("userList");
    list.innerHTML = "";
    
    document.getElementById("userCount").textContent = `Total users: ${users.length}`;
    
    users.forEach(user => {
      const li = document.createElement("li");
      li.className = "user-item"; // Add class for styling
      li.textContent = `${user.username}: ${user.bio}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn"; // Add class for styling
      deleteBtn.onclick = async () => {
        try {
          const deleteRes = await fetch(`${baseURL}/users/${user._id}`, { method: "DELETE" });
          if (!deleteRes.ok) {
            throw new Error(`Failed to delete user: ${deleteRes.status}`);
          }
          // Remove the item from DOM directly for immediate feedback
          li.remove();
          // Then refresh the full list to ensure consistency
          loadUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          alert("Failed to delete user. Please try again.");
        }
      };

      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    document.getElementById("userList").innerHTML = 
      `<li class="error">Failed to load users. Please try again. (${error.message})</li>`;
  }
}

document.getElementById("search").addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  try {
    const res = await fetch(`${baseURL}/users`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    const users = await res.json();
    const list = document.getElementById("userList");
    list.innerHTML = "";

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(term));
    document.getElementById("userCount").textContent = `Total users: ${filteredUsers.length}`;

    filteredUsers.forEach(user => {
      const li = document.createElement("li");
      li.className = "user-item"; // Add class for consistent styling
      li.textContent = `${user.username}: ${user.bio}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn"; // Add class for consistent styling
      deleteBtn.onclick = async () => {
        try {
          const deleteRes = await fetch(`${baseURL}/users/${user._id}`, { method: "DELETE" });
          if (!deleteRes.ok) {
            throw new Error(`Failed to delete user: ${deleteRes.status}`);
          }
          li.remove();
          loadUsers(); // Refresh list after deletion
        } catch (error) {
          console.error("Error deleting user:", error);
          alert("Failed to delete user. Please try again.");
        }
      };

      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Error searching users:", error);
    document.getElementById("userList").innerHTML = 
      `<li class="error">Failed to search users. Please try again. (${error.message})</li>`;
  }
});

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const bio = document.getElementById("bio").value;
  
  try {
    const response = await fetch(`${baseURL}/users`, { // Fix: Use baseURL instead of relative path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add user: ${response.status}`);
    }
    
    // Show immediate feedback
    const result = await response.json();
    const newUser = { _id: result.id, username, bio };
    
    // Add the new user to the DOM without refreshing the full list
    const list = document.getElementById("userList");
    const li = document.createElement("li");
    li.className = "user-item"; // Add class for styling
    li.textContent = `${username}: ${bio}`;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn"; // Add class for styling
    deleteBtn.onclick = async () => {
      try {
        const deleteRes = await fetch(`${baseURL}/users/${newUser._id}`, { method: "DELETE" });
        if (deleteRes.ok) {
          li.remove();
          loadUsers(); // Refresh list after deletion
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };
    
    li.appendChild(deleteBtn);
    list.prepend(li); // Add new user at the top for visibility
    
    // Update the user count
    const userCount = document.getElementById("userCount");
    const currentCount = parseInt(userCount.textContent.split(":")[1].trim()) + 1;
    userCount.textContent = `Total users: ${currentCount}`;
    
    // Reset the form
    e.target.reset();
    
    // Flash effect on the newly added user
    li.style.backgroundColor = "#d4edda";
    setTimeout(() => {
      li.style.backgroundColor = "";
    }, 2000);
    
  } catch (error) {
    console.error("Error adding user:", error);
    alert(`Failed to add user: ${error.message}`);
  }
});

// Initialize the page
window.addEventListener("DOMContentLoaded", () => {
  loadUsers();
});