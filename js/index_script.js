function obtenerReportes() {
    return JSON.parse(localStorage.getItem('reportes')) || [];
}

function guardarReporte(tipo, mensaje) {
    let reportes = obtenerReportes();
    reportes.push({ tipo, mensaje, fecha: new Date().toLocaleString() });
    localStorage.setItem('reportes', JSON.stringify(reportes));
}

document.getElementById('reportForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let tipo = document.getElementById('tipo').value;
    let mensaje = document.getElementById('mensaje').value;
    guardarReporte(tipo, mensaje);
    alert('Reporte enviado de manera anónima.');
    document.getElementById('reportForm').reset();
});
