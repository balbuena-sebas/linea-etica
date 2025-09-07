// 🔑 Detecta si estamos en localhost o en producción (Render)
const API_BASE_URL =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://beertan-api.onrender.com";

async function mostrarReportes() {
  const lista = document.getElementById("reportes");
  lista.innerHTML = "Cargando...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/reports`);
    if (!res.ok) throw new Error(`Error ${res.status} al obtener reportes`);

    const reportes = await res.json();
    lista.innerHTML = "";

    reportes.forEach((rep) => {
      let item = document.createElement("li");
      item.innerHTML = `
        <strong>${rep.fecha ? new Date(rep.fecha).toLocaleString("es-ES") : "(sin fecha)"}</strong> -
        <em>${rep.tipo}</em>: ${rep.mensaje}
      `;

      let btnBorrar = document.createElement("button");
      btnBorrar.textContent = "Eliminar";
      btnBorrar.style.marginLeft = "10px";
      btnBorrar.onclick = async function () {
        const clave = prompt("Ingrese la contraseña para eliminar este reporte:");
        if (clave === "admin1234") {
          try {
            const deleteRes = await fetch(`${API_BASE_URL}/api/reports/${rep.id}`, {
              method: "DELETE",
            });

            if (!deleteRes.ok) {
              const errData = await deleteRes.json();
              throw new Error(errData.error || `Error ${deleteRes.status}`);
            }

            mostrarReportes(); // recargar lista
          } catch (error) {
            alert("Error al eliminar: " + error.message);
          }
        } else {
          alert("❌ Contraseña incorrecta.");
        }
      };

      item.appendChild(btnBorrar);
      lista.appendChild(item);
    });
  } catch (err) {
    console.error("Error al obtener reportes:", err);
    lista.innerHTML = `<li>❌ No se pueden obtener reportes: ${err.message}</li>`;
  }
}

async function borrarReportes() {
  let clave = prompt("Ingrese la contraseña para borrar todos los reportes:");
  if (clave === "admin1234") {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`);
      if (!res.ok) throw new Error(`Error ${res.status} al obtener reportes`);
      const reportes = await res.json();

      for (const rep of reportes) {
        await fetch(`${API_BASE_URL}/api/reports/${rep.id}`, { method: "DELETE" });
      }

      alert("✅ Historial de reportes eliminado.");
      mostrarReportes();
    } catch (error) {
      alert("❌ Error al eliminar reportes: " + error.message);
    }
  } else {
    alert("❌ Contraseña incorrecta. No se borraron los reportes.");
  }
}

function verificarAcceso() {
  let clave = document.getElementById("password").value;
  if (clave === "admin1234") {
    document.getElementById("adminPanel").classList.remove("hidden");
    mostrarReportes();
  } else {
    alert("❌ Acceso denegado");
  }
}

async function descargarExcel() {
  async function obtenerReportes() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`);
      if (!res.ok) throw new Error(`Error ${res.status} al obtener reportes`);
      return await res.json();
    } catch (error) {
      console.error("Error al obtener reportes para Excel:", error);
      return [];
    }
  }

  try {
    // 1. Obtener los reportes
    const reportes = await obtenerReportes();

    if (reportes.length === 0) {
      alert("❌ No hay reportes para descargar.");
      return;
    }

    // 2. Formatear las fechas (asumiendo que el campo se llama 'fecha')
    const reportesFormateados = reportes.map(reporte => {
      const nuevoReporte = { ...reporte };

      // Formatear la fecha si existe
      if (nuevoReporte.fecha) {
        const fecha = new Date(nuevoReporte.fecha);
        nuevoReporte.fecha = fecha.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false  // Formato 24 horas
        });
      }

      return nuevoReporte;
    });

    // 3. Generar el archivo Excel
    const ws = XLSX.utils.json_to_sheet(reportesFormateados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");

    // 4. Descargar el archivo
    XLSX.writeFile(wb, "reportes.xlsx");
    alert("✅ Excel descargado correctamente");
  } catch (error) {
    console.error("Error al generar Excel:", error);
    alert("❌ Error al generar el archivo Excel. Revisa la consola para más detalles.");
  }
}