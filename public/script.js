// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    colaboradores: [],
    apoyos: [],
    todosLosDirigentes: [],
    userRol: null
};

// FUNCIÓN LOGIN
async function login() {
    console.log('🔄 Botón login presionado');
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
            mostrarNotificacion(`Sesión iniciada como ${data.rol}`, 'success');
        } else {
            mostrarNotificacion(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// FUNCIÓN LOGOUT
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

// ACTUALIZAR UI
function actualizarUI() {
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const adminPanel = document.getElementById('admin-panel');
    
    if (appState.isAuthenticated) {
        if (loginForm) loginForm.classList.add('hidden');
        if (userInfo) {
            userInfo.classList.remove('hidden');
            document.getElementById('welcome-message').textContent = `Bienvenido, ${appState.userRol}`;
        }
        if (adminPanel) adminPanel.classList.remove('hidden');
        
        // Cargar datos después de iniciar sesión
        cargarDatos();
    } else {
        if (loginForm) loginForm.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
    }
}

// CARGAR DASHBOARD (CORREGIDA)
async function cargarDashboard() {
    if (!appState.isAuthenticated) return;
    
    console.log('📊 Cargando dashboard...');
    
    try {
        const response = await fetch('/api/estadisticas');
        
        if (response.ok) {
            const estadisticas = await response.json();
            console.log('📈 Estadísticas recibidas:', estadisticas);
            
            // Total de dirigentes
            const totalDirigentes = estadisticas.totalDirigentes || appState.dirigentes.length;
            document.getElementById('total-dirigentes').textContent = totalDirigentes;
            
            // Total de apoyos
            const totalApoyos = estadisticas.totalApoyos || appState.apoyos.length;
            document.getElementById('total-apoyos').textContent = totalApoyos;
            
            // Buena participación
            let buenaParticipacion = 0;
            if (estadisticas.participacion && Array.isArray(estadisticas.participacion)) {
                const buena = estadisticas.participacion.find(p => p.participacion === 'buena');
                buenaParticipacion = buena ? buena.total : 0;
            } else {
                buenaParticipacion = appState.dirigentes.filter(d => d.participacion === 'buena').length;
            }
            document.getElementById('buena-participacion').textContent = buenaParticipacion;
            
            // Monto total
            let totalMonto = 0;
            if (estadisticas.totalMontoGeneral !== undefined) {
                totalMonto = estadisticas.totalMontoGeneral;
            } else if (estadisticas.apoyos && Array.isArray(estadisticas.apoyos)) {
                totalMonto = estadisticas.apoyos.reduce((sum, apoyo) => sum + (apoyo.total_monto || 0), 0);
            } else {
                totalMonto = appState.apoyos.reduce((sum, apoyo) => sum + (parseFloat(apoyo.monto) || 0), 0);
            }
            document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
            
            console.log('✅ Dashboard actualizado correctamente');
        } else {
            console.log('⚠️ Usando cálculo local de estadísticas');
            calcularEstadisticasLocales();
        }
    } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
        calcularEstadisticasLocales();
    }
}

// CÁLCULO LOCAL DE ESTADÍSTICAS
function calcularEstadisticasLocales() {
    console.log('📊 Calculando estadísticas localmente...');
    
    const totalDirigentes = appState.dirigentes.length;
    const totalApoyos = appState.apoyos.length;
    const buenaParticipacion = appState.dirigentes.filter(d => d.participacion === 'buena').length;
    const totalMonto = appState.apoyos.reduce((sum, apoyo) => {
        return sum + (parseFloat(apoyo.monto) || 0);
    }, 0);
    
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
    
    console.log('✅ Dashboard actualizado localmente:', { totalDirigentes, totalApoyos, buenaParticipacion, totalMonto });
}

// CARGAR DATOS PRINCIPAL
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    try {
        await Promise.all([
            cargarDirigentes(),
            cargarColaboradores(), 
            cargarApoyos()
        ]);
        
        console.log('✅ Datos básicos cargados:', {
            dirigentes: appState.dirigentes.length,
            apoyos: appState.apoyos.length,
            colaboradores: appState.colaboradores.length
        });
        
        await cargarDashboard();
        
        setTimeout(() => {
            renderizarDirigentes();
            inicializarFiltros();
            cargarCorregimientos();
            actualizarSelectDirigentes();
            mostrarDashboard('dirigentes');
            setTimeout(inicializarFiltrosApoyos, 500);
            console.log('🎉 Todos los componentes inicializados correctamente');
        }, 200);
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        mostrarNotificacion('Error al cargar los datos del sistema', 'error');
    }
}

