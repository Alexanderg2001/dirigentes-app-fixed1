// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    colaboradores: [],
    apoyos: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            appState.isAuthenticated = true;
            appState.userRol = data.rol;
            actualizarUI();
            cargarDatos();
            mostrarNotificacion(`Sesión iniciada como ${data.rol}`, 'success');
        } else {
            mostrarNotificacion(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
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
    appState.isAuthenticated = false;
    actualizarUI();
}

function actualizarUI() {
    if (appState.isAuthenticated) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
    } else {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }
}

// Cargar datos
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    await cargarDirigentes();
    await cargarColaboradores();
    await cargarApoyos();
}

// Cargar dirigentes
async function cargarDirigentes() {
    try {
        const response = await fetch('/api/dirigentes');
        const data = await response.json();
        
        if (response.ok) {
            appState.dirigentes = data;
            renderizarDirigentes();
            actualizarSelectDirigentes();
        }
    } catch (error) {
        console.error('Error al cargar dirigentes:', error);
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
                <button class="apoyo" onclick="registrarApoyoDirigente(${dirigente.id}, '${dirigente.nombre}')">Registrar Apoyo</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Cargar colaboradores
async function cargarColaboradores() {
    try {
        const response = await fetch('/api/colaboradores');
        const data = await response.json();
        
        if (response.ok) {
            appState.colaboradores = data;
            actualizarSelectColaboradores();
        }
    } catch (error) {
        console.error('Error al cargar colaboradores:', error);
    }
}

function actualizarSelectColaboradores() {
    const select = document.getElementById('apoyo-colaborador');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar colaborador que entrega</option>';
    
    appState.colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador.id;
        option.textContent = `${colaborador.nombre} - ${colaborador.cargo}`;
        select.appendChild(option);
    });
}

