function sendEmailFetch() {
  const serviceId = "service_mqqey1j";
  const templateId = "template_ed69o6n";
  const publicKey = "ePP1jTB0KozLmd1kF";

  const from_name = document.getElementById("firstName").value;
  const last_name = document.getElementById("lastName").value;
  const message = document.getElementById("emailMessage").value;
  const subject = document.getElementById("emailSubject").value;
  const from_email = document.getElementById("fromEmail").value;

  const templateParams = {
    from_name,
    last_name,
    message,
    subject,
    from_email,
  };

  tUI.showSpinner();
  fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Correo enviado con éxito");
        //alert("Correo enviado correctamente");
        tUI.hideSpinner();
        tUI.showNotification({
          message:
            "Notificación enviada, un miembro del equipo de soporte se pondrá en contacto con usted lo antes posible.",
          type: "success",
        });
      } else {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .catch((error) => {
      console.error("Error al enviar correo:", error);
      alert("Error al enviar correo");
    });

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("emailMessage").value = "";
  document.getElementById("emailSubject").value = "";
  document.getElementById("fromEmail").value = "";
}

const form = document.getElementById("contactForm");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  sendEmailFetch();
});
