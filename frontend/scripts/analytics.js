const baseURL = "http://localhost:8001";

async function loadAnalytics() {
  const res = await fetch(`${baseURL}/analytics`);
  const data = await res.json();
  
  document.getElementById("itemCount").textContent = data.stats.item_count;
  document.getElementById("userCount").textContent = data.stats.user_count;
  document.getElementById("avgItemName").textContent = data.stats.avg_item_name_length.toFixed(2);
  document.getElementById("avgUserName").textContent = data.stats.avg_user_username_length.toFixed(2);
  document.getElementById("maxItemName").textContent = data.stats.max_item_name_length;
  document.getElementById("maxUserName").textContent = data.stats.max_user_username_length;
  
  // Do I play too much cricket... hmmm...
  document.getElementById("plot").src = data.plot;
}

loadAnalytics();