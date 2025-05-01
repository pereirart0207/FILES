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
    showSpinner();
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

    if (guestData.confirmed !== "confirmed") {
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
  } finally {

    hideSpinner();
  }
}

function renderGuestInfo(guestData, guestId) {
  document.getElementById("guestInfo").innerHTML = `
      <div class="guest-card">
        <h2>${guestData.name}</h2>
        <p><i class="fas fa-envelope"></i> ${guestData.email || "No especificado"
    }</p>
        <p class="status ${guestData.confirmed === "confirmed" ? "confirmed" : "pending"
    }">
          <i class="fas ${guestData.confirmed === "confirmed" ? "fa-check-circle" : "fa-clock"
    }"></i>
          ${guestData.confirmed === "confirmed"
      ? "Confirmado"
      : "Pendiente de confirmación"
    }
        </p>
        ${guestData.note
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
      <div class="companion-checkbox-container">
        <input 
          type="checkbox" 
          id="companion-${index}" 
          class="companion-checkbox" 
          checked = "${companion.confirmed === "confirmed" ? "true" : "false"}"
          ${companion.confirmed === "confirmed" ? "checked disabled" : ""}
          data-index="${index}"
        >
        <label for="companion-${index}" class="companion-info">
          <span>${companion.name}</span>
        </label>
      </div>
    `;
    companionsList.appendChild(companionItem);
  });
}

function setupConfirmationControls(guestId) {
  const controls = document.getElementById("confirmationControls");
  controls.classList.remove("hidden");

  // Confirmar todos (invitado + todos los acompañantes)
  document.getElementById("confirmAllBtn").addEventListener("click", () => {
    confirmAll(guestId);
  });

  // Confirmar invitado + acompañantes seleccionados
  document
    .getElementById("confirmSelectedBtn")
    .addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(
        ".companion-checkbox:checked:not(:disabled)"
      );
      const selectedIndexes = Array.from(checkboxes).map((checkbox) =>
        parseInt(checkbox.dataset.index)
      );

      // Siempre confirmar al invitado principal junto con los seleccionados
      confirmSelectedCompanions(guestId, selectedIndexes);
    });
}

async function confirmSelectedCompanions(guestId, companionIndexes = []) {
  try {
    showSpinner();
    const docRef = db.collection("confirmations").doc(guestId);
    const doc = await docRef.get();
    const data = doc.data();

    // Actualizar acompañantes seleccionados
    const updatedCompanions = data.companions ? [...data.companions] : [];

    companionIndexes.forEach((index) => {
      if (index >= 0 && index < updatedCompanions.length) {
        updatedCompanions[index] = {
          ...updatedCompanions[index],
          confirmed: "confirmed",
          confirmedAt: new Date().toISOString(),
        };
      }
    });

    // Actualizar Firestore (siempre confirmamos al invitado principal)
    await docRef.update({
      confirmed: "confirmed",
      confirmedAt: new Date().toISOString(),
      companions: updatedCompanions,
    });

    fetchGuestData(guestId); // Recargar datos
    showStatusMessage("Confirmación exitosa!", "success");
    confettiEffect();
  } catch (error) {
    console.error("Error al confirmar:", error);
    showStatusMessage("Error al confirmar", "error");

  } finally {
    hideSpinner();
  }
}

async function confirmAll(guestId) {
  try {
    showSpinner();
    const docRef = db.collection("confirmations").doc(guestId);
    const doc = await docRef.get();
    const data = doc.data();

    const updatedCompanions = data.companions
      ? data.companions.map((companion) => ({
        ...companion,
        confirmed: "confirmed",
        confirmedAt: new Date().toISOString(),
      }))
      : [];

    await docRef.update({
      confirmed: "confirmed",
      confirmedAt: new Date().toISOString(),
      companions: updatedCompanions,
    });

    fetchGuestData(guestId);
    showStatusMessage("¡Todos confirmados exitosamente! 🎉", "success");
    confettiEffect();
  } catch (error) {
    console.error("Error al confirmar todos:", error);
    showStatusMessage("Error al confirmar", "error");
  } finally {
    hideSpinner();
  }
}

function showStatusMessage(message, type) {
  const status = document.getElementById("statusMessage");
  status.textContent = message;
  status.className = type;
  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
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


function showSpinner() {
  const el = document.getElementById('spinner-overlay');
  if (el) {
    console.log("Mostrando spinner...");
    el.style.display = 'flex';
  }
}

function hideSpinner() {
  const el = document.getElementById('spinner-overlay');
  if (el) {
    console.log("quitando spinner...");
    el.style.display = 'none';
  }
}