// Actualizar select de dirigentes para apoyos
async function actualizarSelectDirigentes() {
    try {
        const response = await fetch('/api/dirigentes/todos');
        const todosLosDirigentes = await response.json();
        
        const select = document.getElementById('apoyo-dirigente');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar dirigente</option>';
        
        todosLosDirigentes.forEach(dirigente => {
            const option = document.createElement('option');
            option.value = dirigente.id;
            option.textContent = `${dirigente.nombre} - ${dirigente.cedula}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar dirigentes para selector:', error);
    }
}

// Funciones de formularios
function mostrarFormDirigente(dirigente = null) {
    const form = document.getElementById('form-dirigente');
    const title = document.getElementById('form-title');
    
    if (dirigente) {
        title.textContent = 'Editar Dirigente';
        document.getElementById('dirigente-id').value = dirigente.id;
        document.getElementById('dirigente-nombre').value = dirigente.nombre;
        document.getElementById('dirigente-cedula').value = dirigente.cedula;
        document.getElementById('dirigente-telefono').value = dirigente.telefono || '';
        document.getElementById('dirigente-corregimiento').value = dirigente.corregimiento;
        document.getElementById('dirigente-comunidad').value = dirigente.comunidad;
        document.getElementById('dirigente-coordinador').value = dirigente.coordinador;
        document.getElementById('dirigente-participacion').value = dirigente.participacion;
    } else {
        title.textContent = 'Nuevo Dirigente';
        document.getElementById('dirigente-form').reset();
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
    
    const dirigenteData = { nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion };
    
    try {
        let response;
        if (id) {
            response = await fetch(`/api/dirigentes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dirigenteData)
            });
        } else {
            response = await fetch('/api/dirigentes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

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
    const colaboradorId = document.getElementById('apoyo-colaborador').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    
    const apoyoData = {
        dirigente_id: dirigenteId,
        colaborador_id: colaboradorId,
        tipo,
        descripcion,
        monto: tipo === 'economico' ? monto : null
    };
    
    try {
        const response = await fetch('/api/apoyos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apoyoData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion('Apoyo registrado exitosamente', 'success');
            ocultarFormApoyo();
            cargarApoyos();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Funciones auxiliares
function configurarFechaAutomatica() {
    const fechaInput = document.getElementById('apoyo-fecha');
    if (fechaInput) {
        const hoy = new Date();
        const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        fechaInput.value = fechaLocal;
    }
}

function registrarApoyoDirigente(dirigenteId, dirigenteNombre) {
    mostrarFormApoyo();
    document.getElementById('apoyo-dirigente').value = dirigenteId;
    mostrarNotificacion(`Dirigente "${dirigenteNombre}" seleccionado`, 'success');
}

async function cargarApoyos() {
    try {
        const response = await fetch('/api/apoyos');
        const data = await response.json();
        
        if (response.ok) {
            appState.apoyos = data;
            renderizarApoyos();
        }
    } catch (error) {
        console.error('Error al cargar apoyos:', error);
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
            <td>${apoyo.monto ? `$${apoyo.monto}` : '-'}</td>
            <td>${new Date(apoyo.fecha).toLocaleDateString()}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Búsqueda pública
async function buscarDirigente() {
    const cedula = document.getElementById('search-cedula').value.trim();
    const searchResult = document.getElementById('search-result');
    
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
                    <p>No se encontró ningún dirigente con la cédula: ${cedula}</p>
                </div>
            `;
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Utilidades
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 3000);
}

// Funciones de edición/eliminación
function editarDirigente(id) {
    const dirigente = appState.dirigentes.find(d => d.id === id);
    if (dirigente) {
        mostrarFormDirigente(dirigente);
    }
}

async function eliminarDirigente(id) {
    if (!confirm('¿Está seguro de que desea eliminar este dirigente?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/dirigentes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            cargarDirigentes();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

function generarConstancia(id) {
    window.open(`/constancia/${id}`, '_blank');
}

// 🆕 FUNCIONES PARA BUSCADOR INTELIGENTE
function inicializarBuscadorApoyo() {
    const buscador = document.getElementById('buscar-dirigente-apoyo');
    if (buscador) {
        buscador.addEventListener('input', filtrarDirigentesApoyo);
    }
}

function filtrarDirigentesApoyo() {
    const busqueda = document.getElementById('buscar-dirigente-apoyo').value.toLowerCase();
    const select = document.getElementById('apoyo-dirigente');
    const contador = document.getElementById('contador-resultados');
    
    if (!select) return;
    
    // Cargar todos los dirigentes para el filtro
    const todosLosDirigentes = appState.todosLosDirigentes || appState.dirigentes;
    
    // Limpiar select
    select.innerHTML = '';
    
    // Filtrar dirigentes
    const dirigentesFiltrados = todosLosDirigentes.filter(dirigente => 
        dirigente.nombre.toLowerCase().includes(busqueda) ||
        dirigente.cedula.includes(busqueda) ||
        (dirigente.comunidad && dirigente.comunidad.toLowerCase().includes(busqueda)) ||
        (dirigente.corregimiento && dirigente.corregimiento.toLowerCase().includes(busqueda))
    );
    
    // Agregar opción por defecto
    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = dirigentesFiltrados.length === 0 ? 
        '❌ No se encontraron dirigentes' : 
        `👥 ${dirigentesFiltrados.length} dirigente(s) encontrado(s)`;
    optionDefault.disabled = true;
    select.appendChild(optionDefault);
    
    // Agregar dirigentes filtrados
    dirigentesFiltrados.forEach(dirigente => {
        const option = document.createElement('option');
        option.value = dirigente.id;
        option.textContent = `${dirigente.nombre} - Cédula: ${dirigente.cedula} - ${dirigente.comunidad}`;
        option.title = `Corregimiento: ${dirigente.corregimiento} | Coordinador: ${dirigente.coordinador}`;
        select.appendChild(option);
    });
    
    // Actualizar contador
    if (contador) {
        contador.textContent = `${dirigentesFiltrados.length} dirigente(s) encontrado(s)`;
    }
    
    // Si hay solo un resultado, seleccionarlo automáticamente
    if (dirigentesFiltrados.length === 1 && busqueda.length > 2) {
        select.value = dirigentesFiltrados[0].id;
    }
}

// 🆕 MODIFICAR función actualizarSelectDirigentes
async function actualizarSelectDirigentes() {
    try {
        // Cargar TODOS los dirigentes para el buscador
        const response = await fetch('/api/dirigentes/todos');
        const todosLosDirigentes = await response.json();
        
        appState.todosLosDirigentes = todosLosDirigentes;
        
        const select = document.getElementById('apoyo-dirigente');
        if (!select) return;
        
        // Inicializar con todos los dirigentes
        select.innerHTML = '<option value="">Seleccione un dirigente de la lista</option>';
        
        todosLosDirigentes.forEach(dirigente => {
            const option = document.createElement('option');
            option.value = dirigente.id;
            option.textContent = `${dirigente.nombre} - Cédula: ${dirigente.cedula} - ${dirigente.comunidad}`;
            select.appendChild(option);
        });
        
        console.log(`✅ ${todosLosDirigentes.length} dirigentes cargados para buscador`);
        
    } catch (error) {
        console.error('Error cargando todos los dirigentes:', error);
    }
}

// 🆕 MODIFICAR función mostrarFormApoyo
function mostrarFormApoyo() {
    document.getElementById('form-apoyo').classList.remove('hidden');
    configurarFechaAutomatica();
    
    // Enfocar en el buscador automáticamente
    setTimeout(() => {
        const buscador = document.getElementById('buscar-dirigente-apoyo');
        if (buscador) {
            buscador.focus();
        }
    }, 100);
}

