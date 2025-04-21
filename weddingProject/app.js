// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCk0RH8NdQFcSLJ8g4aaHqwF-aMbQrDqIA",
  authDomain: "bodda-451a0.firebaseapp.com",
  projectId: "bodda-451a0",
  storageBucket: "bodda-451a0.appspot.com",
  messagingSenderId: "357631041042",
  appId: "1:357631041042:web:1bfc8be63fb1d9a7f1c2cb",
  measurementId: "G-JB87P9RLTF",
};

// Configuración de EmailJS
const EMAILJS_USER_ID = "ePP1jTB0KozLmd1kF";
const SERVICE_ID = "service_mqqey1j";
const TEMPLATE_ID = "template_ykovwyb";

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Cache de elementos del DOM
const domElements = {
  attendeesList: document.getElementById("attendeesList"),
  totalGuests: document.getElementById("totalGuests"),
  confirmedGuests: document.getElementById("confirmedGuests"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  addGuestBtn: document.getElementById("addGuestBtn"),
  guestModal: document.getElementById("guestModal"),
  closeBtn: document.querySelector(".close-btn"),
  guestForm: document.getElementById("guestForm"),
  companionsContainer: document.getElementById("companionsContainer"),
  addCompanionBtn: document.getElementById("addCompanionBtn"),
  nameInput: document.getElementById("name"),
  emailInput: document.getElementById("email"),
  noteInput: document.getElementById("note"),
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  loadGuests();
  setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
  // Event delegation para botones dinámicos
  domElements.attendeesList.addEventListener("click", handleAttendeeActions);

  // Búsqueda
  domElements.searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loadGuests(domElements.searchInput.value.trim());
  });

  domElements.searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      loadGuests(domElements.searchInput.value.trim());
    }
  });

  // Modal de invitado
  domElements.addGuestBtn.addEventListener("click", openGuestModal);
  domElements.closeBtn.addEventListener("click", closeGuestModal);
  domElements.guestModal.addEventListener("click", (e) => {
    if (e.target === domElements.guestModal) {
      closeGuestModal();
    }
  });

  // Añadir acompañante
  domElements.addCompanionBtn.addEventListener("click", addCompanionField);

  // Formulario de invitado
  domElements.guestForm.addEventListener("submit", handleGuestSubmission);
}

