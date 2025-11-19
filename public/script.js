// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    colaboradores: [],
    apoyos: [],
    todosLosDirigentes: [],
    userRol: null
};

// Inicialización SEGURA
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página cargada correctamente');
    checkAuthStatus();
    
    // Configurar event listeners de forma SEGURA
    const formDirigente = document.getElementById('dirigente-form');
    const formApoyo = document.getElementById('apoyo-form');
    
    if (formDirigente) {
        formDirigente.addEventListener('submit', guardarDirigente);
    }
    
    if (formApoyo) {
        formApoyo.addEventListener('submit', registrarApoyo);
    }
    
    console.log('✅ Event listeners configurados');
});

// 🆕 FUNCIÓN LOGIN SUPER SEGURA
async function login() {
    console.log('🔄 Botón login presionado');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        console.log('📡 Enviando credenciales...');
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📨 Respuesta recibida:', response.status);
        
        const data = await response.json();
        console.log('📊 Datos respuesta:', data);
        
        if (data.success) {
            appState.isAuthenticated = true;
            appState.userRol = data.rol;
            console.log('✅ Login exitoso como:', data.rol);
            
            actualizarUI();
            await cargarDatos();
            mostrarNotificacion(`Sesión iniciada como ${data.rol}`, 'success');
        } else {
            console.log('❌ Login fallido:', data.error);
            mostrarNotificacion(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('💥 Error en login:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

async function logout() {
    try {
        await fetch('/logout');
        appState.isAuthenticated = false;
        appState.userRol = null;
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
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const adminPanel = document.getElementById('admin-panel');
    
    if (appState.isAuthenticated) {
        if (loginForm) loginForm.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');
    } else {
        if (loginForm) loginForm.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
    }
}

// Cargar datos básicos
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando datos...');
    await cargarDirigentes();
    await cargarColaboradores();
    await cargarApoyos();
    console.log('✅ Todos los datos cargados');
}

// Funciones básicas de dirigentes
async function cargarDirigentes() {
    try {
        const response = await fetch('/api/dirigentes');
        const data = await response.json();
        
        if (response.ok) {
            appState.dirigentes = data;
            console.log('✅ Dirigentes cargados:', data.length);
        }
    } catch (error) {
        console.error('Error al cargar dirigentes:', error);
    }
}

// Funciones básicas de colaboradores
async function cargarColaboradores() {
    try {
        const response = await fetch('/api/colaboradores');
        const data = await response.json();
        
        if (response.ok) {
            appState.colaboradores = data;
            actualizarSelectColaboradores();
            console.log('✅ Colaboradores cargados:', data.length);
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

// Funciones básicas de apoyos
async function cargarApoyos() {
    try {
        const response = await fetch('/api/apoyos');
        const data = await response.json();
        
        if (response.ok) {
            appState.apoyos = data;
            renderizarApoyos();
            console.log('✅ Apoyos cargados:', data.length);
        }
    } catch (error) {
        console.error('Error al cargar apoyos:', error);
    }
}

// 🆕 FUNCIÓN SEGURA PARA RENDERIZAR APOYOS
function renderizarApoyos() {
    const tbody = document.getElementById('apoyos-body');
    if (!tbody) {
        console.log('❌ Tabla de apoyos no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!appState.apoyos || appState.apoyos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                    No hay apoyos registrados
                </td>
            </tr>
        `;
        return;
    }
    
    appState.apoyos.forEach(apoyo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${apoyo.dirigente_nombre || 'Desconocido'}</strong>
                ${apoyo.dirigente_cedula ? `<br><small style="color: #666;">Cédula: ${apoyo.dirigente_cedula}</small>` : ''}
            </td>
            <td style="text-transform: uppercase; font-weight: bold;">${apoyo.tipo}</td>
            <td>${apoyo.descripcion || '-'}</td>
            <td>${apoyo.monto ? `$${parseFloat(apoyo.monto).toFixed(2)}` : '-'}</td>
            <td>${new Date(apoyo.fecha).toLocaleDateString()}</td>
            <td class="actions">
                <button class="constancia" onclick="generarConstanciaApoyo(${apoyo.id})">
                    📄 Constancia
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Funciones básicas de formularios
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
            await cargarApoyos();
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

function generarConstanciaApoyo(apoyoId) {
    window.open(`/constancia-apoyo/${apoyoId}`, '_blank');
}

// Búsqueda pública básica
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
