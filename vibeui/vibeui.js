(function () {
  if (window.viveUI) {
      console.warn('viveUI ya está cargado. Evitando duplicación.');
      return;
  }
  const style = document.createElement('style');
  style.innerHTML = `
    /* --- SPINNER --- */
    #ui-spinner-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #ui-spinner-overlay.active {
      display: flex;
    }
    .ui-spinner-modal {
      background: #fff;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }
    .ui-spinner {
      border: 6px solid #eee;
      border-top: 6px solid #333;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    .ui-spinner-message {
      font-size: 16px;
      color: #333;
      margin-top: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* --- TOAST --- */
    #ui-toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ui-toast {
      min-width: 200px;
      max-width: 300px;
      color: #fff;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in var(--duration, 3.5s) forwards;
      font-size: 14px;
      transition: transform 0.2s;
    }
    .ui-toast:hover {
      transform: scale(1.02);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
      to { opacity: 0; transform: translateX(100%); }
    }

    /* --- MODAL --- */
    #ui-modal-overlay {
      display: none;
      position: fixed;
      z-index: 9998;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
    }
    #ui-modal-overlay.active {
      display: flex;
    }
    #ui-modal {
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
      position: relative;
    }
    .ui-modal-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    }
    .ui-modal-close:hover {
      color: #333;
    }
  `;
  document.head.appendChild(style);

  // --- CREAR ESTRUCTURA HTML ---
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="ui-spinner-overlay">
      <div class="ui-spinner-modal">
        <div class="ui-spinner"></div>
        <div class="ui-spinner-message">Cargando...</div>
      </div>
    </div>
    <div id="ui-toast-container"></div>
    <div id="ui-modal-overlay">
      <div id="ui-modal">
        <button class="ui-modal-close" aria-label="Cerrar modal">&times;</button>
        <div id="ui-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const toastColors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3',
    dark: '#333'
  };

  // --- FUNCIONES GLOBALES ---
  window.viveUI = {
    showSpinner: function (options = {}) {
      const config = {
        message: "Cargando...",
        color: "#333",
        size: 50,
        background: "#fff",
        ...options
      };
      
      const overlay = document.getElementById("ui-spinner-overlay");
      const spinner = overlay.querySelector(".ui-spinner");
      const msg = overlay.querySelector(".ui-spinner-message");
      const modal = overlay.querySelector(".ui-spinner-modal");

      spinner.style.borderTopColor = config.color;
      spinner.style.width = `${config.size}px`;
      spinner.style.height = `${config.size}px`;
      msg.textContent = config.message;
      modal.style.background = config.background;

      overlay.classList.add("active");
    },

    hideSpinner: function () {
      document.getElementById("ui-spinner-overlay").classList.remove("active");
    },

    showNotification: function (options = {}) {
      const config = {
        message: "Notificación",
        type: "info",
        duration: 4000,
        backgroundColor: null,
        color: "#fff",
        fontSize: "14px",
        ...options
      };
      
      const container = document.getElementById("ui-toast-container");
      const toast = document.createElement("div");

      toast.className = "ui-toast";
      toast.style.backgroundColor = config.backgroundColor || toastColors[config.type] || toastColors.dark;
      toast.style.color = config.color;
      toast.style.fontSize = config.fontSize;
      toast.style.setProperty("--duration", `${(config.duration - 500) / 1000}s`);
      toast.textContent = config.message;

      container.appendChild(toast);
      setTimeout(() => toast.remove(), config.duration);
    },

    showModal: function (htmlContent = "") {
      const overlay = document.getElementById("ui-modal-overlay");
      const content = document.getElementById("ui-modal-content");
      content.innerHTML = htmlContent;
      overlay.classList.add("active");
    },

    closeModal: function () {
      document.getElementById("ui-modal-overlay").classList.remove("active");
    }
  };

  // Cerrar modal al hacer clic fuera o en el botón de cerrar
  document.getElementById("ui-modal-overlay").addEventListener("click", function (e) {
    if (e.target === this || e.target.classList.contains('ui-modal-close')) {
      window.viveUI.closeModal();
    }
  });
})();