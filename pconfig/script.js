document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById("scanButton");
  const subnetInput = document.getElementById("subnetInput");
  const deviceList = document.getElementById("deviceList");
  const spinner = document.getElementById("spinner");

  // Array de consejos
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

  // Detener la rotación de consejos
  function stopTipsRotation() {
    stopTips = true;
  }

  scanButton.addEventListener("click", async () => {
    const subnet = subnetInput.value.trim();
    if (!subnet) {
      showNotification("Ingresa una subred válida.", "bad");
      return;
    }

    deviceList.innerHTML = ""; // Limpiar lista
    spinner.style.display = "block"; // Mostrar cargando

    try {
      const devices = await scanNetwork(subnet);
      spinner.style.display = "none"; // Ocultar cargando

      if (devices.length > 0) {
        devices.forEach((device) => {
          const deviceDiv = document.createElement("div");
          deviceDiv.className = "device";
          deviceDiv.innerHTML = `<i class="fas fa-microchip"></i>${device.devname} (${device.ip})`;
          deviceDiv.addEventListener("click", () => setupKeyboard(device.ip));
          deviceList.appendChild(deviceDiv);
        });
      } else {
        showNotification("No se encontraron dispositivos.", "bad");
      }
    } catch (error) {
      console.error("Error en escaneo:", error);
      showNotification("Error al escanear la red.", "bad");
    } finally {
      spinner.style.display = "none";
    }
  });

  async function scanNetwork(subnet) {
    const baseIP =
      subnet.split(".")[0] +
      "." +
      subnet.split(".")[1] +
      "." +
      subnet.split(".")[2] +
      ".";
    let devices = [];

    for (let i = 1; i < 255; i++) {
      const ip = `${baseIP}${i}`;
      const device = await checkDevice(ip);
      if (device) {
        devices.push(device);
      }
    }
    return devices;
  }

  async function checkDevice(ip) {
    const url = `http://${ip}/ispuncto`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 200); // Aumentamos timeout a 30s

    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });
      if (!headResponse.ok) return null;

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      if (response.ok) {
        const data = await response.json();
        return { ip, devname: data.devname };
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
  stopTips = false; // Reiniciar la rotación de consejos
  showNextTip();
});
