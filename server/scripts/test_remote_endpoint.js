fetch("https://smart-food-backend-czp1.onrender.com/api/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({message: "give top 5 ice creams under 200"})
}).then(r => r.json()).then(console.log).catch(console.error);