// Función para cargar invitados
async function loadGuests(searchTerm = "") {
  try {
    let query = db.collection("confirmations").orderBy("timestamp", "desc");

    if (searchTerm) {
      query = query
        .where("name", ">=", searchTerm)
        .where("name", "<=", searchTerm + "\uf8ff");
    }

    const snapshot = await query.get();
    domElements.attendeesList.innerHTML = "";
    let total = 0;
    let confirmed = 0;

    if (snapshot.empty) {
      domElements.attendeesList.innerHTML =
        '<li class="no-guests">No se encontraron invitados</li>';
      domElements.totalGuests.textContent = "0";
      domElements.confirmedGuests.textContent = "0";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const companionsCount = data.companions ? data.companions.length : 0;
      total += 1 + companionsCount;
      if (data.confirmed) confirmed++;

      const li = document.createElement("li");
      li.className = "guest-item";
      li.innerHTML = `
        <div class="guest-header">
          <strong>${data.name}</strong> 
          <span class="guest-status ${
            data.confirmed ? "confirmed" : "pending"
          }">
            ${data.confirmed ? "✓ Confirmado" : "✗ Pendiente"}
          </span>
        </div>
        ${data.email ? `<div class="guest-email">${data.email}</div>` : ""}
        <div class="guest-details">
          <span>Acompañantes: ${companionsCount}</span>
          ${
            data.companions && data.companions.length > 0
              ? `<div class="companions-list">${data.companions
                  .map(
                    (companion) =>
                      `<span class="companion-name">${
                        companion.confirmed != "pending" ? "✅" : "❌"
                      } ${companion.name}</span>`
                  )
                  .join(", ")}</div>`
              : ""
          }
          ${data.note ? `<div class="guest-note">Nota: ${data.note}</div>` : ""}
        </div>
        <div class="guest-actions">
          <button class="action-btn send-invite-btn" 
                  data-id="${doc.id}" 
                  data-email="${data.email || ""}" 
                  data-name="${data.name}">
            <i class="fas fa-envelope"></i> Reenviar invitación
          </button>
          <button class="action-btn toggle-confirm-btn" 
                  data-id="${doc.id}" 
                  data-confirmed="${data.confirmed}">
            <i class="fas fa-${data.confirmed ? "times" : "check"}"></i> 
            ${data.confirmed ? "Cancelar" : "Confirmar"}
          </button>
          <button class="action-btn delete-btn" 
                  data-id="${doc.id}" 
                  data-name="${data.name}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      domElements.attendeesList.appendChild(li);
    });

    domElements.totalGuests.textContent = total;
    domElements.confirmedGuests.textContent = confirmed;
  } catch (error) {
    console.error("Error cargando invitados: ", error);
    domElements.attendeesList.innerHTML =
      '<li class="error">Error al cargar los invitados</li>';
  }
}

// Manejar acciones de los invitados
function handleAttendeeActions(e) {
  const button = e.target.closest("button");
  if (!button) return;

  if (button.classList.contains("send-invite-btn")) {
    const email = button.getAttribute("data-email") || "";
    const name = button.getAttribute("data-name");
    const guestId = button.getAttribute("data-id");
    sendInvitationEmail(email, name, guestId);
  } else if (button.classList.contains("delete-btn")) {
    const guestId = button.getAttribute("data-id");
    const guestName = button.getAttribute("data-name");
    deleteGuest(guestId, guestName);
  } else if (button.classList.contains("toggle-confirm-btn")) {
    const guestId = button.getAttribute("data-id");
    const isConfirmed = button.getAttribute("data-confirmed") === "true";
    toggleGuestConfirmation(guestId, !isConfirmed);
  }
}

// Función para agregar campos de acompañantes
function addCompanionField() {
  const div = document.createElement("div");
  div.className = "companion-field";
  div.innerHTML = `
    <input type="text" class="companion-name" placeholder="Nombre del acompañante">
    <button type="button" class="remove-companion-btn">&times;</button>
  `;
  domElements.companionsContainer.appendChild(div);

  div.querySelector(".remove-companion-btn").addEventListener("click", () => {
    div.remove();
  });
}
// Abrir modal de invitado
function openGuestModal() {
  domElements.guestForm.reset();
  domElements.companionsContainer.innerHTML = "";
  domElements.guestModal.classList.remove("hidden");
}

// Cerrar modal de invitado
function closeGuestModal() {
  domElements.guestModal.classList.add("hidden");
}

// Manejar envío del formulario
async function handleGuestSubmission(e) {
  e.preventDefault();

  const name = domElements.nameInput.value.trim();
  const email = domElements.emailInput.value.trim();
  const note = domElements.noteInput.value.trim();

  if (!name || !email) {
    alert("Por favor completa los campos obligatorios (Nombre y Email)");
    return;
  }

  try {
    // Obtener acompañantes con validación
    const companions = [];
    document.querySelectorAll(".companion-field").forEach((field) => {
      const name = field.querySelector(".companion-name").value.trim();
      if (name) {
        companions.push({
          name,
          confirmed: "pending",
          confirmedAt: null,
          email: field.querySelector(".companion-email")?.value.trim() || null,
        });
      }
    });

    // Validación principal
    if (!name.trim()) throw new Error("El nombre del invitado es requerido");

    // Agregar a Firestore
    const docRef = await db.collection("confirmations").add({
      name: name.trim(),
      email: email?.trim() || null,
      companions: companions.length > 0 ? companions : null,
      note: note?.trim() || null,
      confirmed: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Limpiar y cerrar
    closeGuestModal();

    // Enviar invitación (si hay email)
    if (email) {
      await sendInvitationEmail(email, name, docRef.id);
      alert(`Invitado agregado exitosamente. Invitación enviada a ${email}`);
    } else {
      alert(`Invitado agregado exitosamente.`);
    }

    // Recargar lista
    loadGuests(domElements.searchInput.value.trim());
  } catch (error) {
    console.error("Error:", error);
    alert(`Error: ${error.message}`);
  }
}

// Función para enviar invitación por email
async function sendInvitationEmail(email, name, guestId) {
  if (!email) {
    console.warn("No se puede enviar invitación sin email");
    return;
  }

  const confirmLink = `https://pereirart0207.github.io/FILES/weddingProject/confirm.html?guestId=${guestId}`;

  const emailData = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: EMAILJS_USER_ID,
    template_params: {
      to_name: name,
      to_email: email,
      from_name: "Novios",
      event_date: "Sep, 13, 2025, 11AM",
      event_location: "12201 SW 26th St Miami, FL 33175, United States",
      party_address:
        "7707 NW 103rd St Hialeah Gardens, FL 33016, United States",
      reply_to: "+1(772)204-6309",
      confirm_link: confirmLink,
    },
  };

  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al enviar el correo");
    }
  } catch (error) {
    console.error("Error enviando invitación: ", error);
    throw error;
  }
}

// Eliminar invitado
async function deleteGuest(guestId, guestName) {
  if (
    confirm(
      `¿Estás seguro que deseas eliminar a ${guestName}? Esta acción no se puede deshacer.`
    )
  ) {
    try {
      await db.collection("confirmations").doc(guestId).delete();
      loadGuests(domElements.searchInput.value.trim());
    } catch (error) {
      console.error("Error eliminando invitado: ", error);
      alert("Error al eliminar el invitado");
    }
  }
}

// Cambiar estado de confirmación
async function toggleGuestConfirmation(guestId, newStatus) {
  try {
    await db.collection("confirmations").doc(guestId).update({
      confirmed: newStatus,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    });
    loadGuests(domElements.searchInput.value.trim());
  } catch (error) {
    console.error("Error actualizando estado: ", error);
    alert("Error al actualizar el estado del invitado");
  }
}
