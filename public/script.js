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

// 🆕 FUNCIÓN COMPLETAMENTE ACTUALIZADA
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    // 1. Primero cargar los dirigentes
    await cargarDirigentes();
    
    // 2. Luego cargar el resto de datos
    await cargarColaboradores();
    await cargarApoyos();
    await cargarDashboard();
    
    // 🆕 INICIALIZAR COMPONENTES DESPUÉS DE CARGAR DATOS
    setTimeout(() => {
        renderizarDirigentes();      
        inicializarFiltros();        
        cargarCorregimientos();
        inicializarBuscadorApoyos();
        console.log('✅ Todos los componentes inicializados');
    }, 100);
    
    console.log('✅ Todos los datos cargados');
}

// 🆕 FUNCIÓN MEJORADA - CARGAR TODOS LOS DIRIGENTES
async function cargarDirigentes() {
    try {
        // 🆕 Cambiar para cargar TODOS los dirigentes, no solo los últimos 10
        const response = await fetch('/api/dirigentes/todos'); // 🆕 Usar esta ruta
        const data = await response.json();
        
        if (response.ok) {
            appState.dirigentes = data;
            appState.todosLosDirigentes = data; // 🆕 Guardar copia de todos
            console.log('✅ TODOS los dirigentes cargados:', data.length);
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

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR FORMULARIO DE APOYO
function mostrarFormApoyo(dirigenteId = null, dirigenteNombre = null) {
    const form = document.getElementById('form-apoyo');
    if (!form) return;
    
    // Mostrar formulario
    form.classList.remove('hidden');
    
    // 🆕 INICIALIZAR COMPONENTES
    configurarFechaAutomatica();
    configurarTipoApoyo();
    inicializarBuscadorApoyos();
    
    // 🆕 CARGAR DIRIGENTES EN EL SELECT
    actualizarSelectDirigentes();
    
    // 🆕 SI SE PASA UN DIRIGENTE ESPECÍFICO, SELECCIONARLO
    if (dirigenteId && dirigenteNombre) {
        setTimeout(() => {
            const select = document.getElementById('apoyo-dirigente');
            if (select) {
                select.value = dirigenteId;
                // Actualizar buscador para mostrar el dirigente seleccionado
                const buscador = document.getElementById('buscar-dirigente-apoyo');
                if (buscador) {
                    buscador.value = dirigenteNombre;
                    buscador.dispatchEvent(new Event('input'));
                }
            }
        }, 100);
    }
    
    console.log('✅ Formulario de apoyo listo');
}

function ocultarFormApoyo() {
    document.getElementById('form-apoyo').classList.add('hidden');
}

// 🆕 FUNCIÓN MEJORADA PARA REGISTRAR APOYO
async function registrarApoyo(event) {
    event.preventDefault();
    
    const dirigenteId = document.getElementById('apoyo-dirigente').value;
    const colaboradorId = document.getElementById('apoyo-colaborador').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    
    // 🆕 VALIDACIONES MEJORADAS
    if (!dirigenteId) {
        mostrarNotificacion('❌ Debe seleccionar un dirigente', 'error');
        return;
    }
    
    if (!colaboradorId) {
        mostrarNotificacion('❌ Debe seleccionar un colaborador que entrega el apoyo', 'error');
        return;
    }
    
    if (!tipo) {
        mostrarNotificacion('❌ Debe seleccionar el tipo de apoyo', 'error');
        return;
    }
    
    // Validar monto para apoyos económicos
    if (tipo === 'economico' && (!monto || parseFloat(monto) <= 0)) {
        mostrarNotificacion('❌ Para apoyo económico debe ingresar un monto válido', 'error');
        return;
    }
    
    const apoyoData = {
        dirigente_id: dirigenteId,
        colaborador_id: colaboradorId,
        tipo,
        descripcion: descripcion || `Apoyo ${tipo} registrado`,
        monto: tipo === 'economico' ? parseFloat(monto) : null
    };
    
    console.log('📤 Enviando apoyo:', apoyoData);
    
    try {
        const response = await fetch('/api/apoyos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apoyoData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion('✅ Apoyo registrado exitosamente', 'success');
            ocultarFormApoyo();
            
            // 🆕 LIMPIAR FORMULARIO
            document.getElementById('apoyo-form').reset();
            configurarTipoApoyo(); // Resetear visibilidad monto
            
            // 🆕 ACTUALIZAR DATOS
            await cargarApoyos();
            await cargarDashboard();
            
        } else {
            mostrarNotificacion(`❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('💥 Error al registrar apoyo:', error);
        mostrarNotificacion('❌ Error al conectar con el servidor', 'error');
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

// 🆕 FUNCIÓN MEJORADA PARA RENDERIZAR DIRIGENTES
function renderizarDirigentes(mostrarTodos = false) {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) {
        console.log('❌ Tabla de dirigentes no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    // 🆕 Decidir qué dirigentes mostrar
    const dirigentesAMostrar = mostrarTodos ? 
        appState.dirigentes : 
        obtenerUltimosDirigentes();
    
    if (!dirigentesAMostrar || dirigentesAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    No hay dirigentes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    dirigentesAMostrar.forEach(dirigente => {
        const tr = document.createElement('tr');
        const claseParticipacion = `participacion-${dirigente.participacion}`;
        const textoParticipacion = dirigente.participacion === 'buena' ? 'Buena' : 
                                 dirigente.participacion === 'mala' ? 'Mala' : 'Regular';
        
        tr.innerHTML = `
            <td>${dirigente.nombre}</td>
            <td>${dirigente.cedula}</td>
            <td>${dirigente.telefono || 'No registrado'}</td>
            <td>${dirigente.corregimiento}</td>
            <td>${dirigente.comunidad}</td>
            <td>${dirigente.coordinador}</td>
            <td class="${claseParticipacion}">${textoParticipacion}</td>
            <td class="actions">
                <button class="edit" onclick="editarDirigente(${dirigente.id})">Editar</button>
                <button class="delete" onclick="eliminarDirigente(${dirigente.id})">Eliminar</button>
                <button class="constancia" onclick="generarConstancia(${dirigente.id})">Constancia</button>
                <button class="apoyo" onclick="registrarApoyoDirigente(${dirigente.id}, '${dirigente.nombre}')">Registrar Apoyo</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Mostrando', dirigentesAMostrar.length, 'dirigentes');
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

// 🆕 FUNCIÓN CORREGIDA PARA CARGAR CORREGIMIENTOS
async function cargarCorregimientos() {
    try {
        // Obtener corregimientos ÚNICOS de los dirigentes existentes
        const corregimientos = [...new Set(appState.dirigentes.map(d => d.corregimiento))].filter(Boolean);
        
        const select = document.getElementById('filtro-corregimiento');
        if (!select) return;
        
        // Guardar el valor seleccionado actual
        const valorActual = select.value;
        
        // Limpiar y agregar opciones
        select.innerHTML = '<option value="">Todos los corregimientos</option>';
        
        corregimientos.sort().forEach(corregimiento => {
            const option = document.createElement('option');
            option.value = corregimiento;
            option.textContent = corregimiento;
            select.appendChild(option);
        });
        
        // Restaurar selección si existe
        if (valorActual && corregimientos.includes(valorActual)) {
            select.value = valorActual;
        }
        
        console.log('✅ Corregimientos cargados:', corregimientos.length);
    } catch (error) {
        console.log('❌ Error cargando corregimientos:', error);
    }
}

// 🆕 FUNCIÓN MEJORADA PARA FILTRAR DIRIGENTES
async function filtrarDirigentes() {
    const query = document.getElementById('buscar-dirigente')?.value.toLowerCase() || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    
    console.log('🔍 Filtros aplicados:', { query, corregimiento, participacion });
    
    try {
        // Primero intentar con el servidor
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (corregimiento) params.append('corregimiento', corregimiento);
        if (participacion) params.append('participacion', participacion);
        
        const response = await fetch(`/api/dirigentes/buscar?${params}`);
        
        if (response.ok) {
            const dirigentesFiltrados = await response.json();
            mostrarDirigentesFiltrados(dirigentesFiltrados);
        } else {
            throw new Error('Error del servidor');
        }
    } catch (error) {
        console.log('🔄 Usando filtrado local:', error);
        // Fallback: filtrar localmente
        filtrarDirigentesLocalmente(query, corregimiento, participacion);
    }
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR DIRIGENTES FILTRADOS
function mostrarDirigentesFiltrados(dirigentesFiltrados) {
    const tbody = document.getElementById('dirigentes-body');
    const infoResultados = document.getElementById('info-resultados');
    const contadorFiltrados = document.getElementById('contador-filtrados');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Mostrar información de resultados
    if (infoResultados && contadorFiltrados) {
        contadorFiltrados.textContent = dirigentesFiltrados.length;
        
        if (dirigentesFiltrados.length !== appState.dirigentes.length) {
            infoResultados.style.display = 'block';
        } else {
            infoResultados.style.display = 'none';
        }
    }
    
    if (dirigentesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    🔍 No se encontraron dirigentes con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    dirigentesFiltrados.forEach(dirigente => {
        const tr = document.createElement('tr');
        const claseParticipacion = `participacion-${dirigente.participacion || 'regular'}`;
        const textoParticipacion = dirigente.participacion === 'buena' ? 'Buena' : 
                                 dirigente.participacion === 'mala' ? 'Mala' : 'Regular';
        
        tr.innerHTML = `
            <td>${dirigente.nombre || 'No especificado'}</td>
            <td>${dirigente.cedula || 'No especificado'}</td>
            <td>${dirigente.telefono || 'No registrado'}</td>
            <td>${dirigente.corregimiento || 'No especificado'}</td>
            <td>${dirigente.comunidad || 'No especificado'}</td>
            <td>${dirigente.coordinador || 'No especificado'}</td>
            <td class="${claseParticipacion}">${textoParticipacion}</td>
            <td class="actions">
                <button class="edit" onclick="editarDirigente(${dirigente.id})">Editar</button>
                <button class="delete" onclick="eliminarDirigente(${dirigente.id})">Eliminar</button>
                <button class="constancia" onclick="generarConstancia(${dirigente.id})">Constancia</button>
                <button class="apoyo" onclick="registrarApoyoDirigente(${dirigente.id}, '${dirigente.nombre}')">Registrar Apoyo</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Mostrando', dirigentesFiltrados.length, 'dirigentes filtrados');
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

// 🆕 FUNCIÓN MEJORADA PARA FILTRADO LOCAL
function filtrarDirigentesLocalmente(query, corregimiento, participacion) {
    
    console.log('🔍 FILTRANDO con', appState.dirigentes.length, 'dirigentes totales');
    
    let dirigentesFiltrados = [...appState.dirigentes];
    
    console.log('📊 Total dirigentes para filtrar:', dirigentesFiltrados.length);
    
    // Filtro por búsqueda (nombre, cédula, comunidad, coordinador)
    if (query) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            (d.nombre && d.nombre.toLowerCase().includes(query)) ||
            (d.cedula && d.cedula.includes(query)) ||
            (d.comunidad && d.comunidad.toLowerCase().includes(query)) ||
            (d.coordinador && d.coordinador.toLowerCase().includes(query))
        );
        console.log('📝 Después de búsqueda:', dirigentesFiltrados.length);
    }
    
    // Filtro por corregimiento
    if (corregimiento) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            d.corregimiento && d.corregimiento === corregimiento
        );
        console.log('🏘️ Después de corregimiento:', dirigentesFiltrados.length);
    }
    
    // Filtro por participación
    if (participacion) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            d.participacion && d.participacion === participacion
        );
        console.log('⭐ Después de participación:', dirigentesFiltrados.length);
    }
    
    mostrarDirigentesFiltrados(dirigentesFiltrados);
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR TODOS LOS DIRIGENTES
function mostrarTodosLosDirigentes() {
    renderizarDirigentes(true); // 🆕 true = mostrar todos
    mostrarNotificacion(`Mostrando todos los ${appState.dirigentes.length} dirigentes`, 'success');
    
    // Ocultar el botón "Ver todos" ya que ya estamos viendo todos
    const infoResultados = document.getElementById('info-resultados');
    if (infoResultados) {
        infoResultados.style.display = 'none';
    }
}

// 🆕 FUNCIÓN MEJORADA PARA ACTUALIZAR SELECT DE DIRIGENTES
function actualizarSelectDirigentes(dirigentesFiltrados = null) {
    const select = document.getElementById('apoyo-dirigente');
    if (!select) return;
    
    // Usar dirigentes filtrados o todos
    const dirigentes = dirigentesFiltrados || appState.dirigentes;
    
    // Guardar selección actual
    const seleccionActual = select.value;
    
    // Limpiar select
    select.innerHTML = '<option value="">Seleccione un dirigente</option>';
    
    if (!dirigentes || dirigentes.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay dirigentes disponibles";
        select.appendChild(option);
        return;
    }
    
    // Agregar opciones
    dirigentes.forEach(dirigente => {
        const option = document.createElement('option');
        option.value = dirigente.id;
        option.textContent = `${dirigente.nombre} - Cédula: ${dirigente.cedula} - ${dirigente.comunidad}`;
        select.appendChild(option);
    });
    
    // Restaurar selección si existe
    if (seleccionActual) {
        select.value = seleccionActual;
    }
}

// 🆕 FUNCIÓN PARA OBTENER SOLO LOS ÚLTIMOS 10 DIRIGENTES (para el dashboard)
function obtenerUltimosDirigentes() {
    if (!appState.dirigentes || appState.dirigentes.length === 0) {
        return [];
    }
    
    // Ordenar por fecha de creación (más recientes primero) y tomar 10
    return [...appState.dirigentes]
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        .slice(0, 10);
}

// 🆕 FUNCIÓN PARA EL BUSCADOR INTELIGENTE DE DIRIGENTES EN APOYOS
function inicializarBuscadorApoyos() {
    const buscador = document.getElementById('buscar-dirigente-apoyo');
    const selectDirigentes = document.getElementById('apoyo-dirigente');
    const contador = document.getElementById('contador-resultados');
    
    if (!buscador || !selectDirigentes) return;
    
    buscador.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (!appState.dirigentes || appState.dirigentes.length === 0) {
            console.log('❌ No hay dirigentes cargados');
            return;
        }
        
        // Filtrar dirigentes
        const dirigentesFiltrados = appState.dirigentes.filter(dirigente => 
            dirigente.nombre.toLowerCase().includes(query) ||
            dirigente.cedula.includes(query) ||
            dirigente.comunidad.toLowerCase().includes(query)
        );
        
        // Actualizar el select
        actualizarSelectDirigentes(dirigentesFiltrados);
        
        // Actualizar contador
        if (contador) {
            contador.textContent = `${dirigentesFiltrados.length} dirigentes encontrados`;
            contador.style.color = dirigentesFiltrados.length > 0 ? 'green' : 'red';
        }
        
        console.log('🔍 Buscador apoyos:', query, '- Resultados:', dirigentesFiltrados.length);
    });
}














