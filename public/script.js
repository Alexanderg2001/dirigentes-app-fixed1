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

// 🆕 FUNCIÓN MEJORADA PARA CARGAR DATOS
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    await cargarDirigentes();
    await cargarColaboradores();
    await cargarApoyos();
    await cargarDashboard();
    
    // 🆕 INICIALIZAR COMPONENTES DESPUÉS DE CARGAR DATOS
    setTimeout(() => {
        renderizarDirigentes();
        inicializarFiltros();
        console.log('✅ Todos los componentes inicializados');
    }, 100);
    
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
            await cargarDirigentes();
            await renderizarDirigentes();
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
            await cargarDashboard(); // 🆕 Actualizar dashboard
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

// 🆕 FUNCIÓN MEJORADA - BUSCAR DIRIGENTE CON APOYOS
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
            const apoyos = data.apoyos || [];
            const claseParticipacion = `participacion-${dirigente.participacion}`;
            
            // 🆕 CALCULAR TOTAL DE APOYOS ECONÓMICOS
            const totalEconomico = apoyos
                .filter(a => a.tipo === 'economico' && a.monto)
                .reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
            
            searchResult.innerHTML = `
                <div class="result-found">
                    <h3>✅ ¡Dirigente encontrado!</h3>
                    
                    <!-- INFORMACIÓN DEL DIRIGENTE -->
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px; color: #2c3e50;">📋 Información del Dirigente</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <p><strong>Nombre:</strong> ${dirigente.nombre}</p>
                            <p><strong>Cédula:</strong> ${dirigente.cedula}</p>
                            <p><strong>Teléfono:</strong> ${dirigente.telefono || 'No registrado'}</p>
                            <p><strong>Corregimiento:</strong> ${dirigente.corregimiento}</p>
                            <p><strong>Comunidad:</strong> ${dirigente.comunidad}</p>
                            <p><strong>Coordinador:</strong> ${dirigente.coordinador}</p>
                            <p><strong>Participación:</strong> <span class="${claseParticipacion}">${dirigente.participacion}</span></p>
                            <p><strong>Total apoyos económicos:</strong> <span style="color: #27ae60; font-weight: bold;">$${totalEconomico.toFixed(2)}</span></p>
                        </div>
                    </div>
                    
                    <!-- 🆕 HISTORIAL DE APOYOS -->
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;">📦 Historial de Apoyos Entregados (${apoyos.length})</h4>
                        
                        ${apoyos.length > 0 ? `
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                                    <thead>
                                        <tr style="background: #e3f2fd;">
                                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Fecha</th>
                                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Tipo</th>
                                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Descripción</th>
                                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Monto</th>
                                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Entregado por</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${apoyos.map(apoyo => `
                                            <tr>
                                                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(apoyo.fecha).toLocaleDateString('es-PA')}</td>
                                                <td style="padding: 8px; border: 1px solid #ddd; text-transform: uppercase; font-weight: bold;">${apoyo.tipo}</td>
                                                <td style="padding: 8px; border: 1px solid #ddd;">${apoyo.descripcion || '-'}</td>
                                                <td style="padding: 8px; border: 1px solid #ddd; ${apoyo.tipo === 'economico' ? 'color: #27ae60; font-weight: bold;' : ''}">
                                                    ${apoyo.tipo === 'economico' && apoyo.monto ? `$${parseFloat(apoyo.monto).toFixed(2)}` : '-'}
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #ddd;">${apoyo.colaborador_nombre || 'No especificado'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                                📊 Total de apoyos registrados: <strong>${apoyos.length}</strong>
                            </p>
                        ` : `
                            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 6px;">
                                <p style="color: #666; margin: 0;">📭 No se han registrado apoyos para este dirigente</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } else {
            searchResult.innerHTML = `
                <div class="result-not-found">
                    <h3>❌ Dirigente no encontrado</h3>
                    <p>No se encontró ningún dirigente registrado con la cédula: <strong>${cedula}</strong></p>
                    <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        Verifique que el número de cédula esté correcto.
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        searchResult.innerHTML = `
            <div class="result-not-found">
                <h3>⚠️ Error en la búsqueda</h3>
                <p>Ocurrió un error al buscar el dirigente. Por favor, intente nuevamente.</p>
            </div>
        `;
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

// =============================================
// 🆕 FUNCIONES NUEVAS AGREGADAS
// =============================================

// 🆕 FUNCIONES DEL DASHBOARD
async function cargarDashboard() {
    if (!appState.isAuthenticated) return;
    
    try {
        const response = await fetch('/api/estadisticas');
        if (!response.ok) return;
        
        const estadisticas = await response.json();
        actualizarDashboard(estadisticas);
    } catch (error) {
        console.log('Dashboard no disponible, usando cálculos locales');
        calcularEstadisticasLocales();
    }
}

function actualizarDashboard(estadisticas) {
    // Total de dirigentes
    const totalDirigentes = estadisticas.totalDirigentes || appState.dirigentes.length;
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    
    // Total de apoyos
    const totalApoyos = estadisticas.totalApoyos || appState.apoyos.length;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    
    // Buena participación
    const buenaParticipacion = estadisticas.participacion?.find(p => p.participacion === 'buena')?.total || 
                              appState.dirigentes.filter(d => d.participacion === 'buena').length;
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    
    // Apoyos económicos
    const totalMonto = estadisticas.apoyos?.find(a => a.tipo === 'economico')?.total_monto || 
                      appState.apoyos.filter(a => a.tipo === 'economico').reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
}

function calcularEstadisticasLocales() {
    const totalDirigentes = appState.dirigentes.length;
    const totalApoyos = appState.apoyos.length;
    const buenaParticipacion = appState.dirigentes.filter(d => d.participacion === 'buena').length;
    const totalMonto = appState.apoyos.filter(a => a.tipo === 'economico').reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
    
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
}

// 🆕 FUNCIÓN PARA MOSTRAR DIRIGENTES EN LA TABLA
function renderizarDirigentes() {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) {
        console.log('❌ Tabla de dirigentes no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!appState.dirigentes || appState.dirigentes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    No hay dirigentes registrados
                </td>
            </tr>
        `;
        return;
    }
    
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

// 🆕 FUNCIONES PARA EDITAR Y ELIMINAR DIRIGENTES
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
            await cargarDirigentes(); // Recargar la lista
            await renderizarDirigentes(); // Actualizar tabla
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

function registrarApoyoDirigente(dirigenteId, dirigenteNombre) {
    mostrarFormApoyo();
    mostrarNotificacion(`Dirigente "${dirigenteNombre}" seleccionado para registro de apoyo`, 'success');
}

// 🆕 FUNCIONES PARA FILTROS DE DIRIGENTES
function inicializarFiltros() {
    const buscarInput = document.getElementById('buscar-dirigente');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento');
    const filtroParticipacion = document.getElementById('filtro-participacion');
    
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            setTimeout(() => filtrarDirigentes(), 300);
        });
    }
    
    if (filtroCorregimiento) {
        filtroCorregimiento.addEventListener('change', filtrarDirigentes);
    }
    
    if (filtroParticipacion) {
        filtroParticipacion.addEventListener('change', filtrarDirigentes);
    }
    
    // Cargar opciones de corregimientos
    cargarCorregimientos();
}

async function cargarCorregimientos() {
    try {
        const response = await fetch('/api/corregimientos');
        const corregimientos = await response.json();
        
        const select = document.getElementById('filtro-corregimiento');
        if (select && corregimientos.length > 0) {
            corregimientos.forEach(corregimiento => {
                const option = document.createElement('option');
                option.value = corregimiento.nombre;
                option.textContent = corregimiento.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.log('No se pudieron cargar corregimientos');
    }
}

async function filtrarDirigentes() {
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
            mostrarDirigentesFiltrados(dirigentesFiltrados);
        }
    } catch (error) {
        console.error('Error filtrando dirigentes:', error);
        // Fallback: filtrar localmente
        filtrarDirigentesLocalmente(query, corregimiento, participacion);
    }
}

function mostrarDirigentesFiltrados(dirigentesFiltrados) {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    dirigentesFiltrados.forEach(dirigente => {
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
                <button class="edit" onclick="editarDirigenteDesdeFiltro(${dirigente.id})">Editar</button>
                <button class="delete" onclick="eliminarDirigente(${dirigente.id})">Eliminar</button>
                <button class="constancia" onclick="generarConstancia(${dirigente.id})">Constancia</button>
                <button class="apoyo" onclick="registrarApoyoDirigente(${dirigente.id}, '${dirigente.nombre}')">Registrar Apoyo</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// 🆕 FUNCIÓN ESPECIAL PARA EDITAR DESDE FILTROS
async function editarDirigenteDesdeFiltro(id) {
    try {
        // Cargar el dirigente específico desde el servidor
        const response = await fetch(`/api/dirigentes/${id}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar el dirigente');
        }
        
        const dirigente = await response.json();
        mostrarFormDirigente(dirigente);
        
    } catch (error) {
        console.error('Error al cargar dirigente para editar:', error);
        // Intentar encontrar en los datos locales
        const dirigenteLocal = appState.dirigentes.find(d => d.id === id);
        if (dirigenteLocal) {
            mostrarFormDirigente(dirigenteLocal);
        } else {
            mostrarNotificacion('No se pudo cargar el dirigente para editar', 'error');
        }
    }
}

function filtrarDirigentesLocalmente(query, corregimiento, participacion) {
    let dirigentesFiltrados = appState.dirigentes;
    
    if (query) {
        const q = query.toLowerCase();
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            d.nombre.toLowerCase().includes(q) ||
            d.cedula.includes(q) ||
            d.comunidad.toLowerCase().includes(q) ||
            d.coordinador.toLowerCase().includes(q)
        );
    }
    
    if (corregimiento) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => d.corregimiento === corregimiento);
    }
    
    if (participacion) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => d.participacion === participacion);
    }
    
    mostrarDirigentesFiltrados(dirigentesFiltrados);
}

function mostrarTodosLosDirigentes() {
    // Volver a cargar los últimos 10 dirigentes
    cargarDirigentes();
    renderizarDirigentes();
}

// 🆕 FUNCIÓN PARA ACTUALIZAR SELECT DE DIRIGENTES EN APOYOS
async function actualizarSelectDirigentes() {
    try {
        // Cargar TODOS los dirigentes para el selector de apoyos
        const response = await fetch('/api/dirigentes/todos');
        const todosLosDirigentes = await response.json();
        
        const select = document.getElementById('apoyo-dirigente');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione un dirigente</option>';
        
        todosLosDirigentes.forEach(dirigente => {
            const option = document.createElement('option');
            option.value = dirigente.id;
            option.textContent = `${dirigente.nombre} - ${dirigente.cedula}`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando dirigentes para selector:', error);
    }
}


