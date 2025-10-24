// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    apoyos: []
};

// Elementos DOM
const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const adminPanel = document.getElementById('admin-panel');
const searchResult = document.getElementById('search-result');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    checkAuthStatus();
    
    // Configurar event listeners para formularios
    document.getElementById('dirigente-form').addEventListener('submit', guardarDirigente);
    document.getElementById('apoyo-form').addEventListener('submit', registrarApoyo);
});

// Funciones de autenticación
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            appState.isAuthenticated = true;
            actualizarUI();
            cargarDatos();
            mostrarNotificacion('Sesión iniciada correctamente', 'success');
        } else {
            mostrarNotificacion(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

async function logout() {
    try {
        await fetch('/logout');
        appState.isAuthenticated = false;
        actualizarUI();
        mostrarNotificacion('Sesión cerrada correctamente', 'success');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

function checkAuthStatus() {
    // En una aplicación real, verificaríamos con el servidor
    // Por ahora, asumimos que no está autenticado al cargar la página
    appState.isAuthenticated = false;
    actualizarUI();
}

function actualizarUI() {
    if (appState.isAuthenticated) {
        loginForm.classList.add('hidden');
        userInfo.classList.remove('hidden');
        adminPanel.classList.remove('hidden');
    } else {
        loginForm.classList.remove('hidden');
        userInfo.classList.add('hidden');
        adminPanel.classList.add('hidden');
    }
}

// Funciones para dirigentes
function mostrarFormDirigente(dirigente = null) {
    const form = document.getElementById('form-dirigente');
    const title = document.getElementById('form-title');
    const formElement = document.getElementById('dirigente-form');
    
    if (dirigente) {
        title.textContent = 'Editar Dirigente';
        document.getElementById('dirigente-id').value = dirigente.id;
        document.getElementById('dirigente-nombre').value = dirigente.nombre;
        document.getElementById('dirigente-cedula').value = dirigente.cedula;
        document.getElementById('dirigente-corregimiento').value = dirigente.corregimiento;
        document.getElementById('dirigente-comunidad').value = dirigente.comunidad;
        document.getElementById('dirigente-coordinador').value = dirigente.coordinador;
        document.getElementById('dirigente-participacion').value = dirigente.participacion;
    } else {
        title.textContent = 'Nuevo Dirigente';
        formElement.reset();
        document.getElementById('dirigente-id').value = '';
    }
    
    form.classList.remove('hidden');
}

function ocultarFormDirigente() {
    document.getElementById('form-dirigente').classList.add('hidden');
}

async function guardarDirigente(event) {
    event.preventDefault();
    
    const id = document.getElementById('dirigente-id').value;
const nombre = document.getElementById('dirigente-nombre').value;
const cedula = document.getElementById('dirigente-cedula').value;
const telefono = document.getElementById('dirigente-telefono').value;
const corregimiento = document.getElementById('dirigente-corregimiento').value;
const comunidad = document.getElementById('dirigente-comunidad').value;
const coordinador = document.getElementById('dirigente-coordinador').value;
const participacion = document.getElementById('dirigente-participacion').value;
    
    const dirigenteData = {
        nombre,
        cedula,
        telefono,
        corregimiento,
        comunidad,
        coordinador,
        participacion
    };
    
    try {
        let response;
        if (id) {
            response = await fetch(`/api/dirigentes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dirigenteData)
            });
        } else {
            response = await fetch('/api/dirigentes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dirigenteData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            ocultarFormDirigente();
            cargarDirigentes();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        console.error('Error al guardar dirigente:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

async function cargarDirigentes() {
    try {
        const response = await fetch('/api/dirigentes');
        const data = await response.json();
        
        if (response.ok) {
            appState.dirigentes = data;
            renderizarDirigentes();
            actualizarSelectDirigentes();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        console.error('Error al cargar dirigentes:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

function renderizarDirigentes() {
    const tbody = document.getElementById('dirigentes-body');
    tbody.innerHTML = '';
    
    appState.dirigentes.forEach(dirigente => {
        const tr = document.createElement('tr');
        
        const claseParticipacion = `participacion-${dirigente.participacion}`;
        
        tr.innerHTML = `
            <td>${dirigente.nombre}</td>
            <td>${dirigente.cedula}</td>
            <td>${dirigente.telefono || 'No registrado'}</td>
            <td>${dirigente.corregimiento}</td>
            <td>${dirigente.comunidad}</td>
            <td>${dirigente.coordinador}</td>
            <td class="${claseParticipacion}">${dirigente.participacion}</td>
            <td class="actions">
                <button class="edit" onclick="editarDirigente(${dirigente.id})">Editar</button>
                <button class="delete" onclick="eliminarDirigente(${dirigente.id})">Eliminar</button>
                <button class="constancia" onclick="generarConstancia(${dirigente.id})">Constancia</button>
                <button class="apoyo" onclick="registrarApoyoDirigente(${dirigente.id}, '${dirigente.nombre}')">Registrar Apoyo</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function editarDirigente(id) {
    const dirigente = appState.dirigentes.find(d => d.id === id);
    if (dirigente) {
        mostrarFormDirigente(dirigente);
        document.getElementById('dirigente-telefono').value = dirigente.telefono || '';
    }
}

async function eliminarDirigente(id) {
    if (!confirm('¿Está seguro de que desea eliminar este dirigente?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/dirigentes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            cargarDirigentes();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        console.error('Error al eliminar dirigente:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

function generarConstancia(id) {
    window.open(`/constancia/${id}`, '_blank');
}

// Funciones para apoyos
function mostrarFormApoyo() {
    document.getElementById('form-apoyo').classList.remove('hidden');
    configurarFechaAutomatica();
}

function ocultarFormApoyo() {
    document.getElementById('form-apoyo').classList.add('hidden');
}

async function registrarApoyo(event) {
    event.preventDefault();
    
    const dirigenteId = document.getElementById('apoyo-dirigente').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    const fecha = document.getElementById('apoyo-fecha').value;
    
    const apoyoData = {
        dirigente_id: dirigenteId,
        tipo,
        descripcion,
        monto: tipo === 'economico' ? monto : null,
        fecha
    };
    
    try {
        const response = await fetch('/api/apoyos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apoyoData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            ocultarFormApoyo();
            document.getElementById('apoyo-form').reset();
            cargarApoyos();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        console.error('Error al registrar apoyo:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

async function cargarApoyos() {
    try {
        const response = await fetch('/api/apoyos');
        const data = await response.json();
        
        if (response.ok) {
            appState.apoyos = data;
            renderizarApoyos();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        console.error('Error al cargar apoyos:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

function renderizarApoyos() {
    const tbody = document.getElementById('apoyos-body');
    tbody.innerHTML = '';
    
    appState.apoyos.forEach(apoyo => {
        const dirigente = appState.dirigentes.find(d => d.id === apoyo.dirigente_id);
        const nombreDirigente = dirigente ? dirigente.nombre : 'Desconocido';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nombreDirigente}</td>
            <td>${apoyo.tipo}</td>
            <td>${apoyo.descripcion || '-'}</td>
            <td>${apoyo.monto ? `$${parseFloat(apoyo.monto).toFixed(2)}` : '-'}</td>
            <td>${new Date(apoyo.fecha).toLocaleDateString()}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

function actualizarSelectDirigentes() {
    const select = document.getElementById('apoyo-dirigente');
    select.innerHTML = '<option value="">Seleccionar dirigente</option>';
    
    appState.dirigentes.forEach(dirigente => {
        const option = document.createElement('option');
        option.value = dirigente.id;
        option.textContent = `${dirigente.nombre} (${dirigente.cedula})`;
        select.appendChild(option);
    });
}

// Función de búsqueda pública
async function buscarDirigente() {
    const cedula = document.getElementById('search-cedula').value.trim();
    
    if (!cedula) {
        mostrarNotificacion('Por favor ingrese un número de cédula', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/buscar-dirigente?cedula=${cedula}`);
        const data = await response.json();
        
        searchResult.classList.remove('hidden');
        
        if (data.encontrado) {
    const dirigente = data.dirigente;
    const claseParticipacion = `participacion-${dirigente.participacion}`;
    
    searchResult.innerHTML = `
        <div class="result-found">
            <h3>¡Dirigente encontrado!</h3>
            <p><strong>Nombre:</strong> ${dirigente.nombre}</p>
            <p><strong>Cédula:</strong> ${dirigente.cedula}</p>
            <p><strong>Teléfono:</strong> ${dirigente.telefono || 'No registrado'}</p>
            <p><strong>Corregimiento:</strong> ${dirigente.corregimiento}</p>
            <p><strong>Comunidad:</strong> ${dirigente.comunidad}</p>
            <p><strong>Coordinador:</strong> ${dirigente.coordinador}</p>
            <p><strong>Participación:</strong> <span class="${claseParticipacion}">${dirigente.participacion}</span></p>
        </div>
    `;
} else {
            searchResult.innerHTML = `
                <div class="result-not-found">
                    <h3>Dirigente no encontrado</h3>
                    <p>No se encontró ningún dirigente registrado con la cédula: ${cedula}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Cargar todos los datos necesarios
async function cargarDatos() {
    await cargarDirigentes();
    await cargarApoyos();  
}

// Utilidades
function mostrarNotificacion(mensaje, tipo) {
    // Eliminar notificaciones existentes
    const notificacionesExistentes = document.querySelectorAll('.notification');
    notificacionesExistentes.forEach(notif => notif.remove());
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 3000);

}

function configurarFechaAutomatica() {
    const fechaInput = document.getElementById('apoyo-fecha');
    if (fechaInput) {
        // Obtener fecha local del navegador (Panamá)
        const hoy = new Date();
        const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        fechaInput.value = fechaLocal;
    }
}

function registrarApoyoDirigente(dirigenteId, dirigenteNombre) {
    // Mostrar el formulario de apoyo
    mostrarFormApoyo();
    
    // Seleccionar automáticamente el dirigente
    const selectDirigente = document.getElementById('apoyo-dirigente');
    selectDirigente.value = dirigenteId;
    
    // Mostrar notificación de confirmación
    mostrarNotificacion(`Dirigente "${dirigenteNombre}" seleccionado para registro de apoyo`, 'success');
    
    // Hacer scroll suave al formulario
    document.getElementById('form-apoyo').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

// ========== NUEVAS FUNCIONALIDADES ==========

// Cargar dashboard con estadísticas
async function cargarDashboard() {
    if (!appState.isAuthenticated) return;
    
    try {
        const response = await fetch('/api/estadisticas');
        const estadisticas = await response.json();
        
        if (response.ok) {
            renderizarDashboard(estadisticas);
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function renderizarDashboard(estadisticas) {
    const dashboardHTML = `
        <div class="dashboard-cards">
            <div class="card">
                <h3>Total Dirigentes</h3>
                <div class="number">${estadisticas.totalDirigentes}</div>
                <div class="description">Registrados en el sistema</div>
            </div>
            <div class="card">
                <h3>Total Apoyos</h3>
                <div class="number">${estadisticas.totalApoyos}</div>
                <div class="description">Apoyos registrados</div>
            </div>
            <div class="card">
                <h3>Buena Participación</h3>
                <div class="number">${estadisticas.participacion.find(p => p.participacion === 'buena')?.total || 0}</div>
                <div class="description">Dirigentes activos</div>
            </div>
            <div class="card">
                <h3>Apoyos Económicos</h3>
                <div class="number">$${estadisticas.apoyos.find(a => a.tipo === 'economico')?.total_monto || 0}</div>
                <div class="description">Total distribuido</div>
            </div>
        </div>
    `;
    
    // Insertar dashboard al inicio del admin-panel
    const adminPanel = document.getElementById('admin-panel');
    const existingDashboard = adminPanel.querySelector('.dashboard-cards');
    
    if (existingDashboard) {
        existingDashboard.innerHTML = dashboardHTML;
    } else {
        adminPanel.insertAdjacentHTML('afterbegin', dashboardHTML);
    }
}

// Búsqueda avanzada
function configurarBusquedaAvanzada() {
    const buscarInput = document.getElementById('buscar-dirigente');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento');
    const filtroParticipacion = document.getElementById('filtro-participacion');
    
    if (buscarInput) {
        buscarInput.addEventListener('input', debounce(filtrarDirigentes, 300));
    }
    if (filtroCorregimiento) {
        filtroCorregimiento.addEventListener('change', filtrarDirigentes);
    }
    if (filtroParticipacion) {
        filtroParticipacion.addEventListener('change', filtrarDirigentes);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function filtrarDirigentes() {
    if (!appState.isAuthenticated) return;
    
    const query = document.getElementById('buscar-dirigente')?.value || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (corregimiento) params.append('corregimiento', corregimiento);
    if (participacion) params.append('participacion', participacion);
    
    try {
        const response = await fetch(`/api/dirigentes/buscar?${params}`);
        const dirigentesFiltrados = await response.json();
        
        if (response.ok) {
            appState.dirigentes = dirigentesFiltrados;
            renderizarDirigentes();
        }
    } catch (error) {
        console.error('Error filtrando dirigentes:', error);
    }
}

// Exportación de datos
function agregarBotonesExportacion() {
    const seccionDirigentes = document.getElementById('gestion-dirigentes');
    if (seccionDirigentes && !seccionDirigentes.querySelector('.export-buttons')) {
        const exportHTML = `
            <div class="export-buttons">
                <button class="btn-export csv" onclick="exportarDirigentesCSV()">
                    📊 Exportar a CSV
                </button>
            </div>
        `;
        seccionDirigentes.querySelector('h2').insertAdjacentHTML('afterend', exportHTML);
    }
}

async function exportarDirigentesCSV() {
    try {
        const response = await fetch('/api/exportar/dirigentes');
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'dirigentes.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacion('Archivo CSV descargado exitosamente', 'success');
        }
    } catch (error) {
        console.error('Error exportando CSV:', error);
        mostrarNotificacion('Error al exportar datos', 'error');
    }
}

// Sistema de notificaciones
async function cargarNotificaciones() {
    if (!appState.isAuthenticated) return;
    
    try {
        const response = await fetch('/api/notificaciones');
        const notificaciones = await response.json();
        
        if (response.ok) {
            renderizarNotificaciones(notificaciones);
        }
    } catch (error) {
        console.error('Error cargando notificaciones:', error);
    }
}

function renderizarNotificaciones(notificaciones) {
    // Aquí puedes implementar la UI de notificaciones
    console.log('Notificaciones:', notificaciones);
    
    // Ejemplo: Mostrar badge con cantidad de notificaciones
    const notificacionBadge = document.getElementById('notificacion-badge');
    if (notificaciones.length > 0) {
        if (!notificacionBadge) {
            const badge = document.createElement('span');
            badge.id = 'notificacion-badge';
            badge.className = 'notificacion-badge';
            badge.textContent = notificaciones.length;
            document.querySelector('header').appendChild(badge);
        } else {
            notificacionBadge.textContent = notificaciones.length;
        }
    }
}

// Actualizar la función cargarDatos para incluir las nuevas funcionalidades
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    await Promise.all([
        cargarDirigentes(),
        cargarApoyos(),
        cargarDashboard(),
        cargarNotificaciones()
    ]);
    
    configurarBusquedaAvanzada();
    agregarBotonesExportacion();
}

// Inicializar mejoras cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Tu código existente...
    
    // Agregar estas líneas al final del event listener
    setTimeout(() => {
        if (appState.isAuthenticated) {
            configurarBusquedaAvanzada();
            agregarBotonesExportacion();
        }
    }, 1000);
});



