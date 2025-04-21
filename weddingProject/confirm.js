
  /*
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

  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('guestId');

    if (!guestId) {
      document.getElementById('guestInfo').innerHTML = '<p>No se proporcionó un ID de invitado válido.</p>';
      return;
    }

    fetchGuestData(guestId);
  });

  async function fetchGuestData(guestId) {
    try {
      const docRef = db.collection("confirmations").doc(guestId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        document.getElementById('guestInfo').innerHTML = '<p>Invitado no encontrado.</p>';
        return;
      }

      const guestData = docSnap.data();

      document.getElementById('guestInfo').innerHTML = `
        <p><strong>Invitado:</strong> ${guestData.name}</p>
        <p><strong>Email:</strong> ${guestData.email}</p>
        <p><strong>Estado:</strong> ${guestData.confirmed ? '✅ Confirmado' : '❌ No confirmado'}</p>
      `;

      if (!guestData.confirmed) {
        document.getElementById('confirmBtn').classList.remove('hidden');
        document.getElementById('confirmBtn').addEventListener('click', () => confirmGuest(guestId));
      } else {
        document.getElementById('statusMessage').textContent = 'Este invitado ya ha confirmado su asistencia.';
      }
    } catch (error) {
      console.error("Error al obtener el invitado:", error);
      document.getElementById('guestInfo').innerHTML = '<p>Ocurrió un error al cargar los datos.</p>';
    }
  }

  async function confirmGuest(guestId) {
    try {
      await db.collection("confirmations").doc(guestId).update({ confirmed: true });

      document.getElementById('statusMessage').textContent = '¡Invitado confirmado exitosamente! 🎉';
      document.getElementById('confirmBtn').classList.add('hidden');
    } catch (error) {
      console.error("Error al confirmar invitado:", error);
      document.getElementById('statusMessage').textContent = 'Error al confirmar la asistencia.';
    }
  }
    */
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
  
  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('guestId');
  
    if (!guestId) {
      document.getElementById('guestInfo').innerHTML = '<p>No se proporcionó un ID de invitado válido.</p>';
      return;
    }
  
    fetchGuestData(guestId);
  });
  
  async function fetchGuestData(guestId) {
    try {
      const docRef = db.collection("confirmations").doc(guestId);
      const docSnap = await docRef.get();
  
      if (!docSnap.exists) {
        document.getElementById('guestInfo').innerHTML = '<p>Invitado no encontrado.</p>';
        return;
      }
  
      const guestData = docSnap.data();
  
      document.getElementById('guestInfo').innerHTML = `
        <p><strong>Invitado:</strong> ${guestData.name}</p>
        <p><strong>Email:</strong> ${guestData.email}</p>
        <p><strong>Estado:</strong> ${guestData.confirmed ? '✅ Confirmado' : '❌ No confirmado'}</p>
      `;
  
      if (!guestData.confirmed) {
        const btn = document.getElementById('confirmBtn');
        btn.classList.remove('hidden');
        btn.addEventListener('click', () => confirmGuest(guestId));
      } else {
        const status = document.getElementById('statusMessage');
        status.textContent = 'Este invitado ya ha confirmado su asistencia.';
        status.classList.add('success');
      }
    } catch (error) {
      console.error("Error al obtener el invitado:", error);
      document.getElementById('guestInfo').innerHTML = '<p>Ocurrió un error al cargar los datos.</p>';
    }
  }
  
  async function confirmGuest(guestId) {
    try {
      await db.collection("confirmations").doc(guestId).update({ confirmed: true });
  
      const status = document.getElementById('statusMessage');
      status.textContent = '¡Invitado confirmado exitosamente! 🎉';
      status.classList.remove('error');
      status.classList.add('success');
  
      document.getElementById('confirmBtn').classList.add('hidden');
      confettiEffect();
    } catch (error) {
      console.error("Error al confirmar invitado:", error);
      const status = document.getElementById('statusMessage');
      status.textContent = 'Error al confirmar la asistencia.';
      status.classList.remove('success');
      status.classList.add('error');
    }
  }
  
  function confettiEffect() {
    const emoji = document.createElement('div');
    emoji.innerHTML = '🎉';
    emoji.style.position = 'fixed';
    emoji.style.top = '20%';
    emoji.style.left = '50%';
    emoji.style.transform = 'translate(-50%, -50%) scale(2)';
    emoji.style.opacity = '0';
    emoji.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    document.body.appendChild(emoji);
  
    setTimeout(() => {
      emoji.style.opacity = '1';
      emoji.style.transform = 'translate(-50%, -200%) scale(2.5)';
    }, 100);
  
    setTimeout(() => {
      emoji.remove();
    }, 1500);
  }
  