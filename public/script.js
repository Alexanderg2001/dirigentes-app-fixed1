// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    colaboradores: [],
    apoyos: [],
    todosLosDirigentes: [],
    userRol: null
};

// 🆕 FUNCIÓN LOGIN CORREGIDA - SIN ERRORES DE SINTAXIS
async function login() {
    console.log('🔄 Botón login presionado - FUNCIÓN EJECUTADA');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
        return;
    }
    
    console.log('📡 Intentando login con:', username);
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📨 Respuesta recibida:', response.status);
        const data = await response.json();
        console.log('📊 Datos:', data);
        
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

// 🆕 DATOS ELECTORALES DE EJEMPLO
const datosElectorales = [
    {
        id: 1,
        corregimiento: "Boca de Tucué",
        centroVotacion: "Escuela Primaria Boca de Tucué",
        mesa: "Mesa 1",
        escrutados: 250,
        total: 250,
        validos: 240,
        blancos: 5,
        nulos: 5,
        partidos: {
            PRD: 45,
            PartidoPopular: 30,
            MOLIRENA: 25,
            Panameñista: 40,
            CambioDemocratico: 60,
            RealizandoMetas: 20,
            MOCA: 20
        }
    },
    {
        id: 2,
        corregimiento: "Boca de Tucué",
        centroVotacion: "Escuela Primaria Boca de Tucué",
        mesa: "Mesa 2", 
        escrutados: 300,
        total: 300,
        validos: 290,
        blancos: 5,
        nulos: 5,
        partidos: {
            PRD: 80,
            PartidoPopular: 25,
            MOLIRENA: 30,
            Panameñista: 35,
            CambioDemocratico: 75,
            RealizandoMetas: 25,
            MOCA: 20
        }
    }
];

// 🆕 FUNCIONES BÁSICAS CORREGIDAS

function mostrarFormularioElectoral() {
    const formulario = document.getElementById('formulario-electoral');
    if (formulario) {
        formulario.classList.remove('hidden');
        document.getElementById('form-datos-electorales').reset();
    }
}

function ocultarFormularioElectoral() {
    const formulario = document.getElementById('formulario-electoral');
    if (formulario) {
        formulario.classList.add('hidden');
    }
}

function calcularTotales() {
    const cd = parseInt(document.getElementById('electoral-cd').value) || 0;
    const prd = parseInt(document.getElementById('electoral-prd').value) || 0;
    const popular = parseInt(document.getElementById('electoral-popular').value) || 0;
    const molirena = parseInt(document.getElementById('electoral-molirena').value) || 0;
    const panamenista = parseInt(document.getElementById('electoral-panamenista').value) || 0;
    const rm = parseInt(document.getElementById('electoral-rm').value) || 0;
    const moca = parseInt(document.getElementById('electoral-moca').value) || 0;
    
    const totalVotos = cd + prd + popular + molirena + panamenista + rm + moca;
    
    alert(`📊 Total de votos calculados: ${totalVotos}\n\n` +
          `Cambio Democrático: ${cd}\n` +
          `PRD: ${prd}\n` +
          `Partido Popular: ${popular}\n` +
          `MOLIRENA: ${molirena}\n` +
          `Panameñista: ${panamenista}\n` +
          `Realizando Metas: ${rm}\n` +
          `MOCA: ${moca}`);
}

// FUNCIÓN DE NOTIFICACIÓN CORREGIDA
function mostrarNotificacion(mensaje, tipo) {
    // Eliminar notificaciones existentes
    const notificacionesExistentes = document.querySelectorAll('.notification');
    notificacionesExistentes.forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        font-weight: bold;
        ${tipo === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 4000);
}

// FUNCIONES BÁSICAS DE AUTENTICACIÓN CORREGIDAS
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
        if (userInfo) {
            userInfo.classList.remove('hidden');
            document.getElementById('welcome-message').textContent = `Bienvenido, ${appState.userRol}`;
        }
        if (adminPanel) adminPanel.classList.remove('hidden');
    } else {
        if (loginForm) loginForm.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
    }
}

// FUNCIÓN PARA CARGAR DATOS BÁSICOS
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    try {
        await cargarDirigentes();
        await cargarColaboradores();
        await cargarApoyos();
        
        // Inicializar componentes después de cargar datos
        setTimeout(() => {
            renderizarDirigentes();
            inicializarFiltros();
            cargarCorregimientos();
            actualizarSelectDirigentes();
            mostrarDashboard('dirigentes');
            // 🆕 NUEVA LÍNEA - Agregar esto AL FINAL:
            setTimeout(inicializarFiltrosApoyos, 500);
            
            console.log('✅ Todos los componentes inicializados');
        }, 100);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// FUNCIONES PARA CARGAR DATOS DESDE EL SERVIDOR
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

// FUNCIONES PARA ACTUALIZAR SELECTS
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

function actualizarSelectDirigentes(dirigentesFiltrados = null) {
    const select = document.getElementById('apoyo-dirigente');
    if (!select) return;
    
    const dirigentes = dirigentesFiltrados || appState.dirigentes;
    const seleccionActual = select.value;
    
    select.innerHTML = '<option value="">Seleccione un dirigente</option>';
    
    if (dirigentes && dirigentes.length > 0) {
        dirigentes.forEach(dirigente => {
            const option = document.createElement('option');
            option.value = dirigente.id;
            option.textContent = `${dirigente.nombre} - Cédula: ${dirigente.cedula} - ${dirigente.comunidad}`;
            select.appendChild(option);
        });
        
        if (seleccionActual) {
            select.value = seleccionActual;
        }
    }
}

// FUNCIONES PARA GESTIÓN DE DIRIGENTES
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
    } else {
        title.textContent = 'Nuevo Dirigente';
        document.getElementById('dirigente-form').reset();
    }
    
    form.classList.remove('hidden');
}

