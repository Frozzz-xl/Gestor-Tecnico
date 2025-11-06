document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM (manteniendo tus nombres)
  const form = document.getElementById("formulario");
  const clienteInput = document.getElementById("cliente");
  const equipoInput = document.getElementById("equipo");
  const descripcionInput = document.getElementById("descripcion");
  const fechaInput = document.getElementById("fecha");
  const container = document.getElementById("notas-container");

  

  // Estadísticas DOM
  const statTotal = document.getElementById("stat-total");
  const statPendiente = document.getElementById("stat-pendiente");
  const statReparada = document.getElementById("stat-reparada");
  const statEntregado = document.getElementById("stat-entregado");

  // Array de notas (se guarda en localStorage)
  let notas = JSON.parse(localStorage.getItem("notas")) || [];

  // Guardar en localStorage
  const guardarNotas = () => {
    localStorage.setItem("notas", JSON.stringify(notas));
    actualizarEstadisticas();
  };

  // Actualizar resumen estadístico
  function actualizarEstadisticas() {
    const total = notas.length;
    const pendientes = notas.filter(n => (n.estado || "pendiente") === "pendiente").length;
    const reparadas = notas.filter(n => n.estado === "reparada").length;
    const entregadas = notas.filter(n => n.estado === "entregado").length;

    statTotal.textContent = total;
    statPendiente.textContent = pendientes;
    statReparada.textContent = reparadas;
    statEntregado.textContent = entregadas;
  }

  // Renderizar todas las notas (vertical)
  function renderNotas() {
    container.innerHTML = "";
    notas.forEach((nota, index) => {
      const card = document.createElement("article");
      card.className = "nota " + (nota.estado || "pendiente");

      // contenido HTML de la tarjeta
      card.innerHTML = `
        <div class="nota-header">
          <div class="estado-label">${nota.estado}</div>
          <div class="nota-acciones" aria-hidden="false">
            <button class="btn-move-up" title="Mover arriba"><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn-move-down" title="Mover abajo"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-change" title="Cambiar estado"><i class="fa-solid fa-rotate"></i></button>
            <button class="btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>

        <p><strong>Cliente:</strong> ${escapeHtml(nota.cliente)}</p>
        <p><strong>Equipo:</strong> ${escapeHtml(nota.equipo)}</p>
        <p><strong>Problema:</strong> ${escapeHtml(nota.descripcion)}</p>
        <p><strong>Fecha:</strong> ${escapeHtml(nota.fecha)}</p>
      `;

      // Eventos de los botones (se re-renderiza tras cada cambio)
      card.querySelector(".btn-delete").addEventListener("click", () => {
        notas.splice(index, 1);
        guardarNotas();
        renderNotas();
      });

      card.querySelector(".btn-change").addEventListener("click", () => {
        const estados = ["pendiente", "reparada", "entregado"];
        const actual = estados.indexOf(nota.estado);
        nota.estado = estados[(actual + 1) % estados.length];
        guardarNotas();
        renderNotas();
      });

      card.querySelector(".btn-move-up").addEventListener("click", () => {
        if (index > 0) {
          [notas[index - 1], notas[index]] = [notas[index], notas[index - 1]];
          guardarNotas();
          renderNotas();
        }
      });

      card.querySelector(".btn-move-down").addEventListener("click", () => {
        if (index < notas.length - 1) {
          [notas[index + 1], notas[index]] = [notas[index], notas[index + 1]];
          guardarNotas();
          renderNotas();
        }
      });

      container.appendChild(card);
    });

    // actualizar estadísticas después de render
    actualizarEstadisticas();
  }

  // Escapa HTML sencillo para evitar inyección accidental
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Submeter formulario: validar y agregar nota nueva
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cliente = clienteInput.value.trim();
    const equipo = equipoInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const fecha = fechaInput.value;

    if (!cliente || !equipo || !descripcion || !fecha) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const nuevaNota = { cliente, equipo, descripcion, fecha, estado: "pendiente" };
    notas.push(nuevaNota);
    guardarNotas();
    renderNotas();
    form.reset();
  });


  // --- Buscador simple ---
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase().trim();
  
  // Intenta encontrar cualquier clase de nota posible
  const notes = document.querySelectorAll('.note, .nota, .servicio-card, .tarjeta');
  
  notes.forEach(note => {
    const text = note.textContent.toLowerCase();
    if (text.includes(term)) {
      note.style.display = 'block'; // Mostrar coincidencias
    } else {
      note.style.display = 'none';  // Ocultar las que no coincidan
    }
  });
});

  // Render inicial
  renderNotas();
});

const searchInput = document.getElementById("searchInput");
const notasContainer = document.getElementById("notas-container");
const noResult = document.getElementById("no-result");

searchInput.addEventListener("input", function () {
  const busqueda = this.value.toLowerCase();
  const notas = notasContainer.querySelectorAll(".nota");
  let coincidencias = 0;

  notas.forEach(nota => {
    const texto = nota.textContent.toLowerCase();
    if (texto.includes(busqueda)) {
      nota.classList.remove("hidden");
      coincidencias++;
    } else {
      nota.classList.add("hidden");
    }
  });

  // Mostrar mensaje si no hay coincidencias
  if (coincidencias === 0) {
    noResult.style.display = "block";
  } else {
    noResult.style.display = "none";
  }
});

