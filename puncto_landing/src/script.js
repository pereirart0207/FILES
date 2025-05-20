const typeText = (elementId, text) => {
  const outputElement = document.getElementById(elementId); // Get the element where the text will appear
  let index = 0; // Variable to keep track of the text position
  const speed = 100; // Speed of each character in milliseconds

  // Function that adds one character at a time
  const type = () => {
    if (index < text.length) {
      outputElement.textContent += text.charAt(index); // Add one letter to the text
      index++;
      setTimeout(type, speed); // Recursively call to add the next character
    }
  };

  type();
};

const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else {
    console.error(`No se encontró un elemento con el ID: ${elementId}`);
  }
};
/*
document.addEventListener("DOMContentLoaded", () => {
  typeText("slogan", "> Haz que el fichaje deje de ser un problema");
});
*/
// Efecto de escritura para el slogan
const slogans = [
  "Control de fichaje inteligente",
  "Integración con tus plataformas",
  "Tecnología al servicio de RRHH",
];

let currentSlogan = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeSlogan() {
  const sloganElement = document.getElementById("slogan");
  const currentText = slogans[currentSlogan];

  if (isDeleting) {
    sloganElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;
  } else {
    sloganElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;
  }

  if (!isDeleting && charIndex === currentText.length) {
    isDeleting = true;
    typingSpeed = 1500; // Pausa al final
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    currentSlogan = (currentSlogan + 1) % slogans.length;
    typingSpeed = 500; // Pausa al principio
  }

  setTimeout(typeSlogan, typingSpeed);
}

// Scroll suave para enlaces
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Iniciar efectos cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  typeSlogan();

  // Efecto de aparición al hacer scroll
  const fadeElements = document.querySelectorAll(
    ".feature-card, .step, .integration-logo"
  );

  const fadeInOnScroll = function () {
    for (let i = 0; i < fadeElements.length; i++) {
      const elem = fadeElements[i];
      const distInView =
        elem.getBoundingClientRect().top - window.innerHeight + 100;

      if (distInView < 0) {
        elem.classList.add("fade-in-up");
      }
    }
  };
  window.addEventListener("scroll", fadeInOnScroll);
  fadeInOnScroll();
});
