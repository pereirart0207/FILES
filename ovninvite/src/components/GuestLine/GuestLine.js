// GuestLine.js

/**
 * Crea una línea visual para un invitado (y sus acompañantes si existen)
 * @param {Object} guest - Objeto con name, confirmed, email, companions[]
 * @returns {HTMLElement} - Elemento DOM de la fila
 */
export function GuestLine(guest) {

  const wrapper = document.createElement('div');
  wrapper.className = 'guest-wrapper';

  const row = document.createElement('div');
  row.className = 'guest-row';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'guest-name';
  nameSpan.textContent = guest.name;

  const statusSpan = document.createElement('span');
  statusSpan.className = `guest-status ${guest.confirmed ? 'confirmed' : 'unconfirmed'}`;
  statusSpan.textContent = guest.confirmed ? '✔ Confirmado' : '✖ No confirmado';

  const btnConfirm = document.createElement('button');
  btnConfirm.className = 'action-btn confirm-all';
  btnConfirm.innerHTML = '<i class="fas fa-check-circle"></i>';
  btnConfirm.title = 'Confirmar';

  const btnDelete = document.createElement('button');
  btnDelete.className = 'action-btn delete';
  btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';
  btnDelete.title = 'Eliminar';

  const btnEmail = document.createElement('button');
  btnEmail.className = 'action-btn email';
  btnEmail.innerHTML = '<i class="fas fa-envelope"></i>';
  btnEmail.title = 'Enviar correo';

  row.appendChild(nameSpan);
  row.appendChild(statusSpan);
  row.appendChild(btnConfirm);
  row.appendChild(btnDelete);
  row.appendChild(btnEmail);

  wrapper.appendChild(row);

  // Si hay acompañantes
  if (Array.isArray(guest.companions) && guest.companions.length > 0) {
    const subList = document.createElement('div');
    subList.className = 'companions';

    guest.companions.forEach(companion => {
      const compRow = document.createElement('div');
      compRow.className = 'companion-row';

      const compName = document.createElement('span');
      compName.className = 'companion-name';
      compName.textContent = companion.name;

      const compStatus = document.createElement('span');
      compStatus.className = `guest-status ${companion.confirmed ? 'confirmed' : 'unconfirmed'}`;
      compStatus.textContent = companion.confirmed ? '✔ Confirmado' : '✖ No confirmado';

      compRow.appendChild(compName);
      compRow.appendChild(compStatus);
      subList.appendChild(compRow);
    });

    wrapper.appendChild(subList);
  }

  return wrapper;
}
