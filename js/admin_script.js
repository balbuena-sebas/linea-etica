// URL RAW de tu Gist con los reportes
const GIST_URL = "https://gist.github.com/balbuena-sebas/12fb8ffbef52c9fab6b83e50d7c1b6db.json";

// Función para obtener reportes desde GitHub Gist
async function obtenerReportes() {
    try {
        const res = await fetch(GIST_URL);
        const data = await res.json();
        return data || [];
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return [];
    }
}

function verificarAcceso() {
    let clave = document.getElementById('password').value;
    if (clave === 'admin123') {
        document.getElementById('adminPanel').classList.remove('hidden');
        mostrarReportes();
    } else {
        alert('Acceso denegado');
    }
}

async function mostrarReportes() {
    let lista = document.getElementById('reportes');
    lista.innerHTML = '';
    const reportes = await obtenerReportes();

    reportes.forEach((rep, index) => {
        let item = document.createElement('li');
        item.textContent = `${rep.fecha} - ${rep.tipo}: ${rep.mensaje} `;

        // Botón para eliminar (esta función no actualizará el Gist, solo simula el borrado en pantalla)
        let btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Eliminar';
        btnBorrar.onclick = function () { borrarReporte(index); };
        btnBorrar.style.marginLeft = '10px';

        item.appendChild(btnBorrar);
        lista.appendChild(item);
    });
}

// La función descargarExcel se mantiene similar, usando los reportes obtenidos
function descargarExcel() {
    obtenerReportes().then(reportes => {
        let ws = XLSX.utils.json_to_sheet(reportes);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
        XLSX.writeFile(wb, 'reportes.xlsx');
    });
}

// Estas funciones de borrado trabajan sobre el DOM y en memoria; 
// pero no se actualizará el Gist ya que escribir en él requiere autenticación.
function borrarReportes() {
    let clave = prompt('Ingrese la contraseña para borrar todos los reportes:');
    if (clave === 'admin1234') {
        alert('Historial de reportes eliminado (esto solo se refleja en la sesión actual).');
        // Se podría borrar la lista en pantalla, pero no se actualiza el Gist
        document.getElementById('reportes').innerHTML = '';
    } else {
        alert('Contraseña incorrecta. No se borraron los reportes.');
    }
}

function borrarReporte(index) {
    let clave = prompt('Ingrese la contraseña para eliminar este reporte:');
    if (clave === 'admin1234') {
        alert('Reporte eliminado (esto solo se refleja en la sesión actual).');
        // Se elimina el elemento de la lista en pantalla
        document.getElementById('reportes').children[index].remove();
    } else {
        alert('Contraseña incorrecta. No se borró el reporte.');
    }
}
