// 🔑 Detecta si estamos en localhost o en producción
const API_BASE_URL =
  window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:3000"
    : "https://beertan-api.onrender.com";

// 🔍 Debug inicial
console.log("🌐 Hostname actual:", window.location.hostname);
console.log("🔗 API URL configurada:", API_BASE_URL);

// 🧪 Función para probar la conexión
async function testConnection() {
  try {
    console.log("🧪 Probando conexión con API...");
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Conexión exitosa:", data);
      return true;
    } else {
      console.error("❌ Error de conexión:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error("❌ Error de red:", error);
    return false;
  }
}

// Probar conexión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  testConnection();
});

document
  .getElementById("reportForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const tipo = document.getElementById("tipo").value;
    const mensaje = document.getElementById("mensaje").value;

    console.log("📝 Enviando reporte:", { tipo, mensaje });

    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ tipo, mensaje }),
      });

      console.log("📨 Respuesta del servidor:", res.status, res.statusText);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Reporte enviado:", data);
        alert("✅ Reporte enviado de manera anónima.");
        document.getElementById("reportForm").reset();
      } else {
        // Captura el mensaje real del servidor
        const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }
    } catch (err) {
      console.error("❌ Error al enviar reporte:", err);
      alert(`❌ No se pudo enviar el reporte: ${err.message}`);
      
      // Sugerir verificar conexión
      if (err.message.includes('fetch')) {
        alert("🔍 Verifica tu conexión a internet o contacta al administrador.");
      }
    }
  });