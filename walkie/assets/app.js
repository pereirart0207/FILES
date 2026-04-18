/* global mqtt */

const DEFAULTS = Object.freeze({
  brokerUrl: "wss://broker.hivemq.com:8884/mqtt",
  channel: "1",
  username: "",
});

const LIMITS = Object.freeze({
  maxMs: 6000,
  maxBytes: 160_000,
  maxLog: 40,
});

const PRESENCE = Object.freeze({
  ttlMs: 25_000,
  heartbeatMs: 10_000,
});

const I18N = Object.freeze({
  es: {
    app_title: "Walkie · Voz por MQTT",
    brand_sub: "Voz rápida para divertirte con amigos",
    lang_label: "Idioma",
    status_offline: "desconectado",
    status_connecting: "conectando…",
    status_reconnecting: "reconectando…",
    status_online: "online",

    label_user: "Usuario",
    hint_saved: "se guarda",
    ph_user: "Tu nombre (opcional)",

    label_channel: "Canal",
    ph_channel: "1 / 2 / 3",
    channel_badge_prefix: "canal",
    channel_readout: "CH",

    advanced: "Opciones avanzadas",
    label_broker: "Broker MQTT",
    ph_broker: "wss://…",

    activity: "Actividad",
    ptt_aria: "Pulsar para hablar",
    ptt_hold: "Mantén para hablar",
    help_hold: "Mantén pulsado",
    help_space: "Tecla Espacio",
    help_max: "máx. 6s",

    footer_tip: "Tip: comparte el canal con tus amigos",
    footer_demo: "Walkie MQTT · demo",

    users_label: "Usuarios",
    speaker_label: "Habla",
    speaker_idle: "—",
    screen_ch: "CANAL",
    screen_users: "USUARIOS",
    screen_speaking: "HABLA",

    log_system: "sistema",
    log_error: "Error",
    log_warn: "⚠",

    sys_connected: "Conectado",
    sys_reconnecting: "Reconectando al broker…",
    sys_listening: "Escuchando",
    err_mqtt_missing: "No se cargó mqtt.js (revisa tu conexión).",
    err_subscribe: "No se pudo suscribir al canal.",
    err_audio_long: "Audio demasiado largo. Prueba a hablar menos tiempo.",
    err_mic_denied: "Permiso de micrófono denegado.",
    err_mic_start: "No se pudo iniciar el micrófono.",
    sys_audio_received_tap:
      "Audio recibido (toca la pantalla para habilitar sonido).",
    err_audio_unsupported: "Formato de audio no compatible en este navegador.",
    err_audio_play: "No se pudo reproducir el audio.",
    log_voice_received: "Mensaje de voz recibido",
    log_sent: "Enviado",
    err_send: "No se pudo enviar.",
    err_audio_read: "No se pudo leer el audio.",
    err_mqtt_prefix: "MQTT:",

    sfx_click: "Click",

    call_outgoing: "Llamando...",
    call_incoming: "llamada entrante",
    call_accept: "Aceptar",
    call_reject: "Rechazar",
    call_hangup: "Colgar",
    call_connected: "Llamada conectada",
    call_ended: "Llamada finalizada",
    call_no_answer: "No contesta",
    call_timeout: "Tiempo de espera agotado",
  },
  en: {
    app_title: "Walkie · Voice over MQTT",
    brand_sub: "Quick voice chat for you and your friends",
    lang_label: "Language",
    status_offline: "offline",
    status_connecting: "connecting…",
    status_reconnecting: "reconnecting…",
    status_online: "online",

    label_user: "User",
    hint_saved: "saved",
    ph_user: "Your name (optional)",

    label_channel: "Channel",
    ph_channel: "1 / 2 / 3",
    channel_badge_prefix: "channel",
    channel_readout: "CH",

    advanced: "Advanced options",
    label_broker: "MQTT broker",
    ph_broker: "wss://…",

    activity: "Activity",
    ptt_aria: "Push to talk",
    ptt_hold: "Hold to talk",
    help_hold: "Hold",
    help_space: "Space key",
    help_max: "max 6s",

    footer_tip: "Tip: share the channel with your friends",
    footer_demo: "Walkie MQTT · demo",

    users_label: "Users",
    speaker_label: "Speaking",
    speaker_idle: "—",
    screen_ch: "CHANNEL",
    screen_users: "USERS",
    screen_speaking: "SPEAKING",

    log_system: "system",
    log_error: "Error",
    log_warn: "⚠",

    sys_connected: "Connected",
    sys_reconnecting: "Reconnecting to broker…",
    sys_listening: "Listening on",
    err_mqtt_missing: "mqtt.js didn’t load (check your connection).",
    err_subscribe: "Couldn’t subscribe to the channel.",
    err_audio_long: "Audio too long. Try speaking for less time.",
    err_mic_denied: "Microphone permission denied.",
    err_mic_start: "Couldn’t start the microphone.",
    sys_audio_received_tap: "Audio received (tap the page to enable sound).",
    err_audio_unsupported: "Audio format not supported in this browser.",
    err_audio_play: "Could not play the audio.",
    log_voice_received: "Voice message received",
    log_sent: "Sent",
    err_send: "Couldn’t send.",
    err_audio_read: "Couldn’t read the audio.",
    err_mqtt_prefix: "MQTT:",

    sfx_click: "Click",

    call_outgoing: "Calling...",
    call_incoming: "incoming call",
    call_accept: "Accept",
    call_reject: "Reject",
    call_hangup: "Hang up",
    call_connected: "Call connected",
    call_ended: "Call ended",
    call_no_answer: "No answer",
    call_timeout: "Call timeout",
  },
});

function getInitialLang() {
  const stored = localStorage.getItem("walkie.lang");
  if (stored && (stored === "es" || stored === "en")) return stored;
  const nav = (navigator.language || "").toLowerCase();
  return nav.startsWith("es") ? "es" : "en";
}