// CARGAR DIRIGENTES
async function cargarDirigentes() {
    try {
        const response = await fetch('/api/dirigentes/todos');
        if (response.ok) {
            const data = await response.json();
            appState.dirigentes = data;
            appState.todosLosDirigentes = data;
            console.log('✅ Dirigentes cargados:', data.length);
        }
    } catch (error) {
        console.error('Error al cargar dirigentes:', error);
    }
}

// CARGAR COLABORADORES
async function cargarColaboradores() {
    try {
        const response = await fetch('/api/colaboradores');
        if (response.ok) {
            const data = await response.json();
            appState.colaboradores = data;
            actualizarSelectColaboradores();
            console.log('✅ Colaboradores cargados:', data.length);
        }
    } catch (error) {
        console.error('Error al cargar colaboradores:', error);
    }
}

// CARGAR APOYOS
async function cargarApoyos() {
    try {
        const response = await fetch('/api/apoyos');
        if (response.ok) {
            const data = await response.json();
            appState.apoyos = data;
            renderizarApoyos();
            console.log('✅ Apoyos cargados:', data.length);
        }
    } catch (error) {
        console.error('Error al cargar apoyos:', error);
    }
}

// ACTUALIZAR SELECT COLABORADORES
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

// ACTUALIZAR SELECT DIRIGENTES
function actualizarSelectDirigentes(dirigentesFiltrados = null) {
    const select = document.getElementById('apoyo-dirigente');
    if (!select) return;
    
    const dirigentes = dirigentesFiltrados || appState.dirigentes;
    select.innerHTML = '<option value="">Seleccione un dirigente</option>';
    
    if (dirigentes && dirigentes.length > 0) {
        dirigentes.forEach(dirigente => {
            const option = document.createElement('option');
            option.value = dirigente.id;
            option.textContent = `${dirigente.nombre} - Cédula: ${dirigente.cedula} - ${dirigente.comunidad}`;
            select.appendChild(option);
        });
    }
}

// MOSTRAR FORMULARIO DIRIGENTE
function mostrarFormDirigente(dirigente = null) {
    const form = document.getElementById('form-dirigente');
    const title = document.getElementById('form-title');
    
    if (!form) return;
    
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
        document.getElementById('dirigente-informacion-adicional').value = dirigente.informacion_adicional || '';
    } else {
        title.textContent = 'Nuevo Dirigente';
        document.getElementById('dirigente-form').reset();
        const infoAdicional = document.getElementById('dirigente-informacion-adicional');
        if (infoAdicional) infoAdicional.value = '';
    }
    
    form.classList.remove('hidden');
}

function ocultarFormDirigente() {
    const form = document.getElementById('form-dirigente');
    if (form) form.classList.add('hidden');
}

// GUARDAR DIRIGENTE
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
    const informacionAdicional = document.getElementById('dirigente-informacion-adicional')?.value || '';
    
    const dirigenteData = { 
        nombre, cedula, telefono, corregimiento, comunidad, 
        coordinador, participacion,
        informacion_adicional: informacionAdicional
    };
    
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
            await cargarDashboard();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// ELIMINAR DIRIGENTE
