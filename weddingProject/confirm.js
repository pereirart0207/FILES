
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