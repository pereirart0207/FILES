// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCk0RH8NdQFcSLJ8g4aaHqwF-aMbQrDqIA",
  authDomain: "bodda-451a0.firebaseapp.com",
  projectId: "bodda-451a0",
  storageBucket: "bodda-451a0.appspot.com",
  messagingSenderId: "357631041042",
  appId: "1:357631041042:web:1bfc8be63fb1d9a7f1c2cb",
  measurementId: "G-JB87P9RLTF"
};

// Configuración de EmailJS
const EMAILJS_USER_ID = "ePP1jTB0KozLmd1kF";
const SERVICE_ID = "service_mqqey1j";
const TEMPLATE_ID = "template_ykovwyb";

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementos del DOM
const attendeesList = document.getElementById("attendeesList");
const totalGuests = document.getElementById("totalGuests");
const confirmedGuests = document.getElementById("confirmedGuests");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const addGuestBtn = document.getElementById("addGuestBtn");
const guestModal = document.getElementById("guestModal");
const closeBtn = document.querySelector(".close-btn");
const guestForm = document.getElementById("guestForm");
const companionsContainer = document.getElementById("companionsContainer");
const addCompanionBtn = document.getElementById("addCompanionBtn");

document.addEventListener("DOMContentLoaded", () => {
  loadGuests();
});

// Función para cargar invitados
async function loadGuests(searchTerm = '') {
  try {
    let query = db.collection("confirmations").orderBy("timestamp");

    if (searchTerm) {
      query = query
        .orderBy("name")
        .where("name", ">=", searchTerm)
        .where("name", "<=", searchTerm + '\uf8ff');
    }

    const snapshot = await query.get();
    attendeesList.innerHTML = '';
    let total = 0;
    let confirmed = 0;

    if (snapshot.empty) {
      attendeesList.innerHTML = '<li>No se encontraron invitados</li>';
      totalGuests.textContent = '0';
      confirmedGuests.textContent = '0';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const companionsCount = data.companionsNames ? data.companionsNames.length : 0;
      total += 1 + companionsCount;
      if (data.confirmed) confirmed++;

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="guest-header">
          <strong>${data.name}</strong> 
          <span class="guest-status ${data.confirmed ? 'confirmed' : 'pending'}">
            ${data.confirmed ? '✓ Confirmado' : '✗ Pendiente'}
          </span>
        </div>
        <div class="guest-email">${data.email}</div>
        <div class="guest-details">
          <span>Acompañantes: ${companionsCount}</span>
          ${data.companionsNames ? `<div class="companions-list">${data.companionsNames.map(name => `<span class="companion-name">${name}</span>`).join('')}</div>` : ''}
          ${data.note ? `<span class="guest-note">Nota: ${data.note}</span>` : ''}
        </div>
        <div class="guest-actions">
          <button class="action-btn send-invite-btn" 
                  data-id="${doc.id}" 
                  data-email="${data.email}" 
                  data-name="${data.name}">
            <i class="fas fa-envelope"></i> Reenviar invitación
          </button>
          <button class="action-btn toggle-confirm-btn" 
                  data-id="${doc.id}" 
                  data-confirmed="${data.confirmed}">
            <i class="fas fa-${data.confirmed ? 'times' : 'check'}"></i> 
            ${data.confirmed ? 'Cancelar' : 'Confirmar'}
          </button>
          <button class="action-btn delete-btn" 
                  data-id="${doc.id}" 
                  data-name="${data.name}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      attendeesList.appendChild(li);
    });

    totalGuests.textContent = total;
    confirmedGuests.textContent = confirmed;

    // Agregar event listeners a los botones
    addButtonEventListeners();

  } catch (error) {
    console.error("Error cargando invitados: ", error);
    attendeesList.innerHTML = '<li>Error al cargar los invitados</li>';
  }
}