async function eliminarDirigente(id) {
    if (!confirm('¿Está seguro de que desea eliminar este dirigente?')) return;
    
    try {
        const response = await fetch(`/api/dirigentes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            await cargarDirigentes();
            await renderizarDirigentes();
            await cargarDashboard();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// EDITAR DIRIGENTE
function editarDirigente(id) {
    const dirigente = appState.dirigentes.find(d => d.id === id);
    if (dirigente) {
        mostrarDashboard('dirigentes');
        setTimeout(() => {
            const seccionGestion = document.getElementById('gestion-dirigentes');
            if (seccionGestion) {
                seccionGestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => mostrarFormDirigente(dirigente), 500);
            }
        }, 300);
    }
}

// RENDERIZAR DIRIGENTES
function renderizarDirigentes(mostrarTodos = false) {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const dirigentesAMostrar = mostrarTodos ? appState.dirigentes : obtenerUltimosDirigentes();
    
    if (!dirigentesAMostrar || dirigentesAMostrar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No hay dirigentes registrados</td></tr>';
        return;
    }
    
    dirigentesAMostrar.forEach(dirigente => {
        const tr = document.createElement('tr');
        const claseParticipacion = `participacion-${dirigente.participacion}`;
        const textoParticipacion = dirigente.participacion === 'buena' ? 'Buena' : dirigente.participacion === 'mala' ? 'Mala' : 'Regular';
        
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
}

function obtenerUltimosDirigentes() {
    if (!appState.dirigentes || appState.dirigentes.length === 0) return [];
    return [...appState.dirigentes].sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en)).slice(0, 10);
}

// EXPORTAR DIRIGENTES A PDF
function exportarDirigentesPDF() {
    if (!appState.isAuthenticated) {
        mostrarNotificacion('❌ Debe iniciar sesión para exportar', 'error');
        return;
    }
    
    const query = document.getElementById('buscar-dirigente')?.value || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    const coordinador = document.getElementById('filtro-coordinador')?.value || '';
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (corregimiento && corregimiento !== '') params.append('corregimiento', corregimiento);
    if (participacion && participacion !== '') params.append('participacion', participacion);
    if (coordinador && coordinador !== '') params.append('coordinador', coordinador);
    
    window.open(`/api/exportar-dirigentes-pdf?${params.toString()}`, '_blank');
}

// GENERAR CONSTANCIA DIRIGENTE
function generarConstancia(dirigenteId) {
    window.open(`/constancia/${dirigenteId}`, '_blank');
}

// INICIALIZAR FILTROS
function inicializarFiltros() {
    const buscarInput = document.getElementById('buscar-dirigente');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento');
    const filtroParticipacion = document.getElementById('filtro-participacion');
    
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            clearTimeout(this.buscarTimeout);
            this.buscarTimeout = setTimeout(() => filtrarDirigentes(), 500);
        });
    }
    if (filtroCorregimiento) filtroCorregimiento.addEventListener('change', filtrarDirigentes);
    if (filtroParticipacion) filtroParticipacion.addEventListener('change', filtrarDirigentes);
    
    cargarCorregimientos();
}

function cargarCorregimientos() {
    const corregimientosFijos = [
        "Boca de Tucué", "Candelario Ovalle", "Cañaveral", "Chiguirí Arriba", "Coclé",
        "El Coco", "General Victoriano Lorenzo", "Las Minas", "Pajonal ", "Penonomé ",
        "Riecito", "Rio Grande ", "Río Indio", "San Miguel ", "Toabré", "Tulú"
    ];
    
    const selectFiltro = document.getElementById('filtro-corregimiento');
    if (selectFiltro) {
        selectFiltro.innerHTML = '<option value="">Todos los corregimientos</option>';
        corregimientosFijos.forEach(corregimiento => {
            const option = document.createElement('option');
            option.value = corregimiento;
            option.textContent = corregimiento;
            selectFiltro.appendChild(option);
        });
    }
}

async function filtrarDirigentes() {
    const query = document.getElementById('buscar-dirigente')?.value.toLowerCase() || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    
    let dirigentesFiltrados = [...appState.dirigentes];
    
    if (query) {
        const queryLower = query.toLowerCase().trim();
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            (d.nombre && d.nombre.toLowerCase().includes(queryLower)) ||
            (d.cedula && d.cedula.includes(query)) ||
            (d.comunidad && d.comunidad.toLowerCase().includes(queryLower)) ||
            (d.coordinador && d.coordinador.toLowerCase().includes(queryLower))
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

function mostrarDirigentesFiltrados(dirigentesFiltrados) {
    const tbody = document.getElementById('dirigentes-body');
    const infoResultados = document.getElementById('info-resultados');
    const contadorFiltrados = document.getElementById('contador-filtrados');
    
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (infoResultados && contadorFiltrados) {
        contadorFiltrados.textContent = dirigentesFiltrados.length;
        infoResultados.style.display = dirigentesFiltrados.length !== appState.dirigentes.length ? 'block' : 'none';
    }
    
    if (dirigentesFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">🔍 No se encontraron dirigentes</td></tr>';
        return;
    }
    
    dirigentesFiltrados.forEach(dirigente => {
        const tr = document.createElement('tr');
        const claseParticipacion = `participacion-${dirigente.participacion || 'regular'}`;
        const textoParticipacion = dirigente.participacion === 'buena' ? 'Buena' : dirigente.participacion === 'mala' ? 'Mala' : 'Regular';
        
        tr.innerHTML = `
            <td>${dirigente.nombre || ''}</td>
            <td>${dirigente.cedula || ''}</td>
            <td>${dirigente.telefono || 'No registrado'}</td>
            <td>${dirigente.corregimiento || ''}</td>
            <td>${dirigente.comunidad || ''}</td>
            <td>${dirigente.coordinador || ''}</td>
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
}

function mostrarTodosLosDirigentes() {
    renderizarDirigentes(true);
    mostrarNotificacion(`Mostrando todos los ${appState.dirigentes.length} dirigentes`, 'success');
    const infoResultados = document.getElementById('info-resultados');
    if (infoResultados) infoResultados.style.display = 'none';
}

// DASHBOARD
function mostrarDashboard(tipo) {
    const dashboardDirigentes = document.getElementById('dashboard-dirigentes');
    const dashboardElectoral = document.getElementById('dashboard-electoral');
    const btnDirigentes = document.getElementById('btn-dirigentes');
    const btnElectoral = document.getElementById('btn-electoral');
    
    if (dashboardDirigentes) dashboardDirigentes.classList.add('hidden');
    if (dashboardElectoral) dashboardElectoral.classList.add('hidden');
    if (btnDirigentes) btnDirigentes.style.background = '#3498db';
    if (btnElectoral) btnElectoral.style.background = '#9b59b6';
    
    if (tipo === 'dirigentes') {
        if (dashboardDirigentes) dashboardDirigentes.classList.remove('hidden');
        if (btnDirigentes) btnDirigentes.style.background = '#2980b9';
    } else if (tipo === 'electoral') {
        if (dashboardElectoral) dashboardElectoral.classList.remove('hidden');
        if (btnElectoral) btnElectoral.style.background = '#8e44ad';
    }
}

// APOYOS
function mostrarFormApoyo(dirigenteId = null, dirigenteNombre = null) {
    const form = document.getElementById('form-apoyo');
    if (!form) return;
    
    form.classList.remove('hidden');
    configurarFechaAutomatica();
    actualizarSelectDirigentes();
    
    if (dirigenteId && dirigenteNombre) {
        setTimeout(() => {
            const select = document.getElementById('apoyo-dirigente');
            if (select) select.value = dirigenteId;
        }, 100);
    }
}

function ocultarFormApoyo() {
    const form = document.getElementById('form-apoyo');
    if (form) form.classList.add('hidden');
}

function configurarFechaAutomatica() {
    const fechaInput = document.getElementById('apoyo-fecha');
    if (fechaInput) {
        const hoy = new Date();
        const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        fechaInput.value = fechaLocal;
    }
}

function registrarApoyoDirigente(dirigenteId, dirigenteNombre) {
    mostrarFormApoyo(dirigenteId, dirigenteNombre);
    mostrarNotificacion(`Dirigente "${dirigenteNombre}" seleccionado para registro de apoyo`, 'success');
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacionesExistentes = document.querySelectorAll('.notification');
    notificacionesExistentes.forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 5px; color: white; z-index: 10000; font-weight: bold;
        ${tipo === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
    `;
    
    document.body.appendChild(notificacion);
    setTimeout(() => {
        if (notificacion.parentNode) notificacion.parentNode.removeChild(notificacion);
    }, 4000);
}

function renderizarApoyos() {
    const tbody = document.getElementById('apoyos-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!appState.apoyos || appState.apoyos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No hay apoyos registrados</td></tr>';
        return;
    }
    
    appState.apoyos.forEach(apoyo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${apoyo.dirigente_nombre || 'Desconocido'}</strong>${apoyo.dirigente_cedula ? `<br><small>Cédula: ${apoyo.dirigente_cedula}</small>` : ''}</td>
            <td style="text-transform:uppercase;font-weight:bold;">${apoyo.tipo}</td>
            <td>${apoyo.descripcion || '-'}</td>
            <td>${apoyo.monto ? `$${parseFloat(apoyo.monto).toFixed(2)}` : '-'}</td>
            <td>${new Date(apoyo.fecha).toLocaleDateString()}</td>
            <td class="actions">
                <button class="edit" onclick="editarApoyo(${apoyo.id})">✏️ Editar</button>
                <button class="delete" onclick="eliminarApoyo(${apoyo.id})">🗑️ Eliminar</button>
                <button class="constancia" onclick="generarConstanciaApoyo(${apoyo.id})">📄 Constancia</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function generarConstanciaApoyo(apoyoId) {
    window.open(`/constancia-apoyo/${apoyoId}`, '_blank');
}

async function editarApoyo(apoyoId) {
    const apoyo = appState.apoyos.find(a => a.id === apoyoId);
    if (!apoyo) {
        mostrarNotificacion('❌ Apoyo no encontrado', 'error');
        return;
    }
    
    mostrarFormApoyo();
    setTimeout(() => {
        document.getElementById('apoyo-dirigente').value = apoyo.dirigente_id;
        document.getElementById('apoyo-colaborador').value = apoyo.colaborador_id;
        document.getElementById('apoyo-tipo').value = apoyo.tipo;
        document.getElementById('apoyo-descripcion').value = apoyo.descripcion || '';
        document.getElementById('apoyo-monto').value = apoyo.monto || '';
        const fecha = new Date(apoyo.fecha);
        document.getElementById('apoyo-fecha').value = fecha.toISOString().split('T')[0];
        
        const form = document.getElementById('apoyo-form');
        form.dataset.editingApoyoId = apoyoId;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Actualizar Apoyo';
        submitBtn.style.background = '#f39c12';
    }, 500);
}

async function eliminarApoyo(apoyoId) {
    const apoyo = appState.apoyos.find(a => a.id === apoyoId);
    if (!apoyo) {
        mostrarNotificacion('❌ Apoyo no encontrado', 'error');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de que desea ELIMINAR este apoyo?\n\nDirigente: ${apoyo.dirigente_nombre || 'Desconocido'}\nMonto: $${apoyo.monto ? parseFloat(apoyo.monto).toFixed(2) : '0.00'}`);
    if (!confirmacion) return;
    
    try {
        const response = await fetch(`/api/apoyos/${apoyoId}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            appState.apoyos = appState.apoyos.filter(a => a.id !== apoyoId);
            renderizarApoyos();
            await cargarDashboard();
            mostrarNotificacion('✅ Apoyo eliminado exitosamente', 'success');
        } else {
            mostrarNotificacion(`❌ Error: ${data.error || 'No se pudo eliminar'}`, 'error');
        }
    } catch (error) {
        mostrarNotificacion('❌ Error de conexión', 'error');
    }
}

async function registrarApoyo(event) {
    event.preventDefault();
    
    const form = document.getElementById('apoyo-form');
    const isEditing = form.dataset.editingApoyoId;
    
    const dirigenteId = document.getElementById('apoyo-dirigente').value;
    const colaboradorId = document.getElementById('apoyo-colaborador').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    const fecha = document.getElementById('apoyo-fecha').value;
    
    if (!dirigenteId || !colaboradorId || !tipo) {
        mostrarNotificacion('❌ Complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        mostrarNotificacion('❌ Ingrese un monto válido mayor a 0', 'error');
        return;
    }
    
    const apoyoData = { dirigente_id: dirigenteId, colaborador_id: colaboradorId, tipo, descripcion: descripcion || `Apoyo ${tipo} registrado`, monto: parseFloat(monto), fecha: fecha };
    
    try {
        let response;
        if (isEditing) {
            response = await fetch(`/api/apoyos/${isEditing}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apoyoData)
            });
        } else {
            response = await fetch('/api/apoyos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apoyoData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(isEditing ? '✅ Apoyo actualizado exitosamente' : `✅ Apoyo registrado exitosamente por $${parseFloat(monto).toFixed(2)}`, 'success');
            ocultarFormApoyo();
            form.reset();
            delete form.dataset.editingApoyoId;
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Registrar';
            submitBtn.style.background = '';
            await cargarApoyos();
            await cargarDashboard();
        } else {
            mostrarNotificacion(`❌ ${data.error || 'Error'}`, 'error');
        }
    } catch (error) {
        mostrarNotificacion('❌ Error de conexión con el servidor', 'error');
    }
}

