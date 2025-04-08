document.addEventListener("DOMContentLoaded", () => {
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
  
    const form = document.getElementById("form");
    const confirmationMessage = document.getElementById("confirmationMessage");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const companions = parseInt(document.getElementById("companions").value);
      const note = document.getElementById("note").value.trim();
  
      if (name === "" || email === "") return alert("Por favor, completa todos los campos obligatorios.");
  
      await db.collection("confirmations").add({
        name,
        email,
        companions,
        note,
        timestamp: Date.now()
      });
  
      // Mostrar mensaje de confirmación
      form.style.display = "none";
      confirmationMessage.style.display = "block";
    });
  });