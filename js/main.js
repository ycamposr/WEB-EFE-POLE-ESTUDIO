// main.js — Clase Gratis (Efe Pole Estudio)
// Carga dinámica de clases (JSON), Flatpickr, tickets en localStorage y envío por email

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-ticket");
  const ticketContainer = document.getElementById("ticket-generado");
  const selectClase = document.getElementById("clase");

  // ==============================
  // 1) Cargar clases desde JSON
  // ==============================
  // Desde lista_principal/clase_gratis.html la ruta correcta es ../data/clases.json
  fetch("../data/clases.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar data/clases.json");
      return res.json();
    })
    .then(({ clases }) => {
      // Limpio opciones existentes excepto el placeholder
      [...selectClase.querySelectorAll("option:not([value=''])")].forEach((o) => o.remove());

      // Agrego opciones dinámicas
      clases.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.id;                 // valor técnico
        option.dataset.nombre = c.nombre;    // nombre legible para el mail
        option.textContent = `${c.nombre} (${c.nivel} – ${c.sala})`;
        selectClase.appendChild(option);
      });
    })
    .catch((err) => {
      // Si falla el fetch, dejamos las opciones estáticas del HTML (si las hubiese)
      console.error(err);
    });

  // ==============================
  // 2) Inicializar Flatpickr
  // ==============================
  if (typeof flatpickr !== "undefined") {
    flatpickr("#fecha", {
      dateFormat: "Y-m-d",
      minDate: "today",
      locale: "es",
    });
  }

  // =========================================
  // 3) Cargar tickets guardados (localStorage)
  // =========================================
  const ticketsGuardados = JSON.parse(localStorage.getItem("tickets")) || [];
  ticketsGuardados.forEach((t) => mostrarTicket(t));

  // =========================================
  // 4) Envío del formulario (crear el ticket)
  // =========================================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();

    // Tomo el NOMBRE legible de la opción seleccionada (no el id)
    const opcionSeleccionada = selectClase.options[selectClase.selectedIndex];
    const claseNombre =
      (opcionSeleccionada && (opcionSeleccionada.dataset.nombre || opcionSeleccionada.textContent)) ||
      selectClase.value;

    const fecha = document.getElementById("fecha").value;

    if (!nombre || !claseNombre || !fecha) return;

    const ticket = {
      id: Date.now(),
      nombre,
      clase: claseNombre,
      fecha,
    };

    mostrarTicket(ticket);
    ticketsGuardados.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(ticketsGuardados));
    form.reset();
  });

  // =========================================
  // 5) Render de ticket + envío por email
  // =========================================
  function mostrarTicket(ticket) {
    const div = document.createElement("div");
    div.className = "ticket-generado tarjeta-ticket fade-in";
    div.innerHTML = `
      <h5>🎟️ Ticket generado</h5>
      <p><strong>Nombre:</strong> ${ticket.nombre}</p>
      <p><strong>Clase:</strong> ${ticket.clase}</p>
      <p><strong>Fecha:</strong> ${ticket.fecha}</p>
      <button type="button" class="btn-mail">¡Avísale a Efe!</button>
    `;

    // Evento: armar mailto dinámico y limpiar ticket
    div.querySelector(".btn-mail").addEventListener("click", () => {
      const asunto = `Reserva de clase gratis`;
      const cuerpo = `Hola! Soy ${ticket.nombre} y quiero agendar una clase gratis de ${ticket.clase} el día ${ticket.fecha}. ¿Me confirmás por favor? ¡Gracias!`;

      const mailtoLink = `mailto:campos.yanina@gmail.com?subject=${encodeURIComponent(
        asunto
      )}&body=${encodeURIComponent(cuerpo)}`;

      window.location.href = mailtoLink;

      // Animación de salida + limpieza
      div.classList.add("fade-out");

      setTimeout(() => {
        div.remove();
        mostrarConfirmacion();

        // Quitar del storage
        const idx = ticketsGuardados.findIndex((t) => t.id === ticket.id);
        if (idx !== -1) {
          ticketsGuardados.splice(idx, 1);
          localStorage.setItem("tickets", JSON.stringify(ticketsGuardados));
        }
      }, 500);
    });

    ticketContainer.appendChild(div);
  }

  // =========================================
  // 6) Mensaje de confirmación visual
  // =========================================
  function mostrarConfirmacion() {
    const mensaje = document.createElement("div");
    mensaje.className = "confirmacion-ticket";
    mensaje.textContent = "✅ Ticket enviado con éxito";
    document.body.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 3000);
  }
});