// Función para agregar campos de acompañantes
function addCompanionField(value = '') {
  const div = document.createElement('div');
  div.className = 'companion-field';
  div.innerHTML = `
    <input type="text" class="companion-name" placeholder="Nombre del acompañante" value="${value}">
    <button type="button" class="remove-companion-btn">×</button>
  `;
  companionsContainer.appendChild(div);
  
  // Agregar evento para eliminar el campo
  div.querySelector('.remove-companion-btn').addEventListener('click', () => {
    div.remove();
  });
}

// Evento para agregar más acompañantes
addCompanionBtn.addEventListener('click', () => {
  addCompanionField();
});

// Función para agregar event listeners a los botones dinámicos
function addButtonEventListeners() {
  // Botones de enviar invitación
  document.querySelectorAll('.send-invite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target.closest('button');
      const email = button.getAttribute('data-email');
      const name = button.getAttribute('data-name');
      const guestId = button.getAttribute('data-id');
      await sendInvitationEmail(email, name, guestId);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target.closest('button');
      const guestId = button.getAttribute('data-id');
      const guestName = button.getAttribute('data-name');
      
      if (confirm(`¿Estás seguro que deseas eliminar a ${guestName}?`)) {
        try {
          await db.collection("confirmations").doc(guestId).delete();
          loadGuests(searchInput.value);
          alert(`Invitado ${guestName} eliminado correctamente`);
        } catch (error) {
          console.error("Error eliminando invitado: ", error);
          alert("Error al eliminar el invitado");
        }
      }
    });
  });

  // Botones de confirmar/cancelar
  document.querySelectorAll('.toggle-confirm-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target.closest('button');
      const guestId = button.getAttribute('data-id');
      const isConfirmed = button.getAttribute('data-confirmed') === 'true';

      try {
        await db.collection("confirmations").doc(guestId).update({
          confirmed: !isConfirmed
        });
        loadGuests(searchInput.value);
      } catch (error) {
        console.error("Error actualizando estado: ", error);
        alert("Error al actualizar el estado del invitado");
      }
    });
  });
}

// Función para enviar invitación por email
async function sendInvitationEmail(email, name, guestId) {
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
      party_address: "7707 NW 103rd St Hialeah Gardens, FL 33016, United States",
      reply_to: "+1(772)204-6309",
      confirm_link: confirmLink
    }
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      alert(`Invitación enviada exitosamente a ${email}`);
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "Error al enviar el correo");
    }
  } catch (error) {
    console.error("Error enviando invitación: ", error);
    alert("Error al enviar la invitación: " + error.message);
  }
}

// Manejar búsqueda
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loadGuests(searchInput.value.trim());
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    loadGuests(searchInput.value.trim());
  }
});

// Mostrar modal para agregar invitado
addGuestBtn.addEventListener('click', () => {
  // Limpiar campos de acompañantes al abrir el modal
  companionsContainer.innerHTML = '';
  guestModal.classList.remove('hidden');
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
  guestModal.classList.add('hidden');
});

// Cerrar modal al hacer clic fuera del contenido
guestModal.addEventListener('click', (e) => {
  if (e.target === guestModal) {
    guestModal.classList.add('hidden');
  }
});

// Manejar envío del formulario
guestForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const note = document.getElementById('note').value.trim();
  
  // Obtener nombres de acompañantes
  const companionsNames = [];
  document.querySelectorAll('.companion-name').forEach(input => {
    if (input.value.trim()) {
      companionsNames.push(input.value.trim());
    }
  });

  if (!name || !email) {
    alert('Por favor completa los campos obligatorios');
    return;
  }

  try {
    const docRef = await db.collection('confirmations').add({
      name,
      email,
      companionsNames,
      note,
      confirmed: false,
      timestamp: Date.now()
    });

    guestForm.reset();
    companionsContainer.innerHTML = '';
    guestModal.classList.add('hidden');
    loadGuests(searchInput.value.trim());

    await sendInvitationEmail(email, name, docRef.id);
    alert(`Invitado agregado exitosamente, se le ha enviado la invitación al correo especificado ${email}`);
  } catch (error) {
    console.error('Error agregando invitado:', error);
    alert('Error al agregar el invitado');
  }
});