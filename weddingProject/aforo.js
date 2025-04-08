document.addEventListener("DOMContentLoaded", async () => {
    const firebaseConfig = {
      apiKey: "AIzaSyCk0RH8NdQFcSLJ8g4aaHqwF-aMbQrDqIA",
      authDomain: "bodda-451a0.firebaseapp.com",
      projectId: "bodda-451a0",
      storageBucket: "bodda-451a0.firebasestorage.app",
      messagingSenderId: "357631041042",
      appId: "1:357631041042:web:1bfc8be63fb1d9a7f1c2cb",
      measurementId: "G-JB87P9RLTF"
    };
  
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
  
    const attendeesList = document.getElementById("attendeesList");
    const totalGuests = document.getElementById("totalGuests");
  
    const snapshot = await db.collection("confirmations").orderBy("timestamp").get();
    let total = 0;
  
    snapshot.forEach(doc => {
      const data = doc.data();
      total += 1 + data.companions; // Confirmado + Acompañantes
  
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.name}</strong> (${data.email})
        - Acompañantes: ${data.companions}
        <br><small>Nota: ${data.note || "No dejó nota"}</small>
      `;
      attendeesList.appendChild(li);
    });
  
    totalGuests.textContent = total;
  });
  