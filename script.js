document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = document.getElementById("formulario");
  const noteIdInput = document.getElementById("note-id");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCancel = document.getElementById("btn-cancel");
  
  // Inputs
  const solicitanteInput = document.getElementById("solicitante");
  const departamentoInput = document.getElementById("departamento");
  const sedeInput = document.getElementById("sede");
  const contactoInput = document.getElementById("contacto");
  
  const categoriaInput = document.getElementById("categoria");
  const prioridadInput = document.getElementById("prioridad");
  
  const asuntoInput = document.getElementById("asunto");
  const descripcionInput = document.getElementById("descripcion");
  const pasosInput = document.getElementById("pasos");
  const mensajeErrorInput = document.getElementById("mensaje_error");
  
  const capturaInput = document.getElementById("captura");
  const idActivoInput = document.getElementById("id_activo");
  const navegadorSoInput = document.getElementById("navegador_so");
  const fechaInput = document.getElementById("fecha"); // hidden

  // Conditionals
  const groupIdActivo = document.getElementById("group-id-activo");
  const groupNavegadorSo = document.getElementById("group-navegador-so");
  
  const container = document.getElementById("notas-container");
  const searchInput = document.getElementById("searchInput");
  const noResult = document.getElementById("no-result");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Statistics Elements
  const statTotal = document.getElementById("stat-total");
  const statPendiente = document.getElementById("stat-pendiente");
  const statReparada = document.getElementById("stat-reparada");
  const statEntregado = document.getElementById("stat-entregado");

  // State
  let notas = JSON.parse(localStorage.getItem("notas")) || [];
  let currentFilter = "all";
  let isEditing = false;

  // --- Logic ---
  
  // Conditional Visibility
  const updateVisibility = () => {
      const cat = categoriaInput.value;
      
      // Default: show all
      groupIdActivo.classList.remove("hidden");
      groupNavegadorSo.classList.remove("hidden");
      
      // Rules
      if (cat === "Software" || cat === "Accesos" || cat === "Redes") {
          // Hide ID Activo (Hardware ID) if not Hardware
          // Use "hidden" class
          groupIdActivo.classList.add("hidden");
      }
      if (cat === "Hardware") {
          // Hide Browser/SO if Hardware? Maybe not, but let's follow the prompt example style
          groupNavegadorSo.classList.add("hidden");
      }
      
      // If nothing selected, maybe hide specifics? kept simple for now.
  };

  categoriaInput.addEventListener("change", updateVisibility);
  updateVisibility(); // Init

  // --- Functions ---

  const saveNotes = () => {
    localStorage.setItem("notas", JSON.stringify(notas));
    updateStats();
  };

  const updateStats = () => {
    const total = notas.length;
    const pendientes = notas.filter(n => (n.estado || "pendiente") === "pendiente").length;
    const reparadas = notas.filter(n => n.estado === "reparada").length;
    const entregadas = notas.filter(n => n.estado === "entregado").length;

    animateValue(statTotal, parseInt(statTotal.textContent || 0), total, 500);
    animateValue(statPendiente, parseInt(statPendiente.textContent || 0), pendientes, 500);
    animateValue(statReparada, parseInt(statReparada.textContent || 0), reparadas, 500);
    animateValue(statEntregado, parseInt(statEntregado.textContent || 0), entregadas, 500);
  };

  function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end;
      }
    };
    window.requestAnimationFrame(step);
  }

  const showToast = (message, type = "success") => {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    toast.offsetHeight; // Reflow
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const renderNotes = () => {
    container.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filteredNotes = notas.filter((nota) => {
        if (currentFilter !== "all" && nota.estado !== currentFilter) return false;
        if (searchTerm) {
            // Search in relevant fields
            const text = `${nota.solicitante} ${nota.asunto} ${nota.descripcion} ${nota.id_activo || ''}`.toLowerCase();
            return text.includes(searchTerm);
        }
        return true;
    });

    if (filteredNotes.length === 0) {
        noResult.style.display = "block";
    } else {
        noResult.style.display = "none";
    }

    const notesToRender = filteredNotes.map(n => ({ ...n, originalIndex: notas.indexOf(n) }));

    notesToRender.forEach((nota) => {
      const card = document.createElement("article");
      card.className = "nota " + (nota.estado || "pendiente");
      
      const statusIcons = {
          pendiente: '<i class="fa-solid fa-clock"></i>',
          reparada: '<i class="fa-solid fa-screwdriver-wrench"></i>',
          entregado: '<i class="fa-solid fa-check-double"></i>'
      };

      // Priority badge color
      let priorityClass = "priority-medium";
      if(nota.prioridad === "Baja") priorityClass = "priority-low";
      if(nota.prioridad === "Alta") priorityClass = "priority-high";
      if(nota.prioridad === "Critica") priorityClass = "priority-critical";

      card.innerHTML = `
        <div class="nota-header">
          <div class="estado-group">
            <div class="estado-label">
                ${statusIcons[nota.estado] || ''} ${nota.estado}
            </div>
            <span class="badge ${priorityClass}">${nota.prioridad || 'Media'}</span>
          </div>
          <div class="nota-acciones">
            <button class="btn-change" title="Cambiar estado"><i class="fa-solid fa-rotate"></i></button>
            <button class="btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>

        <div class="nota-body">
            <h3 class="nota-title">${escapeHtml(nota.asunto)}</h3>
            <div class="nota-meta">
                <span><i class="fa-solid fa-user"></i> ${escapeHtml(nota.solicitante)}</span>
                <span><i class="fa-solid fa-building"></i> ${escapeHtml(nota.departamento || '-')}</span>
            </div>
            
            <div class="nota-detail">
                <p><strong>Categoría:</strong> ${escapeHtml(nota.categoria)}</p>
                <p>${escapeHtml(nota.descripcion)}</p>
            </div>

            ${nota.id_activo ? `<p class="nota-row small"><i class="fa-solid fa-barcode"></i> ${escapeHtml(nota.id_activo)}</p>` : ''}
            ${nota.capturaName ? `<p class="nota-row small"><i class="fa-solid fa-paperclip"></i> Captura: ${escapeHtml(nota.capturaName)}</p>` : ''}
            
            <p class="nota-row date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(nota.fecha)}</p>
        </div>
      `;

      // Events
      const index = nota.originalIndex;

      card.querySelector(".btn-delete").addEventListener("click", () => {
        if(confirm("¿Estás seguro de eliminar este ticket?")) {
            notas.splice(index, 1);
            saveNotes();
            renderNotes();
            showToast("Ticket eliminado", "info");
        }
      });

      card.querySelector(".btn-change").addEventListener("click", () => {
        const estados = ["pendiente", "reparada", "entregado"];
        const actual = estados.indexOf(nota.estado);
        const nuevoEstado = estados[(actual + 1) % estados.length];
        notas[index].estado = nuevoEstado;
        saveNotes();
        renderNotes();
        showToast(`Estado actualizado a ${nuevoEstado}`);
      });

      card.querySelector(".btn-edit").addEventListener("click", () => {
          startEditing(index);
      });

      container.appendChild(card);
    });
    
    updateStats();
  };

  const startEditing = (index) => {
      const nota = notas[index];
      noteIdInput.value = index;
      
      solicitanteInput.value = nota.solicitante || "";
      departamentoInput.value = nota.departamento || "";
      sedeInput.value = nota.sede || "";
      contactoInput.value = nota.contacto || "";
      
      categoriaInput.value = nota.categoria || "";
      prioridadInput.value = nota.prioridad || "Media";
      
      asuntoInput.value = nota.asunto || "";
      descripcionInput.value = nota.descripcion || "";
      pasosInput.value = nota.pasos || "";
      mensajeErrorInput.value = nota.mensaje_error || "";
      
      // Files cannot be set programmatically easily, so we skip populating 'captura'
      // but we could show a label saying "Current file: ..." if we wanted.
      
      idActivoInput.value = nota.id_activo || "";
      navegadorSoInput.value = nota.navegador_so || "";
      
      fechaInput.value = nota.fecha;
      
      updateVisibility(); // Refresh conditionals based on loaded category

      btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Actualizar Ticket';
      btnCancel.style.display = "inline-flex";
      
      form.scrollIntoView({ behavior: 'smooth' });
      solicitanteInput.focus();
      
      isEditing = true;
  };

  const cancelEditing = () => {
      form.reset();
      noteIdInput.value = "";
      btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Crear Ticket';
      btnCancel.style.display = "none";
      updateVisibility();
      isEditing = false;
  };

  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  // --- Event Listeners ---

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Required fields check (HTML5 'required' handles most, but double check)
    if (!solicitanteInput.value || !asuntoInput.value || !descripcionInput.value) {
        showToast("Por favor complete los campos obligatorios", "error");
        return;
    }

    // Handle Date (auto if new)
    const fecha = isEditing ? fechaInput.value : new Date().toISOString().split('T')[0];

    // Handle File
    // We can't really store large files in localstorage. We will just store the name for this demo.
    let capturaName = isEditing && notas[noteIdInput.value] ? notas[noteIdInput.value].capturaName : "";
    if (capturaInput.files && capturaInput.files[0]) {
        capturaName = capturaInput.files[0].name;
    }

    const ticketData = {
        solicitante: solicitanteInput.value.trim(),
        departamento: departamentoInput.value,
        sede: sedeInput.value.trim(),
        contacto: contactoInput.value,
        categoria: categoriaInput.value,
        prioridad: prioridadInput.value,
        asunto: asuntoInput.value.trim(),
        descripcion: descripcionInput.value.trim(),
        pasos: pasosInput.value.trim(),
        mensaje_error: mensajeErrorInput.value.trim(),
        capturaName: capturaName,
        id_activo: idActivoInput.value.trim(),
        navegador_so: navegadorSoInput.value.trim(),
        fecha: fecha
    };

    if (isEditing) {
        const index = parseInt(noteIdInput.value);
        if (index >= 0 && index < notas.length) {
            // Keep existing state
            const oldState = notas[index].estado;
            notas[index] = { ...ticketData, estado: oldState };
            showToast("Ticket actualizado correctamente");
            cancelEditing();
        }
    } else {
        const nuevoTicket = { ...ticketData, estado: "pendiente" };
        notas.push(nuevoTicket);
        showToast("Ticket creado correctamente");
        form.reset();
        updateVisibility();
    }
    
    saveNotes();
    renderNotes();
  });

  btnCancel.addEventListener("click", cancelEditing);

  searchInput.addEventListener("input", renderNotes);

  filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
          filterBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentFilter = btn.dataset.filter;
          renderNotes();
      });
  });

  // Initial render
  renderNotes();
});