function makeTranslator() {
  let lang = getInitialLang();

  const t = (key) => {
    const table = I18N[lang] || I18N.en;
    return table[key] ?? I18N.en[key] ?? key;
  };

  const setLang = (next) => {
    lang = next === "es" ? "es" : "en";
    localStorage.setItem("walkie.lang", lang);
    document.documentElement.lang = lang;
    applyTranslations(t);
  };

  const getLang = () => lang;
  return { t, setLang, getLang };
}

function applyTranslations(t) {
  const titleEl = document.querySelector("title[data-i18n]");
  if (titleEl) titleEl.textContent = t(titleEl.dataset.i18n);

  const nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach((el) => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t(key));
    } else if (el.tagName !== "TITLE") {
      el.textContent = t(key);
    }
  });
}

function $(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

function $maybe(sel) {
  return document.querySelector(sel);
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeChannel(input) {
  const digits = String(input ?? "")
    .trim()
    .replace(/[^\d]/g, "");
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n)) return DEFAULTS.channel;
  const clamped = Math.max(1, Math.min(100, n));
  return String(clamped);
}

function clampStr(input, maxLen) {
  const s = String(input ?? "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function getOrCreateSenderId() {
  const key = "walkie.senderId";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id =
    crypto?.randomUUID?.() ??
    `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(key, id);
  return id;
}

function getDataUrlMimeFull(dataUrl) {
  const prefix = "data:";
  if (typeof dataUrl !== "string" || !dataUrl.startsWith(prefix)) return "";
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return "";
  const header = dataUrl.slice(prefix.length, comma); // e.g. "audio/webm;codecs=opus;base64"
  return header.replace(/;base64$/i, "");
}

class AudioGate {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this._unlocking = false;
  }

  async unlock() {
    if (this.unlocked || this._unlocking) return;
    this._unlocking = true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        this.unlocked = true;
        return;
      }

      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") await this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.value = 0.00001;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);

      this.unlocked = true;
    } finally {
      this._unlocking = false;
    }
  }
}

function makeNoiseBuffer(ctx, seconds) {
  const sampleRate = ctx.sampleRate || 44100;
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const buffer = ctx.createBuffer(1, len, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.7;
  }
  return buffer;
}

function playClick(ctx) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(140, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.07);
}

function playBeep(ctx, freq = 880, ms = 60) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000 + 0.02);
}

function playStatic(ctx, ms = 140) {
  const t0 = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(ctx, Math.max(0.05, ms / 1000));
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1800, t0);
  filter.Q.setValueAtTime(0.8, t0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + ms / 1000 + 0.02);
}

class Logger {
  constructor(listEl, { hint } = {}) {
    this.listEl = listEl;
    this.t = (k) => k;
    this._lastNewEl = null;
    this._lastNewTimer = null;
    this.hint = typeof hint === "function" ? hint : () => {};
  }

  setTranslator(t) {
    this.t = t;
  }

  add({ who, msg, badge }) {
    if (!this.listEl) return;
    const li = document.createElement("li");

    const meta = document.createElement("div");
    meta.className = "meta";

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.gap = "8px";
    left.style.alignItems = "center";

    const whoEl = document.createElement("div");
    whoEl.className = "who";
    whoEl.textContent = who;

    left.appendChild(whoEl);
    if (badge) {
      const badgeEl = document.createElement("span");
      badgeEl.className = "badge";
      badgeEl.textContent = badge;
      left.appendChild(badgeEl);
    }

    const ts = document.createElement("div");
    ts.className = "ts";
    ts.textContent = nowTime();

    meta.appendChild(left);
    meta.appendChild(ts);

    const body = document.createElement("div");
    body.className = "msg";
    body.textContent = msg;

    li.appendChild(meta);
    li.appendChild(body);
    this.listEl.appendChild(li);

    if (this._lastNewEl) this._lastNewEl.classList.remove("is-new");
    li.classList.add("is-new");
    this._lastNewEl = li;
    clearTimeout(this._lastNewTimer);
    this._lastNewTimer = setTimeout(() => {
      li.classList.remove("is-new");
    }, 4500);

    while (this.listEl.children.length > LIMITS.maxLog) {
      this.listEl.removeChild(this.listEl.firstChild);
    }

    this.listEl.scrollTop = this.listEl.scrollHeight;
  }

  system(msg, badge = null) {
    if (msg) this.hint(String(msg));
    this.add({ who: "Walkie", msg, badge: badge ?? this.t("log_system") });
  }

  error(msg) {
    if (msg) this.hint(String(msg));
    this.add({ who: this.t("log_error"), msg, badge: this.t("log_warn") });
  }
}

class AudioRecorder {
  constructor({ logger }) {
    this.logger = logger;
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.stopTimer = null;
  }

  async ensureReady() {
    if (this.stream && this.mediaRecorder) return;

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const preferredTypes = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
    ];
    const options = {};
    for (const t of preferredTypes) {
      if (window.MediaRecorder?.isTypeSupported?.(t)) {
        options.mimeType = t;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
  }

  async start() {
    await this.ensureReady();
    if (this.mediaRecorder.state !== "inactive") return;

    this.chunks = [];
    this.mediaRecorder.start();

    clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => {
      this.stop().catch(() => {});
    }, LIMITS.maxMs);
  }

  async stop() {
    clearTimeout(this.stopTimer);
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive")
      return null;

    const blob = await new Promise((resolve) => {
      const onStop = () => {
        this.mediaRecorder.removeEventListener("stop", onStop);
        resolve(
          new Blob(this.chunks, {
            type: this.mediaRecorder.mimeType || "audio/webm",
          })
        );
      };
      this.mediaRecorder.addEventListener("stop", onStop);
      this.mediaRecorder.stop();
    });

    this.chunks = [];
    if (blob.size > LIMITS.maxBytes) {
      this.logger.error(this.logger.t("err_audio_long"));
      return null;
    }

    return blob;
  }
}

class WalkieApp {
  constructor() {
    this.senderId = getOrCreateSenderId();
    this.sessionId =
      crypto?.randomUUID?.() ??
      `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    this.els = {
      status: $("#status"),
      statusText: $("#statusText"),
      username: $("#username"),
      channel: $("#channel"),
      channelAlt: $("#channelAlt"),
      broker: $("#broker"),
      log: $maybe("#log"),
      ptt: $("#ptt"),
      pttOnetouch: $("#pttOnetouch"),
      channelBadge: $("#channelBadge"),
      lang: $("#lang"),
      usersCount: $maybe("#usersCount"),
      usersPill: $maybe("#usersPill"),
      speakerName: $maybe("#speakerName"),
      speakerPill: $maybe("#speakerPill"),
      dial: $("#dial"),
      channelValue: $("#channelValue"),
      dialKnob: $("#dialKnob"),
      screen: $("#screen"),
      screenChannel: $("#screenChannel"),
      screenUsers: $("#screenUsers"),
      screenSpeaker: $("#screenSpeaker"),
      screenHint: $("#screenHint"),
      callModal: $("#callModal"),
      callModalClose: $("#callModalClose"),
      callModalBody: $("#callModalBody"),
      usersList: $("#usersList"),
    };

    this.i18n = makeTranslator();
    this._hintTimer = null;
    this.logger = new Logger(this.els.log, { hint: (m) => this.setHint(m) });
    this.logger.setTranslator(this.i18n.t);
    this.recorder = new AudioRecorder({ logger: this.logger });
    this.audioGate = new AudioGate();
    this.pendingAudio = null;

    this.client = null;
    this.connected = false;
    this.topic = "";
    this.presenceTopicBase = "";
    this.presenceKey = "";
    this.presence = new Map(); // senderId -> { ts:number, from:string }
    this.presenceTimer = null;
    this.pruneTimer = null;
    this._subscribedPresenceTopic = "";

    this.recording = false;
    this.keyHeld = false;
    this._subscribedTopic = "";

    this.oneTouchActive = false;
    this.callModeActive = false;
    this.activeCallPartner = null;

    // Sistema de llamadas
    this.callState = "idle"; // idle, outgoing, incoming, active
    this.callPartnerId = null;
    this.callPartnerName = null;
    this.callStartTime = null;
    this.callTimer = null;
    this.callTimeoutTimer = null;
    this.callRingInterval = null;
  }

  setHint(text, ms = 2200) {
    if (!this.els.screenHint) return;
    clearTimeout(this._hintTimer);
    this.els.screenHint.textContent = String(text || "");
    if (!text) return;
    this._hintTimer = setTimeout(() => {
      this.els.screenHint.textContent = "";
    }, ms);
  }

  init() {
    const storedBroker =
      localStorage.getItem("walkie.brokerUrl") ?? DEFAULTS.brokerUrl;
    const storedChannel =
      localStorage.getItem("walkie.channel") ??
      localStorage.getItem("walkie.room") ??
      DEFAULTS.channel;
    const storedUsername =
      localStorage.getItem("walkie.username") ?? DEFAULTS.username;

    this.els.broker.value = storedBroker;
    this.els.channel.value = normalizeChannel(storedChannel);
    this.els.username.value = storedUsername;

    this.els.lang.value = this.i18n.getLang();
    applyTranslations(this.i18n.t);
    this.updateStatus("bad", this.i18n.t("status_connecting"));

    this.updateRoomUi();
    this.updateDialUi();
    this.wireUi();
    this.connect();
  }

  wireUi() {
    const unlockOnce = async () => {
      await this.audioGate.unlock();
      if (this.pendingAudio) {
        const audio = this.pendingAudio;
        this.pendingAudio = null;
        this.playAudioDataUrl(audio).catch(() => {});
      }
    };

    document.addEventListener("pointerdown", unlockOnce, { once: true });
    document.addEventListener("keydown", unlockOnce, { once: true });

    const applyChannel = (next, { noisy = false } = {}) => {
      const normalized = normalizeChannel(next);
      const prev = this.els.channel.value;
      if (prev === normalized) return;
      this.els.channel.value = normalized;
      if (this.els.channelAlt) this.els.channelAlt.value = normalized;
      localStorage.setItem("walkie.channel", normalized);
      this.updateRoomUi();
      this.updateDialUi();
      this.subscribe();
      this.subscribePresence();
      this.publishPresence(false);
      if (noisy && this.audioGate.ctx) playClick(this.audioGate.ctx);
    };

    this.els.lang.addEventListener("change", () => {
      this.i18n.setLang(this.els.lang.value);
      this.updateRoomUi();
      this.updateStatus(
        this.connected ? "ok" : "bad",
        this.connected
          ? this.i18n.t("status_online")
          : this.i18n.t("status_offline")
      );
    });

    // Abrir modal de usuarios al pulsar el contador de usuarios
    this.els.screenUsers.addEventListener("click", () => {
      this.openCallModal();
    });

    this.els.callModalClose.addEventListener("click", () => {
      this.closeCallModal();
    });

    this.els.callModal
      .querySelector(".modalBackdrop")
      .addEventListener("click", () => {
        this.closeCallModal();
      });

    this.els.username.addEventListener("input", () => {
      localStorage.setItem(
        "walkie.username",
        clampStr(this.els.username.value, 24)
      );
    });

    this.els.channel.addEventListener("input", () => {
      applyChannel(this.els.channel.value);
    });

    // Potentiometer interactions (drag / wheel / keyboard)
    if (this.els.dialKnob) {
      let startY = 0;
      let startValue = 1;
      let accum = 0;
      let stepPx = 6;

      this.els.dialKnob.addEventListener("pointerdown", async (e) => {
        e.preventDefault();
        await this.audioGate.unlock();
        this.els.dialKnob.focus();
        try {
          this.els.dialKnob.setPointerCapture(e.pointerId);
        } catch {}
        startY = e.clientY;
        startValue =
          Number.parseInt(normalizeChannel(this.els.channel.value), 10) || 1;
        accum = 0;

        const coarse =
          e.pointerType === "touch" ||
          window.matchMedia?.("(pointer: coarse)")?.matches;
        stepPx = coarse ? 3 : 6;
      });

      this.els.dialKnob.addEventListener("pointermove", (e) => {
        if (e.buttons === 0) return;
        const dy = startY - e.clientY;
        accum += dy;
        startY = e.clientY;

        const steps = Math.trunc(accum / stepPx);
        if (steps === 0) return;
        accum -= steps * stepPx;
        applyChannel(startValue + steps, { noisy: true });
        startValue =
          Number.parseInt(normalizeChannel(this.els.channel.value), 10) ||
          startValue;
      });

      this.els.dialKnob.addEventListener(
        "wheel",
        async (e) => {
          e.preventDefault();
          await this.audioGate.unlock();
          const cur =
            Number.parseInt(normalizeChannel(this.els.channel.value), 10) || 1;
          const dir = e.deltaY > 0 ? -1 : 1;
          applyChannel(cur + dir, { noisy: true });
        },
        { passive: false }
      );

      this.els.dialKnob.addEventListener("keydown", async (e) => {
        const keys = [
          "ArrowUp",
          "ArrowRight",
          "ArrowDown",
          "ArrowLeft",
          "Home",
          "End",
          "PageUp",
          "PageDown",
        ];
        if (!keys.includes(e.key)) return;
        e.preventDefault();
        await this.audioGate.unlock();

        const cur =
          Number.parseInt(normalizeChannel(this.els.channel.value), 10) || 1;
        let next = cur;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") next = cur + 1;
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = cur - 1;
        if (e.key === "PageUp") next = cur + 10;
        if (e.key === "PageDown") next = cur - 10;
        if (e.key === "Home") next = 1;
        if (e.key === "End") next = 100;
        applyChannel(next, { noisy: true });
      });
    }

    if (this.els.channelAlt) {
      this.els.channelAlt.addEventListener("input", () => {
        applyChannel(this.els.channelAlt.value, { noisy: true });
      });
    }

    this.els.broker.addEventListener("change", () => {
      const url = clampStr(this.els.broker.value, 180) || DEFAULTS.brokerUrl;
      this.els.broker.value = url;
      localStorage.setItem("walkie.brokerUrl", url);
      this.connect(true);
    });

    this.els.ptt.addEventListener("pointerdown", (e) => this.onPressStart(e));
    this.els.ptt.addEventListener("pointerup", () => this.onPressEnd());
    this.els.ptt.addEventListener("pointercancel", () => this.onPressEnd());
    this.els.ptt.addEventListener("lostpointercapture", () =>
      this.onPressEnd()
    );

    // Lock toggle button (mobile only)
    this.els.pttOnetouch.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.oneTouchActive) {
        if (e.shiftKey || e.touches?.length > 1) {
          // Long press / doble touch: Modo llamada
          this.callModeActive = true;
          this.els.pttOnetouch.querySelector("i").className =
            "fa-solid fa-phone-volume";
        } else {
          // Click normal: Desactivar
          this.oneTouchActive = false;
          this.callModeActive = false;
          this.els.pttOnetouch.dataset.active = "0";
          this.els.pttOnetouch.querySelector("i").className =
            "fa-solid fa-lock-open";
          this.onPressEnd();
        }
      } else {
        this.oneTouchActive = true;
        this.callModeActive = false;
        this.els.pttOnetouch.dataset.active = "1";
        this.els.pttOnetouch.querySelector("i").className = "fa-solid fa-lock";
        this.onPressStart(e);
      }
    });

    // If normal PTT is released while one touch is active, keep recording
    const originalOnPressEnd = this.onPressEnd.bind(this);
    this.onPressEnd = () => {
      if (this.oneTouchActive) return;
      originalOnPressEnd();
    };

    window.addEventListener("keydown", (e) => {
      if (e.code !== "Space") return;
      if (this.isTypingContext(e.target)) return;
      if (this.keyHeld) return;
      this.keyHeld = true;
      e.preventDefault();
      this.onPressStart(e);
    });
    window.addEventListener("keyup", (e) => {
      if (e.code !== "Space") return;
      if (this.isTypingContext(e.target)) return;
      this.keyHeld = false;
      e.preventDefault();
      this.onPressEnd();
    });
  }

  isTypingContext(target) {
    const el = target instanceof Element ? target : null;
    if (!el) return false;
    if (el.closest("input, textarea, select")) return true;
    if (el.closest("[contenteditable='true']")) return true;
    return false;
  }

  updateStatus(state, text) {
    this.els.status.dataset.state = state;
    this.els.statusText.textContent = text;
  }

  updateRoomUi() {
    const channel = normalizeChannel(this.els.channel.value);
    this.topic = `walkie/v1/channel/${channel}`;
    this.presenceTopicBase = `walkie/v1/channel/${channel}/presence`;
    this.presenceKey = `${this.presenceTopicBase}/${this.senderId}`;
    this.els.channelBadge.textContent = `${this.i18n.t(
      "channel_badge_prefix"
    )}: ${channel}`;
    this.els.screenChannel.textContent = String(channel);
    this.updatePresenceUi();
  }

  updateDialUi() {
    const channel =
      Number.parseInt(normalizeChannel(this.els.channel.value), 10) || 1;
    if (this.els.channelValue)
      this.els.channelValue.textContent = String(channel);
    if (this.els.channelAlt) this.els.channelAlt.value = String(channel);

    if (this.els.dialKnob) {
      this.els.dialKnob.setAttribute("aria-valuenow", String(channel));
      const label = this.i18n.getLang() === "es" ? "Canal" : "Channel";
      this.els.dialKnob.setAttribute("aria-valuetext", `${label} ${channel}`);
    }

    // 1..100 => -120..+120 degrees
    const min = 1;
    const max = 100;
    const t = (channel - min) / (max - min);
    const deg = (-120 + t * 240).toFixed(2);
    if (this.els.dial)
      this.els.dial.style.setProperty("--dial-angle", `${deg}deg`);
  }

  connect(isReconnect = false) {
    if (!window.mqtt) {
      this.logger.error(this.i18n.t("err_mqtt_missing"));
      return;
    }

    const url = this.els.broker.value || DEFAULTS.brokerUrl;

    if (this.client) {
      try {
        this.client.end(true);
      } catch {}
      this.client = null;
    }

    this.connected = false;
    this.setPttEnabled(false);
    this.updateStatus("bad", this.i18n.t("status_connecting"));
    if (isReconnect) this.logger.system(this.i18n.t("sys_reconnecting"));

    this.client = mqtt.connect(url, {
      reconnectPeriod: 1000,
      connectTimeout: 10_000,
      keepalive: 30,
      clean: true,
      clientId: `walkie_${this.senderId.slice(0, 8)}_${this.sessionId.slice(
        0,
        6
      )}`,
    });

    this.client.on("connect", () => {
      this.connected = true;
      this.updateStatus("ok", this.i18n.t("status_online"));
      this.logger.system(this.i18n.t("sys_connected"));
      this.subscribe();
      this.subscribePresence();
      this.startPresenceLoop();
      this.setPttEnabled(true);
    });

    this.client.on("reconnect", () => {
      this.updateStatus("bad", this.i18n.t("status_reconnecting"));
    });

    this.client.on("close", () => {
      this.connected = false;
      this.setPttEnabled(false);
      this.updateStatus("bad", this.i18n.t("status_offline"));
      this.stopPresenceLoop();
    });

    this.client.on("error", (err) => {
      this.logger.error(
        err?.message
          ? `${this.i18n.t("err_mqtt_prefix")} ${err.message}`
          : this.i18n.t("log_error")
      );
    });

    this.client.on("message", (topic, payload) =>
      this.onMessage(topic, payload)
    );
  }

  subscribe() {
    if (!this.client || !this.connected) return;
    this.updateRoomUi();

    const newTopic = this.topic;
    const previous = this._subscribedTopic;
    if (previous && previous !== newTopic) {
      try {
        this.client.unsubscribe(previous);
      } catch {}
    }

    this.client.subscribe(newTopic, (err) => {
      if (err) {
        this.logger.error(this.i18n.t("err_subscribe"));
        return;
      }
      this._subscribedTopic = newTopic;
      this.logger.system(
        `${this.i18n.t("sys_listening")} ${newTopic}`,
        this.els.channelBadge.textContent
      );
    });
  }

  subscribePresence() {
    if (!this.client || !this.connected) return;
    this.updateRoomUi();

    // Suscribirse a presencia
    const pattern = `${this.presenceTopicBase}/+`;
    const previous = this._subscribedPresenceTopic;
    if (previous && previous !== pattern) {
      try {
        this.client.unsubscribe(previous);
      } catch {}
    }

    this.client.subscribe(pattern, (err) => {
      if (err) {
        this.logger.error(this.i18n.t("err_subscribe"));
        return;
      }
      this._subscribedPresenceTopic = pattern;
      this.updatePresenceUi();
    });

    // ✅ SUSCRIBIRSE A TEMAS DE LLAMADAS PROPIOS
    const callPattern = `${this.presenceTopicBase}/call/${this.senderId}`;
    this.client.subscribe(callPattern, (err) => {
      if (err) {
        this.logger.error(`Error suscribiendose a llamadas: ${err}`);
        return;
      }
      this.logger.system(`Sistema de llamadas activo ✓`);
    });
  }

  startPresenceLoop() {
    this.stopPresenceLoop();
    this.publishPresence(true);

    this.presenceTimer = setInterval(() => {
      this.publishPresence(false);
    }, PRESENCE.heartbeatMs);

    this.pruneTimer = setInterval(() => {
      this.prunePresence();
    }, 1500);

    window.addEventListener("beforeunload", this._beforeUnloadPresence, {
      once: true,
    });
  }

  stopPresenceLoop() {
    clearInterval(this.presenceTimer);
    clearInterval(this.pruneTimer);
    this.presenceTimer = null;
    this.pruneTimer = null;
  }

  _beforeUnloadPresence = () => {
    try {
      this.clearPresenceRetained();
    } catch {}
  };

  publishPresence(forceLog = false) {
    if (!this.client || !this.connected || !this.presenceKey) return;
    const username = clampStr(this.els.username.value || "anon", 24) || "anon";

    const payload = JSON.stringify({
      v: 1,
      senderId: this.senderId,
      from: username,
      ts: Date.now(),
    });

    try {
      this.client.publish(this.presenceKey, payload, { retain: true });
      this.presence.set(this.senderId, { ts: Date.now(), from: username });
      this.updatePresenceUi();
      if (forceLog)
        this.logger.system(
          `Presencia: ${username}`,
          this.els.channelBadge.textContent
        );
    } catch {}
  }

  clearPresenceRetained() {
    if (!this.client || !this.presenceKey) return;
    try {
      this.client.publish(this.presenceKey, "", { retain: true });
    } catch {}
  }

  prunePresence() {
    const now = Date.now();
    for (const [id, info] of this.presence.entries()) {
      if (!info?.ts || now - info.ts > PRESENCE.ttlMs) {
        this.presence.delete(id);
      }
    }
    this.updatePresenceUi();
  }

  publishCallPresence(state) {
    if (!this.client || !this.connected) return;

    const callTopic = `${this.presenceTopicBase}/call/${this.senderId}`;

    this.client.publish(
      callTopic,
      JSON.stringify({
        state,
        from: clampStr(this.els.username.value || "anon", 24),
        ts: Date.now(),
      }),
      { retain: state === "active" }
    );
  }

  openCallModal() {
    this.els.usersList.innerHTML = "";

    this.presence.forEach((info, id) => {
      if (id === this.senderId) return; // No mostrarse a si mismo

      const item = document.createElement("div");
      item.className = "userItem";

      item.innerHTML = `
        <span>${info.from}</span>
        <button class="userCallBtn" data-user-id="${id}">
          <i class="fa-solid fa-phone"></i>
        </button>
      `;

      this.els.usersList.appendChild(item);
    });

    if (this.els.usersList.children.length === 0) {
      this.els.usersList.innerHTML =
        '<div style="text-align:center; opacity:.6; padding:20px;">No hay usuarios conectados</div>';
    }

    this.els.callModal.setAttribute("aria-hidden", "false");

    // Añadir eventos a botones de llamada
    document.querySelectorAll(".userCallBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const userId = btn.dataset.userId;
        this.closeCallModal();
        this.initiateCall(userId);
      });
    });
  }

  closeCallModal() {
    this.els.callModal.setAttribute("aria-hidden", "true");
  }

  // ========== SISTEMA DE LLAMADAS ==========

  initiateCall(userId) {
    if (this.callState !== "idle") return;

    const user = this.presence.get(userId);
    if (!user) return;

    this.callState = "outgoing";
    this.callPartnerId = userId;
    this.callPartnerName = user.from;

    this.setHint(this.i18n.t("call_outgoing") + ` ${user.from}`);
    this.logger.system(`${this.i18n.t("call_outgoing")} ${user.from}`);

    // Enviar solicitud de llamada
    this.sendCallMessage(userId, "request");

    // Timeout 30 segundos
    this.callTimeoutTimer = setTimeout(() => {
      this.endCall("timeout");
    }, 30000);

    // Sonido de llamada saliente
    this.playRingTone(true);
  }

  handleIncomingCall(fromId, fromName) {
    if (this.callState !== "idle") {
      // Ya estamos en llamada, rechazar automaticamente
      this.sendCallMessage(fromId, "busy");
      return;
    }

    this.callState = "incoming";
    this.callPartnerId = fromId;
    this.callPartnerName = fromName;

    // Mostrar modal de llamada entrante
    this.showIncomingCallModal(fromName);

    // Sonido de llamada entrante
    this.playRingTone(false);

    this.logger.system(`${this.i18n.t("call_incoming")}: ${fromName}`);

    // Timeout 30 segundos
    this.callTimeoutTimer = setTimeout(() => {
      this.endCall("timeout");
    }, 30000);
  }

  acceptCall() {
    if (this.callState !== "incoming") return;

    clearTimeout(this.callTimeoutTimer);
    this.stopRingTone();
    this.hideIncomingCallModal();

    this.callState = "active";
    this.callStartTime = Date.now();

    this.sendCallMessage(this.callPartnerId, "accept");
    this.logger.system(this.i18n.t("call_connected"));

    // ✅ Mostrar INTERFAZ DE LLAMADA ACTIVA
    this.showActiveCallScreen();

    // ✅ AMBOS lados activan MODO LLAMADA FULL DUPLEX
    this.oneTouchActive = true;
    this.callModeActive = true;
    this.els.pttOnetouch.dataset.active = "1";
    this.els.pttOnetouch.querySelector("i").className =
      "fa-solid fa-phone-volume";

    // Iniciar transmisión CONTINUA automaticamente
    this.onPressStart(null);

    // Iniciar contador de tiempo
    this.startCallTimer();
  }

  rejectCall() {
    if (this.callState !== "incoming") return;

    clearTimeout(this.callTimeoutTimer);
    this.stopRingTone();

    this.sendCallMessage(this.callPartnerId, "reject");
    this.logger.system(`${this.i18n.t("call_reject")} ${this.callPartnerName}`);

    this.resetCallState();
  }

  endCall(reason = "user") {
    clearTimeout(this.callTimeoutTimer);
    this.stopRingTone();
    this.stopCallTimer();

    if (this.callState === "active") {
      // Desactivar modo llamada
      this.oneTouchActive = false;
      this.callModeActive = false;
      this.els.pttOnetouch.dataset.active = "0";
      this.els.pttOnetouch.querySelector("i").className =
        "fa-solid fa-lock-open";
      this.onPressEnd();
    }

    if (this.callPartnerId && this.callState !== "idle") {
      this.sendCallMessage(this.callPartnerId, "end");
    }

    let message = this.i18n.t("call_ended");
    if (reason === "timeout") message = this.i18n.t("call_timeout");
    if (reason === "no_answer") message = this.i18n.t("call_no_answer");

    this.logger.system(message);
    this.setHint(message);

    this.resetCallState();
  }

  resetCallState() {
    this.callState = "idle";
    this.callPartnerId = null;
    this.callPartnerName = null;
    this.callStartTime = null;

    this.hideIncomingCallModal();
    this.hideActiveCallScreen();
  }

  sendCallMessage(targetId, type) {
    if (!this.client || !this.connected) return;

    const topic = `${this.presenceTopicBase}/call/${targetId}`;
    const username = clampStr(this.els.username.value || "anon", 24);

    const payload = JSON.stringify({
      type,
      fromId: this.senderId,
      from: username,
      ts: Date.now(),
    });

    this.client.publish(topic, payload);
  }

  playRingTone(isOutgoing) {
    if (!this.audioGate.ctx) return;

    let beepCount = 0;
    this.callRingInterval = setInterval(
      () => {
        if (isOutgoing) {
          // Tono llamada saliente: beep cada 2s
          playBeep(this.audioGate.ctx, 440, 100);
        } else {
          // Tono llamada entrante: doble beep
          playBeep(this.audioGate.ctx, 880, 150);
          setTimeout(() => playBeep(this.audioGate.ctx, 880, 150), 200);
        }
        beepCount++;
      },
      isOutgoing ? 2000 : 1500
    );
  }

  stopRingTone() {
    if (this.callRingInterval) {
      clearInterval(this.callRingInterval);
      this.callRingInterval = null;
    }
  }

  startCallTimer() {
    this.callTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      this.setHint(`${this.callPartnerName} · ${timeStr}`, 1500);
    }, 1000);
  }

  stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
  }

  showIncomingCallModal(fromName) {
    // Implementacion modal llamada entrante
    const modal = document.createElement("div");
    modal.id = "incomingCallModal";
    modal.className = "callModalOverlay";
    modal.innerHTML = `
      <div class="callModal">
        <div class="callAvatar">
          <i class="fa-solid fa-user fa-3x"></i>
        </div>
        <div class="callName">${fromName}</div>
        <div class="callStatus">${this.i18n.t("call_incoming")}</div>
        <div class="callActions">
          <button class="callBtn rejectBtn" id="rejectCallBtn">
            <i class="fa-solid fa-phone-slash"></i>
          </button>
          <button class="callBtn acceptBtn" id="acceptCallBtn">
            <i class="fa-solid fa-phone"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("acceptCallBtn")
      .addEventListener("click", () => this.acceptCall());
    document
      .getElementById("rejectCallBtn")
      .addEventListener("click", () => this.rejectCall());
  }

  hideIncomingCallModal() {
    const modal = document.getElementById("incomingCallModal");
    if (modal) modal.remove();
  }

  showActiveCallScreen() {
    // ✅ INTERFAZ DE LLAMADA ACTIVA - IGUAL PARA AMBOS USUARIOS
    const activeCall = document.createElement("div");
    activeCall.id = "activeCallScreen";
    activeCall.className = "callModalOverlay activeCallScreen";

    activeCall.innerHTML = `
      <div class="callModal">
        <div class="callAvatar activeCallAvatar">
          <i class="fa-solid fa-user fa-3x"></i>
        </div>
        <div class="callName">${this.callPartnerName}</div>
        <div class="callTimer" id="callTimerDisplay">00:00</div>
        
        <div style="margin-top: 60px;">
          <button class="callBtn hangupBtn" id="hangupCallBtn">
            <i class="fa-solid fa-phone-slash"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(activeCall);

    document.getElementById("hangupCallBtn").addEventListener("click", () => {
      this.endCall();
    });

    // Actualizar timer en tiempo real en la interfaz
    setInterval(() => {
      if (this.callState !== "active") return;
      const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      document.getElementById("callTimerDisplay").textContent = timeStr;
    }, 1000);
  }

  hideActiveCallScreen() {
    const screen = document.getElementById("activeCallScreen");
    if (screen) screen.remove();
  }

  updatePresenceUi() {
    const count = Math.max(1, this.presence.size || 1);
    if (this.els.usersCount) this.els.usersCount.textContent = String(count);
    this.els.screenUsers.textContent = String(count);
  }

  setSpeaker(name) {
    const who = clampStr(name || "", 24) || this.i18n.t("speaker_idle");
    if (this.els.speakerName) this.els.speakerName.textContent = who;
    this.els.screenSpeaker.textContent = who;
    this.els.screen.classList.add("speaking");
    clearTimeout(this._speakerTimer);
    this._speakerTimer = setTimeout(() => {
      if (this.els.speakerName)
        this.els.speakerName.textContent = this.i18n.t("speaker_idle");
      this.els.screenSpeaker.textContent = this.i18n.t("speaker_idle");
      this.els.screen.classList.remove("speaking");
    }, 3200);
  }

  onMessage(topic, payload) {
    const topicStr = String(topic || "");

    // Detectar mensajes de llamada
    if (topicStr.includes(`/call/${this.senderId}`)) {
      const data = safeJsonParse(payload.toString());
      if (!data || !data.fromId || !data.type) return;

      if (data.fromId === this.senderId) return;

      switch (data.type) {
        case "request":
          this.handleIncomingCall(data.fromId, data.from);
          break;
        case "accept":
          if (this.callState === "outgoing") {
            clearTimeout(this.callTimeoutTimer);
            this.stopRingTone();
            this.callState = "active";
            this.callStartTime = Date.now();

            // ✅ Mostrar INTERFAZ DE LLAMADA ACTIVA
            this.showActiveCallScreen();

            // ✅ AMBOS lados activan MODO LLAMADA FULL DUPLEX
            this.oneTouchActive = true;
            this.callModeActive = true;
            this.els.pttOnetouch.dataset.active = "1";
            this.els.pttOnetouch.querySelector("i").className =
              "fa-solid fa-phone-volume";

            // Iniciar transmisión CONTINUA automaticamente
            this.onPressStart(null);

            this.startCallTimer();
            this.logger.system(this.i18n.t("call_connected"));
          }
          break;
        case "reject":
          if (this.callState === "outgoing") {
            clearTimeout(this.callTimeoutTimer);
            this.stopRingTone();
            this.logger.system(`${this.i18n.t("call_reject")} ${data.from}`);
            this.setHint(`${this.i18n.t("call_reject")}`);
            this.resetCallState();
          }
          break;
        case "end":
          if (this.callState !== "idle") {
            this.endCall();
          }
          break;
        case "busy":
          if (this.callState === "outgoing") {
            clearTimeout(this.callTimeoutTimer);
            this.stopRingTone();
            this.logger.system(`${data.from} ${this.i18n.t("call_busy")}`);
            this.setHint(`${data.from} esta ocupado`);
            this.resetCallState();
          }
          break;
      }
      return;
    }

    if (
      this.presenceTopicBase &&
      topicStr.startsWith(`${this.presenceTopicBase}/`)
    ) {
      const text = payload?.toString?.() ?? "";
      if (!text) {
        const id = topicStr.split("/").pop();
        if (id) this.presence.delete(id);
        this.updatePresenceUi();
        return;
      }

      const data = safeJsonParse(text);
      if (!data || typeof data !== "object") return;
      if (data.senderId && data.senderId === this.senderId) return;
      if (!data.senderId || typeof data.senderId !== "string") return;

      const from = clampStr(data.from || "anon", 24);
      const ts = typeof data.ts === "number" ? data.ts : Date.now();
      this.presence.set(data.senderId, { ts, from });
      this.updatePresenceUi();
      return;
    }

    const text = payload?.toString?.() ?? "";
    const data = safeJsonParse(text);
    if (!data || typeof data !== "object") return;
    if (data.senderId && data.senderId === this.senderId) return;

    const from = clampStr(data.from || "anon", 24);
    const audio = data.audio;
    if (typeof audio !== "string" || !audio.startsWith("data:audio/")) return;

    if (this.audioGate.ctx) playStatic(this.audioGate.ctx, 120);
    this.playAudioDataUrl(audio).catch(() => {});
    this.setSpeaker(from);

    this.logger.add({
      who: from,
      msg: this.i18n.t("log_voice_received"),
      badge: this.els.channelBadge.textContent,
    });
  }

  async playAudioDataUrl(dataUrl) {
    const audioEl = new Audio(dataUrl);
    audioEl.preload = "auto";

    const mimeFull = getDataUrlMimeFull(dataUrl); // e.g. "audio/webm;codecs=opus"
    if (mimeFull) {
      const base = mimeFull.split(";")[0];
      const can =
        audioEl.canPlayType(mimeFull) ||
        (base ? audioEl.canPlayType(base) : "");
      if (!can) {
        // No bloqueamos: algunos navegadores devuelven "" pero luego reproducen OK.
        this.logger.system(
          `${this.i18n.t("err_audio_unsupported")} (${mimeFull})`
        );
      }
    }

    try {
      await audioEl.play();
    } catch (err) {
      const name = err?.name || "";
      const msg = String(err?.message || "");
      const blocked =
        name === "NotAllowedError" ||
        (/user/i.test(msg) && /interact|gesture/i.test(msg)) ||
        /not allowed/i.test(msg);

      if (blocked) {
        this.pendingAudio = dataUrl;
        this.logger.system(this.i18n.t("sys_audio_received_tap"));
        return;
      }

      this.logger.error(this.i18n.t("err_audio_play"));
    }
  }

  setPttEnabled(enabled) {
    this.els.ptt.disabled = !enabled;
    this.els.ptt.setAttribute("aria-disabled", String(!enabled));
    this.els.pttOnetouch.disabled = !enabled;
    this.els.pttOnetouch.setAttribute("aria-disabled", String(!enabled));

    if (!enabled) {
      this.oneTouchActive = false;
      this.callModeActive = false;
      this.activeCallPartner = null;
      this.publishCallPresence("end");
      this.els.pttOnetouch.dataset.active = "0";
    }
  }

  async onPressStart(e) {
    if (this.recording) return;
    if (!this.connected || !this.client) return;

    this.recording = true;
    this.els.ptt.dataset.rec = "1";
    this.els.ptt.setAttribute("aria-pressed", "true");

    try {
      if (e?.pointerId != null && this.els.ptt.setPointerCapture) {
        try {
          this.els.ptt.setPointerCapture(e.pointerId);
        } catch {}
      }

      await this.audioGate.unlock();
      if (this.audioGate.ctx) {
        playClick(this.audioGate.ctx);
        playBeep(this.audioGate.ctx, 920, 55);
      }
      await this.recorder.start();
    } catch (err) {
      this.recording = false;
      this.els.ptt.dataset.rec = "0";
      this.els.ptt.setAttribute("aria-pressed", "false");

      const msg =
        err?.name === "NotAllowedError"
          ? this.i18n.t("err_mic_denied")
          : err?.message || this.i18n.t("err_mic_start");
      this.logger.error(msg);
    }
  }

  async onPressEnd() {
    if (!this.recording) return;
    this.recording = false;

    this.els.ptt.dataset.rec = "0";
    this.els.ptt.setAttribute("aria-pressed", "false");

    const blob = await this.recorder.stop();

    // Modo llamada: transmisión continua full duplex
    if (this.oneTouchActive && this.callModeActive) {
      // Anunciar que estamos en llamada
      this.publishCallPresence("active");

      // Seguir grabando automaticamente sin parar
      setTimeout(() => this.onPressStart(null), 30);
    }

    if (!blob) return;

    const username = clampStr(this.els.username.value || "anon", 24);
    localStorage.setItem(
      "walkie.username",
      username === "anon" ? "" : username
    );

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(this.i18n.t("err_audio_read")));
      reader.readAsDataURL(blob);
    });

    const message = {
      v: 1,
      senderId: this.senderId,
      from: username || "anon",
      ts: Date.now(),
      audio: dataUrl,
    };

    try {
      this.client.publish(this.topic, JSON.stringify(message));
      this.logger.add({
        who: username || "anon",
        msg: this.i18n.t("log_sent"),
        badge: this.els.channelBadge.textContent,
      });
      if (this.audioGate.ctx) playClick(this.audioGate.ctx);
    } catch (err) {
      this.logger.error(err?.message || this.i18n.t("err_send"));
    }
  }
}

const app = new WalkieApp();
window.addEventListener("DOMContentLoaded", () => app.init());
