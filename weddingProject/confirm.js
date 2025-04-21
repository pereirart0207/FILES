const firebaseConfig = {
  apiKey: "AIzaSyCk0RH8NdQFcSLJ8g4aaHqwF-aMbQrDqIA",
  authDomain: "bodda-451a0.firebaseapp.com",
  projectId: "bodda-451a0",
  storageBucket: "bodda-451a0.appspot.com",
  messagingSenderId: "357631041042",
  appId: "1:357631041042:web:1bfc8be63fb1d9a7f1c2cb",
  measurementId: "G-JB87P9RLTF",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const guestId = urlParams.get("guestId");

  if (!guestId) {
    document.getElementById("guestInfo").innerHTML =
      "<p>No se proporcionó un ID de invitado válido.</p>";
    return;
  }

  fetchGuestData(guestId);
});

async function fetchGuestData(guestId) {
  try {
    const docRef = db.collection("confirmations").doc(guestId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      document.getElementById("guestInfo").innerHTML =
        "<p>Invitado no encontrado.</p>";
      return;
    }

    const guestData = docSnap.data();
    renderGuestInfo(guestData, guestId);

    if (guestData.companions && guestData.companions.length > 0) {
      renderCompanionsSection(guestData.companions, guestId);
    }

    if (!guestData.confirmed == "confirmed") {
      setupConfirmationControls(guestId);
    } else {
      showStatusMessage(
        "Este invitado ya ha confirmado su asistencia.",
        "success"
      );
    }
  } catch (error) {
    console.error("Error al obtener el invitado:", error);
    document.getElementById("guestInfo").innerHTML =
      "<p>Ocurrió un error al cargar los datos.</p>";
  }
}

function renderGuestInfo(guestData, guestId) {
  document.getElementById("guestInfo").innerHTML = `
      <div class="guest-card">
        <h2>${guestData.name}</h2>
        <p><i class="fas fa-envelope"></i> ${guestData.email}</p>
        <p class="status ${guestData.confirmed ? "confirmed" : "pending"}">
          <i class="fas ${
            guestData.confirmed ? "fa-check-circle" : "fa-clock"
          }"></i>
          ${guestData.confirmed ? "Confirmado" : "Pendiente de confirmación"}
        </p>
        ${
          guestData.note
            ? `<p class="note"><i class="fas fa-comment"></i> ${guestData.note}</p>`
            : ""
        }
      </div>
    `;
}

function renderCompanionsSection(companions, guestId) {
  const companionsSection = document.getElementById("companionsSection");
  const companionsList = document.getElementById("companionsList");

  companionsSection.classList.remove("hidden");
  companionsList.innerHTML = "";

  companions.forEach((companion, index) => {
    const companionItem = document.createElement("div");
    companionItem.className = "companion-item";
    companionItem.innerHTML = `
        <div class="companion-info">
          <span>${companion.name}</span>
          <span class="status ${companion.confirmed ? "confirmed" : "pending"}">
            ${companion.confirmed ? "✅ Confirmado" : "❌ Pendiente"}
          </span>
        </div>
        ${
          !companion.confirmed
            ? `
          <button class="confirm-companion-btn" data-index="${index}">
            <i class="fas fa-check"></i> Confirmar
          </button>
        `
            : ""
        }
      `;
    companionsList.appendChild(companionItem);
  });

  // Agregar eventos a los botones de confirmación
  document.querySelectorAll(".confirm-companion-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      confirmCompanion(guestId, parseInt(btn.dataset.index))
    );
  });
}

function setupConfirmationControls(guestId) {
  const controls = document.getElementById("confirmationControls");
  controls.classList.remove("hidden");

  document
    .getElementById("confirmAllBtn")
    .addEventListener("click", () => confirmAll(guestId));
  document
    .getElementById("confirmSelectedBtn")
    .addEventListener("click", () => confirmSelected(guestId));
}

async function confirmCompanion(guestId, companionIndex) {
  try {
    const docRef = db.collection("confirmations").doc(guestId);
    const doc = await docRef.get();
    const companions = [...doc.data().companions];

    companions[companionIndex] = {
      ...companions[companionIndex],
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    };

    await docRef.update({ companions });
    renderCompanionsSection(companions, guestId);
    showStatusMessage("Acompañante confirmado exitosamente!", "success");
  } catch (error) {
    console.error("Error al confirmar acompañante:", error);
    showStatusMessage("Error al confirmar el acompañante", "error");
  }
}

async function confirmAll(guestId) {
  try {
    const docRef = db.collection("confirmations").doc(guestId);
    const doc = await docRef.get();
    const data = doc.data();

    const updatedCompanions = data.companions
      ? data.companions.map((companion) => ({
          ...companion,
          confirmed: true,
          confirmedAt: new Date().toISOString(),
        }))
      : [];

    await docRef.update({
      confirmed: true,
      confirmedAt: new Date().toISOString(),
      companions: updatedCompanions,
    });

    fetchGuestData(guestId); // Recargar datos
    showStatusMessage("¡Todos confirmados exitosamente! �", "success");
    confettiEffect();
  } catch (error) {
    console.error("Error al confirmar todos:", error);
    showStatusMessage("Error al confirmar", "error");
  }
}

async function confirmSelected(guestId) {
  try {
    const docRef = db.collection("confirmations").doc(guestId);
    const doc = await docRef.get();
    const data = doc.data();

    await docRef.update({
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    });

    fetchGuestData(guestId); // Recargar datos
    showStatusMessage("Invitado principal confirmado!", "success");
    confettiEffect();
  } catch (error) {
    console.error("Error al confirmar seleccionados:", error);
    showStatusMessage("Error al confirmar", "error");
  }
}

function showStatusMessage(message, type) {
  const status = document.getElementById("statusMessage");
  status.textContent = message;
  status.className = type;
}

function confettiEffect() {
  const emoji = document.createElement("div");
  emoji.innerHTML = "🎉";
  emoji.style.position = "fixed";
  emoji.style.top = "20%";
  emoji.style.left = "50%";
  emoji.style.transform = "translate(-50%, -50%) scale(2)";
  emoji.style.opacity = "0";
  emoji.style.transition = "opacity 1s ease-out, transform 1s ease-out";
  document.body.appendChild(emoji);

  setTimeout(() => {
    emoji.style.opacity = "1";
    emoji.style.transform = "translate(-50%, -200%) scale(2.5)";
  }, 100);

  setTimeout(() => {
    emoji.remove();
  }, 1500);
}
