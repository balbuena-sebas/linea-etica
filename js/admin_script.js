function obtenerReportes() {
    return JSON.parse(localStorage.getItem('reportes')) || [];
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

function mostrarReportes() {
    let lista = document.getElementById('reportes');
    lista.innerHTML = '';
    obtenerReportes().forEach((rep, index) => {
        let item = document.createElement('li');
        item.textContent = `${rep.fecha} - ${rep.tipo}: ${rep.mensaje} `;

        let btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Eliminar';
        btnBorrar.onclick = function () { borrarReporte(index); };
        btnBorrar.style.marginLeft = '10px';

        item.appendChild(btnBorrar);
        lista.appendChild(item);
    });
}

function descargarExcel() {
    let reportes = obtenerReportes();
    let ws = XLSX.utils.json_to_sheet(reportes);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
    XLSX.writeFile(wb, 'reportes.xlsx');
}

function borrarReportes() {
    let clave = prompt('Ingrese la contraseña para borrar todos los reportes:');
    if (clave === 'admin123') {
        localStorage.removeItem('reportes');
        alert('Historial de reportes eliminado.');
        mostrarReportes();
    } else {
        alert('Contraseña incorrecta. No se borraron los reportes.');
    }
}

function borrarReporte(index) {
    let clave = prompt('Ingrese la contraseña para eliminar este reporte:');
    if (clave === 'admin123') {
        let reportes = obtenerReportes();
        reportes.splice(index, 1);
        localStorage.setItem('reportes', JSON.stringify(reportes));
        mostrarReportes();
    } else {
        alert('Contraseña incorrecta. No se borró el reporte.');
    }
}