function inicializarFiltrosApoyos() {
    const listaApoyos = document.getElementById('lista-apoyos');
    if (!listaApoyos || document.querySelector('.filtros-apoyos')) return;
    
    const filtrosHTML = `
        <div class="filtros-apoyos" style="margin-bottom:20px;padding:15px;background:#f8f9fa;border-radius:8px;border:2px solid #e9ecef;">
            <h3 style="margin-bottom:15px;">🔍 Filtros de Apoyos</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end;">
                <div><label style="display:block;margin-bottom:5px;font-weight:bold;">📦 Tipo:</label><select id="filtro-tipo-apoyo" style="width:100%;padding:8px;"><option value="">Todos</option><option value="economico">Económico</option><option value="viveres">Víveres</option><option value="otro">Otro</option></select></div>
                <div><label style="display:block;margin-bottom:5px;font-weight:bold;">📅 Desde:</label><input type="date" id="filtro-fecha-desde" style="width:100%;padding:8px;"></div>
                <div><label style="display:block;margin-bottom:5px;font-weight:bold;">📅 Hasta:</label><input type="date" id="filtro-fecha-hasta" style="width:100%;padding:8px;"></div>
                <div style="display:flex;gap:10px;"><button onclick="aplicarFiltrosApoyos()" style="background:#3498db;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;">🔍 Aplicar</button><button onclick="limpiarFiltrosApoyos()" style="background:#95a5a6;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;">🗑️ Limpiar</button></div>
            </div>
        </div>
    `;
    
    listaApoyos.insertAdjacentHTML('afterbegin', filtrosHTML);
}

