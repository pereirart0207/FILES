document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const numberInput = document.getElementById('numberInput');
    const feedback = document.getElementById('feedback');
    const scanButton = document.getElementById('scanButton');
    const subnetInput = document.getElementById('subnetInput');
    const deviceList = document.getElementById('deviceList');
    const spinner = document.getElementById('spinner');
    const keyboardContainer = document.getElementById('keyboardContainer');
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
        "Si fichar diera puntos, serías el MVP o el que juega en modo difícil."
    ];
    
    

let stopTips = false;
function showNextTip() {
    if (stopTips) return; // Si stopTips es true, no sigue cambiando
   let tipIndex = Math.floor(Math.random() * tips.length);
    const tipElement = document.querySelector('.tips-container');
    tipElement.textContent = tips[tipIndex];
    tipElement.classList.add('show');

    setTimeout(() => {
        tipElement.classList.remove('show');   
        setTimeout(showNextTip, 500); // Pausa antes de mostrar el siguiente
    }, 5000);
}

// Función para detener los consejos manualmente
function stopTipsRotation() {
    stopTips = true;
}

// Iniciar la rotación de consejos después de cargar la página
    scanButton.addEventListener("click", () =>{
        stopTips = false; // Reiniciar la rotación de consejos
        showNextTip();

    });





    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (key.dataset.value) {
                numberInput.value += key.dataset.value; // Agrega el número al input
            }
        });
    });

    scanButton.addEventListener('click', async () => {
        const subnet = subnetInput.value;
        deviceList.innerHTML = ''; // Limpiar la lista de dispositivos
        spinner.style.display = 'block'; // Mostrar el spinner

        try {
            const devices = await scanNetwork(subnet);
            spinner.style.display = 'none'; // Ocultar el spinner
            stopTipsRotation(); // Detener la rotación de consejos
            if (devices.length > 0) {
                devices.forEach(device => {
                    const deviceDiv = document.createElement('div');
                    deviceDiv.className = 'device';
                    deviceDiv.innerHTML = `<i class="fas fa-microchip"></i>${device.devname} (${device.ip})`; // Mostrar devname e IP
                    deviceDiv.addEventListener('click', () => {
                        setupKeyboard(device.ip);
                    });
                    deviceList.appendChild(deviceDiv);
                });
            } else {
                showNotification("No se encontraron dispositivos.", "bad");
              
            }
        } catch (error) {
            spinner.style.display = 'none';
            showNotification("No se encontraron dispositivos.", "bad");
           
        }
    });

    async function scanNetwork(subnet) {
        const [base, mask] = subnet.split('/');
        const network = base.split('.').slice(0, 3).join('.') + '.';
        const promises = [];

        // Generar IPs de la subred (suponiendo una máscara de 24 bits)
        for (let i = 1; i < 255; i++) {
            const ip = `${network}${i}`;
            promises.push(checkDevice(ip));
        }

        // Ejecutar todas las promesas y esperar su resultado
        const results = await Promise.all(promises);
        
        // Filtrar las IPs que respondieron positivamente
        return results.filter(device => device !== null);
    }

    async function checkDevice(ip) {
        // Realiza un fetch al endpoint {ip}/ispunto con un timeout de 10s
        const url = `http://${ip}/ispuncto`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

        try {
            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json(); // Obtener respuesta en formato JSON
                return { ip, devname: data.devname }; // Retornar objeto con IP y devname
            }
        } catch (error) {
            // Manejo de error (puedes agregar logging aquí si lo deseas)
            if (error.name === 'AbortError') {
                console.log(`Fetch para ${ip} abortado debido a tiempo de espera.`);
            }
        } finally {
            clearTimeout(timeoutId); // Limpiar el timeout
        }
        return null; // Retorna null si no hubo respuesta exitosa
    }


    document.getElementById("clearbtn").addEventListener("click", ()=>{
        numberInput.value = ""; // Limpia el input
        showNotification("Número borrado");
    }); 

    
    function setupKeyboard(device) {
        document.getElementById('numberForm').action = `http://${device}/number`; // Establecer la acción del formulario
        keyboardContainer.style.display = 'block'; // Mostrar el teclado
        deviceList.style.display = 'none'; // Ocultar la lista de dispositivos
    }

    document.getElementById('numberForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío del formulario por defecto
        try {
            const response = await fetch(event.target.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(new FormData(event.target)).toString()
            });
            if (!response.ok) throw new Error('Error al enviar el número');
            const html = await response.text();
            feedback.innerHTML = html; // Carga el feedback del servidor
        } catch (error) {
            feedback.innerHTML = 'Error al enviar el número. Inténtalo de nuevo.';
        }
    });
});


function showNotification(message, type="good") {
    console.log("Notificación llamada:", message); // Verificar que se está llamando
    const notification = document.querySelector('.notification');
    notification.classList.add(type);
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Desaparece después de 3 segundos
}
