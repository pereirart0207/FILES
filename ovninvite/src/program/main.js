import { GuestLine } from '../components/GuestLine/GuestLine.js';

const guests = [
  { name: "Juan Pérez", confirmed: true, email: "juan@example.com", companions:[{name:"pedro", confirmed: false}, {name:"juan", confirmed: false}] },
  { name: "Ana Gómez", confirmed: false, email: "ana@example.com" },
  { name: "Carlos Ruiz", confirmed: true, email: "carlos@example.com" },
];

const container = document.getElementById('lista-invitados');
guests.forEach(guest => {
  const line = GuestLine(guest);
  container.appendChild(line);
});