function ocultarFormDirigente() {
    const form = document.getElementById('form-dirigente');
    if (form) {
        form.classList.add('hidden');
    }
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

async function eliminarDirigente(id) {
    if (!confirm('¿Está seguro de que desea eliminar este dirigente?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/dirigentes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(data.message, 'success');
            await cargarDirigentes();
            await renderizarDirigentes();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// 🆕 FUNCIÓN CORREGIDA PARA EDITAR DIRIGENTE CON SCROLL
function editarDirigente(id) {
    console.log('✏️ Editando dirigente ID:', id);
    
    const dirigente = appState.dirigentes.find(d => d.id === id);
    if (dirigente) {
        // Primero mostrar el dashboard de dirigentes
        mostrarDashboard('dirigentes');
        
        // Esperar un poco y luego hacer scroll
        setTimeout(() => {
            const seccionGestion = document.getElementById('gestion-dirigentes');
            if (seccionGestion) {
                // Hacer scroll suave
                seccionGestion.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
                
                // Resaltar la sección
                highlightSection('gestion-dirigentes');
                
                // Esperar un poco más y abrir el formulario
                setTimeout(() => {
                    mostrarFormDirigente(dirigente);
                }, 800);
            }
        }, 300);
    } else {
        mostrarNotificacion('❌ No se encontró el dirigente', 'error');
    }
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR FORMULARIO DE DIRIGENTE
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
    } else {
        title.textContent = 'Nuevo Dirigente';
        document.getElementById('dirigente-form').reset();
    }
    
    form.classList.remove('hidden');
    
    // Hacer scroll al formulario si no está visible
    setTimeout(() => {
        const formRect = form.getBoundingClientRect();
        const isVisible = formRect.top >= 0 && formRect.bottom <= window.innerHeight;
        
        if (!isVisible) {
            form.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center'
            });
        }
    }, 100);
}

// FUNCIÓN PARA RENDERIZAR DIRIGENTES
function renderizarDirigentes(mostrarTodos = false) {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const dirigentesAMostrar = mostrarTodos ? appState.dirigentes : obtenerUltimosDirigentes();
    
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
}

function obtenerUltimosDirigentes() {
    if (!appState.dirigentes || appState.dirigentes.length === 0) {
        return [];
    }
    
    return [...appState.dirigentes]
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        .slice(0, 10);
}

// FUNCIONES PARA GESTIÓN DE APOYOS
function mostrarFormApoyo(dirigenteId = null, dirigenteNombre = null) {
    const form = document.getElementById('form-apoyo');
    if (!form) return;
    
    form.classList.remove('hidden');
    configurarFechaAutomatica();
    actualizarSelectDirigentes();
    
    if (dirigenteId && dirigenteNombre) {
        setTimeout(() => {
            const select = document.getElementById('apoyo-dirigente');
            if (select) {
                select.value = dirigenteId;
            }
        }, 100);
    }
}

function ocultarFormApoyo() {
    const form = document.getElementById('form-apoyo');
    if (form) {
        form.classList.add('hidden');
    }
}

function configurarFechaAutomatica() {
    const fechaInput = document.getElementById('apoyo-fecha');
    if (fechaInput) {
        const hoy = new Date();
        const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        fechaInput.value = fechaLocal;
    }
}

async function registrarApoyo(event) {
    event.preventDefault();
    
    const dirigenteId = document.getElementById('apoyo-dirigente').value;
    const colaboradorId = document.getElementById('apoyo-colaborador').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    
    // Validaciones básicas
    if (!dirigenteId || !colaboradorId || !tipo) {
        mostrarNotificacion('❌ Complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        mostrarNotificacion('❌ Ingrese un monto válido mayor a 0', 'error');
        return;
    }
    
    const montoNumerico = parseFloat(monto);
    const apoyoData = {
        dirigente_id: dirigenteId,
        colaborador_id: colaboradorId,
        tipo,
        descripcion: descripcion || `Apoyo ${tipo} registrado`,
        monto: montoNumerico
    };
    
    try {
        const response = await fetch('/api/apoyos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apoyoData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarNotificacion(`✅ Apoyo ${tipo} registrado exitosamente por $${montoNumerico.toFixed(2)}`, 'success');
            ocultarFormApoyo();
            document.getElementById('apoyo-form').reset();
            await cargarApoyos();
            await cargarDashboard();
        } else {
            mostrarNotificacion(`❌ ${data.error || 'Error al registrar el apoyo'}`, 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarNotificacion('❌ Error de conexión con el servidor', 'error');
    }
}

// 🆕 FUNCIÓN PARA EDITAR APOYO
async function editarApoyo(apoyoId) {
    console.log('✏️ Editando apoyo ID:', apoyoId);
    
    const apoyo = appState.apoyos.find(a => a.id === apoyoId);
    if (!apoyo) {
        mostrarNotificacion('❌ Apoyo no encontrado', 'error');
        return;
    }
    
    // Mostrar formulario de apoyo
    mostrarFormApoyo();
    
    // Esperar a que el formulario se cargue
    setTimeout(async () => {
        try {
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
                <button class="edit" onclick="editarApoyo(${apoyo.id})">✏️ Editar</button>
                <button class="delete" onclick="eliminarApoyo(${apoyo.id})">🗑️ Eliminar</button>
                <button class="constancia" onclick="generarConstanciaApoyo(${apoyo.id})">📄 Constancia</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Apoyos renderizados con acciones:', appState.apoyos.length);
}
            
            // Cargar datos en el formulario
            document.getElementById('apoyo-dirigente').value = apoyo.dirigente_id;
            document.getElementById('apoyo-colaborador').value = apoyo.colaborador_id;
            document.getElementById('apoyo-tipo').value = apoyo.tipo;
            document.getElementById('apoyo-descripcion').value = apoyo.descripcion || '';
            document.getElementById('apoyo-monto').value = apoyo.monto || '';
            
            // Configurar fecha
            const fecha = new Date(apoyo.fecha);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            document.getElementById('apoyo-fecha').value = fechaFormateada;
            
            // Cambiar el comportamiento del formulario para actualizar
            const form = document.getElementById('apoyo-form');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Guardar el ID del apoyo que estamos editando
            form.dataset.editingApoyoId = apoyoId;
            
            // Cambiar texto del botón
            submitBtn.textContent = '💾 Actualizar Apoyo';
            submitBtn.style.background = '#f39c12';
            
            console.log('✅ Formulario listo para editar apoyo:', apoyo);
            
        } catch (error) {
            console.error('❌ Error al preparar edición:', error);
            mostrarNotificacion('❌ Error al cargar datos para editar', 'error');
        }
    }, 500);
}

// 🆕 FUNCIÓN PARA ELIMINAR APOYO
async function eliminarApoyo(apoyoId) {
    console.log('🗑️ Intentando eliminar apoyo ID:', apoyoId);
    
    const apoyo = appState.apoyos.find(a => a.id === apoyoId);
    if (!apoyo) {
        mostrarNotificacion('❌ Apoyo no encontrado', 'error');
        return;
    }
    
    const confirmacion = confirm(
        `¿Está seguro de que desea ELIMINAR este apoyo?\n\n` +
        `📋 Dirigente: ${apoyo.dirigente_nombre || 'Desconocido'}\n` +
        `💰 Monto: $${apoyo.monto ? parseFloat(apoyo.monto).toFixed(2) : '0.00'}\n` +
        `📅 Fecha: ${new Date(apoyo.fecha).toLocaleDateString()}\n\n` +
        `⚠️ Esta acción NO se puede deshacer.`
    );
    
    if (!confirmacion) {
        console.log('❌ Eliminación cancelada por el usuario');
        return;
    }
    
    try {
        const response = await fetch(`/api/apoyos/${apoyoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Eliminar de los datos locales
            appState.apoyos = appState.apoyos.filter(a => a.id !== apoyoId);
            
            // Actualizar la tabla
            renderizarApoyos();
            
            // Actualizar dashboard
            await cargarDashboard();
            
            mostrarNotificacion('✅ Apoyo eliminado exitosamente', 'success');
            console.log('✅ Apoyo eliminado:', apoyoId);
            
        } else {
            mostrarNotificacion(`❌ Error: ${data.error || 'No se pudo eliminar el apoyo'}`, 'error');
        }
        
    } catch (error) {
        console.error('💥 Error de conexión al eliminar apoyo:', error);
        mostrarNotificacion('❌ Error de conexión al eliminar apoyo', 'error');
    }
}

// 🆕 MODIFICAR LA FUNCIÓN registrarApoyo PARA SOPORTAR EDICIÓN
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
    
    // Validaciones
    if (!dirigenteId) {
        mostrarNotificacion('❌ Debe seleccionar un dirigente', 'error');
        return;
    }
    
    if (!colaboradorId) {
        mostrarNotificacion('❌ Debe seleccionar un colaborador', 'error');
        return;
    }
    
    if (!tipo) {
        mostrarNotificacion('❌ Debe seleccionar el tipo de apoyo', 'error');
        return;
    }
    
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        mostrarNotificacion('❌ Debe ingresar un monto válido mayor a 0', 'error');
        return;
    }
    
    const montoNumerico = parseFloat(monto);
    const apoyoData = {
        dirigente_id: dirigenteId,
        colaborador_id: colaboradorId,
        tipo,
        descripcion: descripcion || `Apoyo ${tipo} registrado`,
        monto: montoNumerico,
        fecha: fecha
    };
    
    try {
        let response;
        
        if (isEditing) {
            // 🆕 MODO EDICIÓN - Actualizar apoyo existente
            console.log('✏️ Actualizando apoyo ID:', isEditing);
            response = await fetch(`/api/apoyos/${isEditing}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apoyoData)
            });
        } else {
            // MODO NUEVO - Crear nuevo apoyo
            console.log('🆕 Creando nuevo apoyo');
            response = await fetch('/api/apoyos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apoyoData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            const mensaje = isEditing ? 
                `✅ Apoyo actualizado exitosamente por $${montoNumerico.toFixed(2)}` :
                `✅ Apoyo ${tipo} registrado exitosamente por $${montoNumerico.toFixed(2)}`;
            
            mostrarNotificacion(mensaje, 'success');
            
            // Limpiar formulario
            ocultarFormApoyo();
            form.reset();
            
            // 🆕 Limpiar modo edición
            delete form.dataset.editingApoyoId;
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Registrar';
            submitBtn.style.background = '';
            
            // Recargar datos
            await cargarApoyos();
            await cargarDashboard();
            
        } else {
            const mensajeError = data.error || (isEditing ? 'Error al actualizar el apoyo' : 'Error al registrar el apoyo');
            mostrarNotificacion(`❌ ${mensajeError}`, 'error');
        }
    } catch (error) {
        console.error('💥 Error de conexión:', error);
        mostrarNotificacion('❌ Error de conexión con el servidor', 'error');
    }
}

// 🆕 FUNCIÓN CORREGIDA PARA BUSCAR DIRIGENTE CON HISTORIAL
async function buscarDirigente() {
    const cedula = document.getElementById('search-cedula').value.trim();
    const searchResult = document.getElementById('search-result');
    
    if (!cedula) {
        mostrarNotificacion('Por favor ingrese un número de cédula', 'error');
        return;
    }
    
    try {
        console.log('🔍 Buscando dirigente con cédula:', cedula);
        const response = await fetch(`/api/buscar-dirigente?cedula=${cedula}`);
        const data = await response.json();
        
        searchResult.classList.remove('hidden');
        
        if (data.encontrado) {
            const dirigente = data.dirigente;
            const apoyos = data.apoyos || [];
            const claseParticipacion = `participacion-${dirigente.participacion}`;
            
            // CALCULAR TOTAL DE APOYOS ECONÓMICOS
            const totalEconomico = apoyos
                .filter(a => a.tipo === 'economico' && a.monto)
                .reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
            
            // 🆕 CONSTRUIR HTML DEL HISTORIAL DE APOYOS
            let historialHTML = '';
            if (apoyos.length > 0) {
                historialHTML = `
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;">📦 Historial de Apoyos Entregados (${apoyos.length})</h4>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                                <thead>
                                    <tr style="background: #e3f2fd;">
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Fecha</th>
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Tipo</th>
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Descripción</th>
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Monto</th>
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Entregado por</th>
                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Constancia</th>
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
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                <button onclick="verConstanciaApoyo(${apoyo.id})" 
                                                        style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
                                                    📄 Ver
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            📊 Total de apoyos registrados: <strong>${apoyos.length}</strong>
                        </p>
                    </div>
                `;
            } else {
                historialHTML = `
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;">📦 Historial de Apoyos Entregados (0)</h4>
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 6px;">
                            <p style="color: #666; margin: 0;">📭 No se han registrado apoyos para este dirigente</p>
                        </div>
                    </div>
                `;
            }
            
            searchResult.innerHTML = `
                <div class="result-found">
                    <h3>✅ ¡Dirigente encontrado!</h3>
                    
                    <!-- BOTÓN PARA REGISTRAR APOYO -->
                    <div style="text-align: right; margin-bottom: 15px;">
                        <button onclick="registrarApoyoDesdeVerificacion(${dirigente.id}, '${dirigente.nombre}', '${dirigente.cedula}')" 
                                style="background: #9b59b6; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            ➕ Registrar Apoyo a este Dirigente
                        </button>
                    </div>
                    
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
                    
                    <!-- HISTORIAL DE APOYOS -->
                    ${historialHTML}
                </div>
            `;
            
            console.log('✅ Historial de apoyos mostrado:', apoyos.length, 'apoyos');
            
        } else {
            searchResult.innerHTML = `
                <div class="result-not-found">
                    <h3>❌ Dirigente no encontrado</h3>
                    <p>No se encontró ningún dirigente registrado con la cédula: <strong>${cedula}</strong></p>
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

// 🆕 FUNCIÓN CORREGIDA PARA REGISTRAR APOYO DESDE VERIFICACIÓN
function registrarApoyoDesdeVerificacion(dirigenteId, dirigenteNombre, dirigenteCedula) {
    if (!appState.isAuthenticated) {
        mostrarNotificacion('❌ Debe iniciar sesión para registrar apoyos', 'error');
        document.getElementById('username').focus();
        return;
    }
    
    console.log('🎯 Registrando apoyo para:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    // Asegurar que el panel de administración esté visible
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
    }
    
    // Mostrar dashboard de dirigentes primero
    mostrarDashboard('dirigentes');
    
    // Esperar un poco y luego hacer scroll a la sección de apoyos
    setTimeout(() => {
        const seccionApoyos = document.getElementById('gestion-apoyos');
        if (seccionApoyos) {
            // Hacer scroll suave a la sección de apoyos
            seccionApoyos.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            
            // Resaltar la sección
            highlightSection('gestion-apoyos');
            
            // Esperar un poco más y abrir el formulario
            setTimeout(() => {
                mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula);
            }, 800);
        }
    }, 300);
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR FORMULARIO CON SCROLL
function mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula) {
    console.log('📝 Abriendo formulario para:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    const formApoyo = document.getElementById('form-apoyo');
    if (!formApoyo) {
        console.error('❌ No se encontró el formulario de apoyo');
        return;
    }
    
    // Mostrar formulario
    formApoyo.classList.remove('hidden');
    
    // Configurar componentes básicos
    configurarFechaAutomatica();
    
    // Esperar a que el select de dirigentes se cargue
    const esperarSelect = setInterval(() => {
        const selectDirigente = document.getElementById('apoyo-dirigente');
        
        if (selectDirigente && selectDirigente.options.length > 1) {
            clearInterval(esperarSelect);
            console.log('✅ Select de dirigentes cargado');
            
            // Buscar y seleccionar el dirigente
            let encontrado = false;
            for (let i = 0; i < selectDirigente.options.length; i++) {
                const option = selectDirigente.options[i];
                if (option.value == dirigenteId) {
                    selectDirigente.value = dirigenteId;
                    encontrado = true;
                    console.log('✅ Dirigente seleccionado automáticamente');
                    break;
                }
            }
            
            if (encontrado) {
                mostrarNotificacion(`✅ Dirigente "${dirigenteNombre}" seleccionado`, 'success');
            } else {
                mostrarNotificacion(`ℹ️ Busque manualmente a "${dirigenteNombre}"`, 'info');
            }
            
        } else if (selectDirigente && selectDirigente.options.length <= 1) {
            console.log('⏳ Esperando carga de dirigentes...');
        }
    }, 100);
    
    // Timeout de seguridad
    setTimeout(() => {
        clearInterval(esperarSelect);
    }, 3000);
}

// 🆕 FUNCIÓN PARA RESALTAR SECCIÓN
function highlightSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Aplicar resaltado
        section.style.border = '3px solid #9b59b6';
        section.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.3)';
        section.style.transition = 'all 0.5s ease';
        
        // Quitar el resaltado después de 3 segundos
        setTimeout(() => {
            section.style.border = '';
            section.style.boxShadow = '';
        }, 3000);
    }
}

function registrarApoyoDirigente(dirigenteId, dirigenteNombre) {
    mostrarFormApoyo();
    mostrarNotificacion(`Dirigente "${dirigenteNombre}" seleccionado para registro de apoyo`, 'success');
}

// FUNCIONES PARA DASHBOARD
async function cargarDashboard() {
    if (!appState.isAuthenticated) return;
    
    try {
        const response = await fetch('/api/estadisticas');
        if (response.ok) {
            const estadisticas = await response.json();
            actualizarDashboard(estadisticas);
        } else {
            calcularEstadisticasLocales();
        }
    } catch (error) {
        calcularEstadisticasLocales();
    }
}

function actualizarDashboard(estadisticas) {
    const totalDirigentes = estadisticas.totalDirigentes || appState.dirigentes.length;
    const totalApoyos = estadisticas.totalApoyos || appState.apoyos.length;
    const buenaParticipacion = estadisticas.participacion?.find(p => p.participacion === 'buena')?.total || 
                              appState.dirigentes.filter(d => d.participacion === 'buena').length;
    
    const totalMonto = estadisticas.totalMontoGeneral || 
                      appState.apoyos.reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
    
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
}

function calcularEstadisticasLocales() {
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
}

// FUNCIONES PARA FILTROS
function inicializarFiltros() {
    const buscarInput = document.getElementById('buscar-dirigente');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento');
    const filtroParticipacion = document.getElementById('filtro-participacion');
    
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            clearTimeout(this.buscarTimeout);
            this.buscarTimeout = setTimeout(() => {
                filtrarDirigentes();
            }, 500);
        });
    }
    
    if (filtroCorregimiento) {
        filtroCorregimiento.addEventListener('change', filtrarDirigentes);
    }
    
    if (filtroParticipacion) {
        filtroParticipacion.addEventListener('change', filtrarDirigentes);
    }
    
    cargarCorregimientos();
}

function cargarCorregimientos() {
    console.log('🔄 Cargando corregimientos para filtros...');
    
    // 🆕 LISTA CON ESPACIOS PARA LOS CORREGIMIENTOS PROBLEMÁTICOS
    const corregimientosFijos = [
        "Boca de Tucué", "Candelario Ovalle", "Cañaveral", "Chiguirí Arriba", "Coclé",
        "El Coco", "General Victoriano Lorenzo", "Las Minas", "Pajonal ", "Penonomé ",
        "Riecito", "Rio Grande ", "Río Indio", "San Miguel ", "Toabré", "Tulú"
    ];
    
    const selectFiltro = document.getElementById('filtro-corregimiento');
    
    // Cargar en el filtro
    if (selectFiltro) {
        selectFiltro.innerHTML = '<option value="">Todos los corregimientos</option>';
        corregimientosFijos.forEach(corregimiento => {
            const option = document.createElement('option');
            option.value = corregimiento;
            option.textContent = corregimiento;
            selectFiltro.appendChild(option);
        });
        console.log('✅ Filtro de corregimientos cargado CON ESPACIOS:', corregimientosFijos);
    }
}

async function filtrarDirigentes() {
    const query = document.getElementById('buscar-dirigente')?.value.toLowerCase() || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    
    try {
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
        filtrarDirigentesLocalmente(query, corregimiento, participacion);
    }
}

function filtrarDirigentesLocalmente(query, corregimiento, participacion) {
    console.log('🔍 Filtros aplicados:', { 
        query: query, 
        corregimiento: corregimiento, 
        participacion: participacion 
    });
    
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
        console.log('🏘️ Filtrando por corregimiento (CON ESPACIOS):', `"${corregimiento}"`);
        
        dirigentesFiltrados = dirigentesFiltrados.filter(d => {
            const corregimientoDirigente = d.corregimiento || '';
            const coincide = corregimientoDirigente === corregimiento;
            
            // 🆕 DEBUG DETALLADO
            console.log(`   Comparando: "${corregimientoDirigente}" === "${corregimiento}" → ${coincide}`);
            
            return coincide;
        });
        
        console.log(`📋 Encontrados ${dirigentesFiltrados.length} dirigentes para "${corregimiento}"`);
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
}

function mostrarTodosLosDirigentes() {
    renderizarDirigentes(true);
    mostrarNotificacion(`Mostrando todos los ${appState.dirigentes.length} dirigentes`, 'success');
    
    const infoResultados = document.getElementById('info-resultados');
    if (infoResultados) {
        infoResultados.style.display = 'none';
    }
}

// FUNCIONES PARA DASHBOARDS
function mostrarDashboard(tipo) {
    document.getElementById('dashboard-dirigentes').classList.add('hidden');
    document.getElementById('dashboard-electoral').classList.add('hidden');
    
    document.getElementById('btn-dirigentes').style.background = '#3498db';
    document.getElementById('btn-electoral').style.background = '#9b59b6';
    
    if (tipo === 'dirigentes') {
        document.getElementById('dashboard-dirigentes').classList.remove('hidden');
        document.getElementById('btn-dirigentes').style.background = '#2980b9';
        console.log('👥 Mostrando dashboard de dirigentes');
    } else if (tipo === 'electoral') {
        document.getElementById('dashboard-electoral').classList.remove('hidden');
        document.getElementById('btn-electoral').style.background = '#8e44ad';
        console.log('📊 Mostrando dashboard electoral');
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página completamente cargada');
    checkAuthStatus();
    
    const formDirigente = document.getElementById('dirigente-form');
    const formApoyo = document.getElementById('apoyo-form');
    
    if (formDirigente) {
        formDirigente.addEventListener('submit', guardarDirigente);
    }
    
    if (formApoyo) {
        formApoyo.addEventListener('submit', registrarApoyo);
    }
    
    // Agregar event listener al botón de login
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    console.log('✅ Sistema inicializado correctamente');
});

// 🆕 CÓDIGO DE SEGURIDAD ADICIONAL
window.addEventListener('error', function(e) {
    console.error('❌ Error global capturado:', e.error);
});

console.log('✅ Script.js cargado correctamente');

// 🆕 FUNCIÓN CORREGIDA PARA CARGAR DASHBOARD
async function cargarDashboard() {
    if (!appState.isAuthenticated) return;
    
    console.log('📊 Cargando dashboard...');
    
    try {
        const response = await fetch('/api/estadisticas');
        console.log('📡 Respuesta de estadísticas:', response.status);
        
        if (response.ok) {
            const estadisticas = await response.json();
            console.log('📈 Estadísticas recibidas:', estadisticas);
            actualizarDashboard(estadisticas);
        } else {
            console.log('🔄 Usando cálculo local de estadísticas');
            calcularEstadisticasLocales();
        }
    } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
        calcularEstadisticasLocales();
    }
}

// 🆕 FUNCIÓN MEJORADA PARA ACTUALIZAR DASHBOARD
function actualizarDashboard(estadisticas) {
    console.log('🎯 Actualizando dashboard con:', estadisticas);
    
    // Total de dirigentes
    const totalDirigentes = estadisticas.totalDirigentes || appState.dirigentes.length;
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    console.log('👥 Total dirigentes:', totalDirigentes);
    
    // Total de apoyos
    const totalApoyos = estadisticas.totalApoyos || appState.apoyos.length;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    console.log('📦 Total apoyos:', totalApoyos);
    
    // Buena participación
    let buenaParticipacion = 0;
    if (estadisticas.participacion && Array.isArray(estadisticas.participacion)) {
        const buena = estadisticas.participacion.find(p => p.participacion === 'buena');
        buenaParticipacion = buena ? buena.total : 0;
    } else {
        buenaParticipacion = appState.dirigentes.filter(d => d.participacion === 'buena').length;
    }
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    console.log('⭐ Buena participación:', buenaParticipacion);
    
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
    console.log('💰 Monto total:', totalMonto);
}

// 🆕 REEMPLAZA la función cargarDatos con esta versión corregida:
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    try {
        // Cargar datos en paralelo para mayor velocidad
        await Promise.all([
            cargarDirigentes(),
            cargarColaboradores(), 
            cargarApoyos()
        ]);
        
        console.log('✅ Datos básicos cargados');
        
        // Cargar dashboard después de tener los datos
        await cargarDashboard();
        
        // Inicializar componentes
        setTimeout(() => {
            renderizarDirigentes();
            inicializarFiltros();
            cargarCorregimientos();
            actualizarSelectDirigentes();
            mostrarDashboard('dirigentes');
            
            console.log('🎉 Todos los componentes inicializados');
            console.log('📊 Resumen final:');
            console.log('- Dirigentes:', appState.dirigentes.length);
            console.log('- Apoyos:', appState.apoyos.length);
            console.log('- Colaboradores:', appState.colaboradores.length);
        }, 200);
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        mostrarNotificacion('Error al cargar los datos del sistema', 'error');
    }
}

// 🆕 FUNCIONES PARA CONSTANCIAS

// Función para generar constancia de dirigente
function generarConstancia(dirigenteId) {
    console.log('📄 Generando constancia para dirigente ID:', dirigenteId);
    
    // Abrir en nueva pestaña
    const url = `/constancia/${dirigenteId}`;
    window.open(url, '_blank');
}

// 🆕 FUNCIÓN PARA VER CONSTANCIA DE APOYO DESDE BÚSQUEDA PÚBLICA
function verConstanciaApoyo(apoyoId) {
    console.log('📄 Ver constancia de apoyo ID:', apoyoId);
    
    if (!appState.isAuthenticated) {
        mostrarNotificacion('🔒 Debe iniciar sesión para ver constancias de apoyo', 'error');
        return;
    }
    
    const url = `/constancia-apoyo/${apoyoId}`;
    window.open(url, '_blank');
}

// 🆕 FUNCIÓN PARA GENERAR CONSTANCIA DE APOYO DESDE GESTIÓN
function generarConstanciaApoyo(apoyoId) {
    console.log('📄 Generando constancia de apoyo ID:', apoyoId);
    
    const url = `/constancia-apoyo/${apoyoId}`;
    window.open(url, '_blank');
}

// 🆕 FUNCIÓN PARA REGISTRAR APOYO DESDE VERIFICACIÓN (MEJORADA)
function registrarApoyoDesdeVerificacion(dirigenteId, dirigenteNombre, dirigenteCedula) {
    if (!appState.isAuthenticated) {
        mostrarNotificacion('❌ Debe iniciar sesión para registrar apoyos', 'error');
        document.getElementById('username').focus();
        return;
    }
    
    console.log('🎯 Registrando apoyo para:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    // Asegurar que el panel de administración esté visible
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
    }
    
    // Mostrar dashboard de dirigentes primero
    mostrarDashboard('dirigentes');
    
    // Esperar un poco y luego hacer scroll a la sección de apoyos
    setTimeout(() => {
        const seccionApoyos = document.getElementById('gestion-apoyos');
        if (seccionApoyos) {
            // Hacer scroll suave a la sección de apoyos
            seccionApoyos.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            
            // Resaltar la sección
            highlightSection('gestion-apoyos');
            
            // Esperar un poco más y abrir el formulario
            setTimeout(() => {
                mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula);
            }, 800);
        }
    }, 300);
}

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR FORMULARIO CON DIRIGENTE PRECARGADO
function mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula) {
    console.log('📝 Abriendo formulario para:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    const formApoyo = document.getElementById('form-apoyo');
    if (!formApoyo) {
        console.error('❌ No se encontró el formulario de apoyo');
        return;
    }
    
    // Mostrar formulario
    formApoyo.classList.remove('hidden');
    
    // Configurar componentes básicos
    configurarFechaAutomatica();
    
    // Esperar a que el select de dirigentes se cargue
    const esperarSelect = setInterval(() => {
        const selectDirigente = document.getElementById('apoyo-dirigente');
        
        if (selectDirigente && selectDirigente.options.length > 1) {
            clearInterval(esperarSelect);
            console.log('✅ Select de dirigentes cargado');
            
            // Buscar y seleccionar el dirigente
            let encontrado = false;
            for (let i = 0; i < selectDirigente.options.length; i++) {
                const option = selectDirigente.options[i];
                if (option.value == dirigenteId) {
                    selectDirigente.value = dirigenteId;
                    encontrado = true;
                    console.log('✅ Dirigente seleccionado automáticamente:', dirigenteNombre);
                    break;
                }
            }
            
            if (encontrado) {
                mostrarNotificacion(`✅ Dirigente "${dirigenteNombre}" seleccionado`, 'success');
            } else {
                console.warn('⚠️ Dirigente no encontrado en select, mostrando manual');
                mostrarNotificacion(`ℹ️ Busque manualmente a "${dirigenteNombre}"`, 'info');
            }
            
        } else if (selectDirigente && selectDirigente.options.length <= 1) {
            console.log('⏳ Esperando carga de dirigentes...');
        }
    }, 100);
    
    // Timeout de seguridad
    setTimeout(() => {
        clearInterval(esperarSelect);
    }, 3000);
}

// 🆕 FUNCIONES DE FILTROS PARA APOYOS - PEGAR AL FINAL DEL ARCHIVO

function inicializarFiltrosApoyos() {
    console.log('🔄 Inicializando filtros para apoyos...');
    
    // Crear contenedor de filtros
    const listaApoyos = document.getElementById('lista-apoyos');
    if (!listaApoyos) {
        console.log('❌ No se encontró la sección de apoyos');
        return;
    }
    
    // Verificar si ya existen filtros
    if (document.querySelector('.filtros-apoyos')) {
        console.log('✅ Los filtros ya están instalados');
        return;
    }
    
    // Insertar filtros antes de la tabla
    const filtrosHTML = `
        <div class="filtros-apoyos" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef;">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">🔍 Filtros de Apoyos</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; align-items: end;">
                <!-- Filtro por tipo -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50;">
                        📦 Tipo de Apoyo:
                    </label>
                    <select id="filtro-tipo-apoyo" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                        <option value="">Todos los tipos</option>
                        <option value="economico">Económico</option>
                        <option value="viveres">Víveres</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                
                <!-- Filtro por fecha -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50;">
                        📅 Desde:
                    </label>
                    <input type="date" id="filtro-fecha-desde" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50;">
                        📅 Hasta:
                    </label>
                    <input type="date" id="filtro-fecha-hasta" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;">
                </div>
                
                <!-- Botones -->
                <div style="display: flex; gap: 10px;">
                    <button onclick="aplicarFiltrosApoyos()" 
                            style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        🔍 Aplicar
                    </button>
                    <button onclick="limpiarFiltrosApoyos()" 
                            style="background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        🗑️ Limpiar
                    </button>
                </div>
            </div>
            
            <!-- Información de resultados -->
            <div id="info-filtros-apoyos" class="info-resultados" style="display: none; margin-top: 10px;">
                <p>📋 Mostrando <span id="contador-apoyos-filtrados">0</span> apoyos de <span id="total-apoyos-registrados">0</span></p>
            </div>
        </div>
    `;
    
    listaApoyos.insertAdjacentHTML('afterbegin', filtrosHTML);
    
    console.log('✅ Filtros de apoyos instalados correctamente');
}

function aplicarFiltrosApoyos() {
    console.log('🔍 Aplicando filtros a apoyos...');
    
    const tipo = document.getElementById('filtro-tipo-apoyo').value;
    const fechaDesde = document.getElementById('filtro-fecha-desde').value;
    const fechaHasta = document.getElementById('filtro-fecha-hasta').value;
    
    let apoyosFiltrados = [...appState.apoyos];
    
    // Filtrar por tipo
    if (tipo) {
        apoyosFiltrados = apoyosFiltrados.filter(apoyo => apoyo.tipo === tipo);
    }
    
    // Filtrar por fecha
    if (fechaDesde) {
        apoyosFiltrados = apoyosFiltrados.filter(apoyo => {
            const fechaApoyo = new Date(apoyo.fecha);
            const fechaFiltro = new Date(fechaDesde);
            return fechaApoyo >= fechaFiltro;
        });
    }
    
    if (fechaHasta) {
        apoyosFiltrados = apoyosFiltrados.filter(apoyo => {
            const fechaApoyo = new Date(apoyo.fecha);
            const fechaFiltro = new Date(fechaHasta);
            return fechaApoyo <= fechaFiltro;
        });
    }
    
    mostrarApoyosFiltrados(apoyosFiltrados);
}

function mostrarApoyosFiltrados(apoyosFiltrados) {
    const tbody = document.getElementById('apoyos-body');
    const infoFiltros = document.getElementById('info-filtros-apoyos');
    const contador = document.getElementById('contador-apoyos-filtrados');
    const total = document.getElementById('total-apoyos-registrados');
    
    if (!tbody) return;
    
    // Actualizar contadores
    if (contador) contador.textContent = apoyosFiltrados.length;
    if (total) total.textContent = appState.apoyos.length;
    
    // Mostrar/ocultar info de filtros
    if (infoFiltros) {
        if (apoyosFiltrados.length !== appState.apoyos.length) {
            infoFiltros.style.display = 'block';
        } else {
            infoFiltros.style.display = 'none';
        }
    }
    
    // Renderizar tabla
    tbody.innerHTML = '';
    
    if (apoyosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                    🔍 No se encontraron apoyos con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    apoyosFiltrados.forEach(apoyo => {
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
    
    // Mostrar todos los apoyos
    mostrarApoyosFiltrados(appState.apoyos);
    mostrarNotificacion('✅ Filtros limpiados - Mostrando todos los apoyos', 'success');
}