function aplicarFiltrosApoyos() {
    const tipo = document.getElementById('filtro-tipo-apoyo').value;
    const fechaDesde = document.getElementById('filtro-fecha-desde').value;
    const fechaHasta = document.getElementById('filtro-fecha-hasta').value;
    
    let apoyosFiltrados = [...appState.apoyos];
    if (tipo) apoyosFiltrados = apoyosFiltrados.filter(a => a.tipo === tipo);
    if (fechaDesde) apoyosFiltrados = apoyosFiltrados.filter(a => new Date(a.fecha) >= new Date(fechaDesde));
    if (fechaHasta) apoyosFiltrados = apoyosFiltrados.filter(a => new Date(a.fecha) <= new Date(fechaHasta));
    
    mostrarApoyosFiltrados(apoyosFiltrados);
}

function mostrarApoyosFiltrados(apoyosFiltrados) {
    const tbody = document.getElementById('apoyos-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (apoyosFiltrados.length === 0) {
        tbody.innerHTML = '</tr><td colspan="6" style="text-align:center;padding:20px;">🔍 No se encontraron apoyos</td></tr>';
        return;
    }
    
    apoyosFiltrados.forEach(apoyo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${apoyo.dirigente_nombre || 'Desconocido'}</strong>${apoyo.dirigente_cedula ? `<br><small>Cédula: ${apoyo.dirigente_cedula}</small>` : ''}</td>
            <td style="text-transform:uppercase;font-weight:bold;">${apoyo.tipo}</td>
            <td>${apoyo.descripcion || '-'}</td>
            <td>${apoyo.monto ? `$${parseFloat(apoyo.monto).toFixed(2)}` : '-'}</td>
            <td>${new Date(apoyo.fecha).toLocaleDateString()}</td>
            <td class="actions">
                <button class="edit" onclick="editarApoyo(${apoyo.id})">✏️ Editar</button>
                <button class="delete" onclick="eliminarApoyo(${apoyo.id})">🗑️ Eliminar</button>
                <button class="constancia" onclick="generarConstanciaApoyo(${apoyo.id})">📄 Constancia</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function limpiarFiltrosApoyos() {
    document.getElementById('filtro-tipo-apoyo').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    mostrarApoyosFiltrados(appState.apoyos);
    mostrarNotificacion('✅ Filtros limpiados', 'success');
}

// FUNCIONES ELECTORALES (placeholder)
function mostrarFormularioElectoral() {
    const formulario = document.getElementById('formulario-electoral');
    if (formulario) formulario.classList.remove('hidden');
}

function ocultarFormularioElectoral() {
    const formulario = document.getElementById('formulario-electoral');
    if (formulario) formulario.classList.add('hidden');
}

function calcularTotales() {
    alert('Función en desarrollo');
}

function aplicarBusquedaElectoral() {
    console.log('Búsqueda electoral - en desarrollo');
}

function limpiarBusquedaElectoral() {
    console.log('Limpiar búsqueda electoral - en desarrollo');
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando sistema...');
    checkAuthStatus();
    
    const formDirigente = document.getElementById('dirigente-form');
    const formApoyo = document.getElementById('apoyo-form');
    const loginBtn = document.getElementById('btn-login');
    
    if (formDirigente) formDirigente.addEventListener('submit', guardarDirigente);
    if (formApoyo) formApoyo.addEventListener('submit', registrarApoyo);
    if (loginBtn) loginBtn.addEventListener('click', login);
    
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
    
    console.log('✅ Sistema inicializado correctamente');
});

// FUNCIÓN DE BÚSQUEDA PÚBLICA
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
            
            let historialHTML = '';
            if (apoyos.length > 0) {
                historialHTML = `
                    <div style="margin-top:20px;">
                        <h4>📦 Historial de Apoyos (${apoyos.length})</h4>
                        <table style="width:100%;border-collapse:collapse;">
                            <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Entregado por</th></tr></thead>
                            <tbody>
                                ${apoyos.map(a => `<tr><td>${new Date(a.fecha).toLocaleDateString()}</td><td>${a.tipo}</td><td>${a.monto ? `$${parseFloat(a.monto).toFixed(2)}` : '-'}</td><td>${a.colaborador_nombre || '-'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            searchResult.innerHTML = `
                <div class="result-found">
                    <h3>✅ Dirigente encontrado</h3>
                    <p><strong>Nombre:</strong> ${dirigente.nombre}</p>
                    <p><strong>Cédula:</strong> ${dirigente.cedula}</p>
                    <p><strong>Teléfono:</strong> ${dirigente.telefono || 'No registrado'}</p>
                    <p><strong>Corregimiento:</strong> ${dirigente.corregimiento}</p>
                    <p><strong>Comunidad:</strong> ${dirigente.comunidad}</p>
                    <p><strong>Coordinador:</strong> ${dirigente.coordinador}</p>
                    <p><strong>Participación:</strong> <span class="${claseParticipacion}">${dirigente.participacion}</span></p>
                    ${dirigente.informacion_adicional ? `<p><strong>Notas:</strong> ${dirigente.informacion_adicional}</p>` : ''}
                    ${historialHTML}
                    <button onclick="registrarApoyoDesdeVerificacion(${dirigente.id}, '${dirigente.nombre}', '${dirigente.cedula}')">➕ Registrar Apoyo</button>
                </div>
            `;
        } else {
            searchResult.innerHTML = `<div class="result-not-found"><h3>❌ Dirigente no encontrado</h3><p>Cédula: ${cedula}</p></div>`;
        }
    } catch (error) {
        searchResult.innerHTML = `<div class="result-not-found"><h3>⚠️ Error en la búsqueda</h3></div>`;
    }
}

function registrarApoyoDesdeVerificacion(dirigenteId, dirigenteNombre, dirigenteCedula) {
    if (!appState.isAuthenticated) {
        mostrarNotificacion('❌ Debe iniciar sesión para registrar apoyos', 'error');
        document.getElementById('username').focus();
        return;
    }
    
    mostrarDashboard('dirigentes');
    setTimeout(() => {
        const seccionApoyos = document.getElementById('gestion-apoyos');
        if (seccionApoyos) {
            seccionApoyos.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => mostrarFormApoyo(dirigenteId, dirigenteNombre), 800);
        }
    }, 300);
}
