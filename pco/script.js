document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById("scanButton");
  const subnetInput = document.getElementById("subnetInput");
  const deviceList = document.getElementById("deviceList");
  const spinner = document.getElementById("spinner");

  const tips = [
    "Fichar a tiempo demuestra responsabilidad y compromiso.",
    "Si fichar fuera un videojuego, llegar tarde sería como perder una vida.",
    "Evita problemas con la nómina registrando tu horario correctamente.",
    "Si el sistema no te encuentra, no es el sistema... eres tú.",
    "Llegar tarde puede afectar la planificación de tu equipo.",
    "Recuerda fichar, o podrías terminar explicándole al jefe por qué llegaste 'mentalmente' a tiempo.",
    "Registrar tu entrada y salida es clave para el control de horas extras.",
    "No fichar no te hace un rebelde, solo te acerca a una charla incómoda con tu jefe.",
    "Un buen historial de asistencia mejora tu reputación en el trabajo.",
    "Si la red no responde, puede que sea un lunes... o que el router necesite café.",
    "Si olvidas fichar, podrías enfrentar descuentos en tu salario.",
    "Tu nómina y tu billetera te agradecerán que no te olvides de fichar.",
    "Revisar que el sistema funcione antes de fichar te ahorra problemas.",
    "No fichar es como ignorar el despertador... una mala idea.",
    "Si no encuentras el dispositivo, verifica que esté en la misma red.",
    "Fichar tarde es como ver el final de una serie sin ver los capítulos anteriores... simplemente no tiene sentido.",
    "Un router sobrecargado puede afectar la conexión, intenta reiniciarlo.",
    "La diferencia entre un buen día y una charla con RRHH: fichar a tiempo.",
    "Revisar la configuración de red del dispositivo puede evitar errores.",
    "Si fichar diera puntos, serías el MVP o el que juega en modo difícil.",
  ];

  let stopTips = false;
  let currentTipIndex = -1;

  function showNextTip() {
    if (stopTips) return;
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    const tipElement = document.querySelector(".tips-container");
    tipElement.textContent = tips[currentTipIndex];
    tipElement.classList.add("show");

    setTimeout(() => {
      tipElement.classList.remove("show");
      setTimeout(showNextTip, 500); // Pausa antes de mostrar el siguiente
    }, 5000);
  }

  scanButton.addEventListener("click", async () => {
    const subnet = subnetInput.value.trim();
    if (!subnet) {
      showNotification("Ingresa una subred válida.", "bad");
      return;
    }

    stopTips = false;
    showNextTip();

    deviceList.innerHTML = ""; // Limpiar lista
    stopTips = true;
    spinner.style.display = "block"; // Mostrar cargando

    const devices = [];
    const baseIP = subnet.split(".").slice(0, 3).join(".") + ".";
    const promises = [];
    const maxConcurrentRequests = 60; // Límite de solicitudes concurrentes

    for (let i = 1; i < 255; i++) {
      const ip = `${baseIP}${i}`;
      promises.push(checkDevice(ip));

      // Si hemos alcanzado el límite de solicitudes concurrentes, espera a que se resuelvan
      if (promises.length === maxConcurrentRequests) {
        await Promise.allSettled(promises).then((results) => {
          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
              devices.push(result.value);
              displayDevice(result.value); // Mostrar el dispositivo tan pronto como se encuentra
            }
          });
        });
        promises.length = 0; // Vacía el array de promesas
      }
    }

    // Maneja las promesas restantes
    if (promises.length > 0) {
      await Promise.allSettled(promises).then((results) => {
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            devices.push(result.value);
            displayDevice(result.value); // Mostrar el dispositivo tan pronto como se encuentra
          }
        });
      });
    }

    spinner.style.display = "none"; // Ocultar cargando
    if (devices.length === 0) {
      showNotification("No se encontraron dispositivos.", "bad");
    }
  });

  function displayDevice(device) {
    const deviceDiv = document.createElement("div");
    deviceDiv.className = "device";

    // Agregar iconos
    deviceDiv.innerHTML = `
        <i class="fas fa-microchip"></i> ${device.devname} (${device.ip})
        <i class="fas fa-sync-alt reboot-icon" title="Reboot"></i>
        <i class="fas fa-cog config-icon" title="Configuración"></i>
        <i class="fas fa-key access-icon" title="Acceso"></i>
    `;

    // Evento para abrir la configuración al hacer clic en el div
    deviceDiv.addEventListener("click", () => openConfiguration(device.ip));

    // Eventos para los iconos
    deviceDiv
      .querySelector(".reboot-icon")
      .addEventListener("click", (event) => {
        event.stopPropagation(); // Evita que se dispare el evento del div
        rebootDevice(device.ip);
      });

    deviceDiv
      .querySelector(".config-icon")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        openConfiguration(device.ip);
      });

    deviceDiv
      .querySelector(".access-icon")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        grantAccess(device.ip);
      });

    deviceList.appendChild(deviceDiv); // Agregar dispositivo a la lista
  }

  // Funciones simuladas para las acciones
  async function rebootDevice(ip) {
    // Mostrar el cuadro de confirmación
    const r = confirm(
      "Está a punto de reiniciar el dispositivo,\n esta acción no se puede deshacer y elimina todos los datos de configuración."
    );

    // Comprobar si el usuario ha confirmado (hizo clic en "Aceptar")
    if (r) {
      // `r` es el valor retornado por `confirm()`, que es `true` si se hace clic en "Aceptar"
      await fetch(`http://${ip}/reboot`);
    } else {
      console.log("Operación cancelada.");
    }
  }

  async function openConfiguration(ip) {
    window.location.href = `http://${ip}/`;
  }

  function grantAccess(ip) {
    setupKeyboard(ip);
  }

  async function checkDevice(ip) {
    const url = `http://${ip}/ispuncto`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Tiempo de espera de 2.5 segundos

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        return { ip, devname: data.devname };
      } else {
        console.warn(`Error al acceder a ${ip}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Error con ${ip}: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  }

  function setupKeyboard(device) {
    document.getElementById("numberForm").action = `http://${device}/number`;
    document.getElementById("keyboardContainer").style.display = "block";
    deviceList.style.display = "none";
  }

  function showNotification(message, type = "good") {
    const notification = document.querySelector(".notification");
    notification.classList.add(type);
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // Iniciar la rotación de consejos
});
