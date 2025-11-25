// Estado de la aplicación
let appState = {
    isAuthenticated: false,
    dirigentes: [],
    colaboradores: [],
    apoyos: [],
    todosLosDirigentes: [],
    userRol: null
};

// 🆕 FUNCIÓN LOGIN - AGREGAR AQUÍ
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

// 🆕 DATOS ELECTORALES DE EJEMPLO (los reemplazarás con tus datos reales)
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
        },
        candidatos: {
            DanielRamos: 25,
            NestosTinGuardia: 20,
            JohnNicola: 15,
            EyberCastañeda: 25,
            JulioDeLaGuardia: 35,
            NestorChen: 25,
            RosarioBerrocal: 10,
            RicardoRealizandoMetas: 10,
            VictorCarles: 20
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
        },
        candidatos: {
            DanielRamos: 45,
            NestosTinGuardia: 35,
            JohnNicola: 20,
            EyberCastañeda: 15,
            JulioDeLaGuardia: 45,
            NestorChen: 30,
            RosarioBerrocal: 15,
            RicardoRealizandoMetas: 10,
            VictorCarles: 20
        }
    },
    {
        id: 3,
        corregimiento: "Candelario Ovalle",
        centroVotacion: "Escuela Candelario Ovalle",
        mesa: "Mesa 1",
        escrutados: 280,
        total: 280,
        validos: 270,
        blancos: 5,
        nulos: 5,
        partidos: {
            PRD: 90,
            PartidoPopular: 20,
            MOLIRENA: 25,
            Panameñista: 30,
            CambioDemocratico: 55,
            RealizandoMetas: 30,
            MOCA: 20
        },
        candidatos: {
            DanielRamos: 50,
            NestosTinGuardia: 40,
            JohnNicola: 15,
            EyberCastañeda: 15,
            JulioDeLaGuardia: 30,
            NestorChen: 25,
            RosarioBerrocal: 20,
            RicardoRealizandoMetas: 10,
            VictorCarles: 20
        }
    },
    {
        id: 4,
        corregimiento: "Cañaveral", 
        centroVotacion: "Escuela Cañaveral Central",
        mesa: "Mesa 1",
        escrutados: 320,
        total: 320,
        validos: 310,
        blancos: 5,
        nulos: 5,
        partidos: {
            PRD: 65,
            PartidoPopular: 35,
            MOLIRENA: 40,
            Panameñista: 45,
            CambioDemocratico: 85,
            RealizandoMetas: 25,
            MOCA: 15
        },
        candidatos: {
            DanielRamos: 35,
            NestosTinGuardia: 30,
            JohnNicola: 25,
            EyberCastañeda: 20,
            JulioDeLaGuardia: 50,
            NestorChen: 35,
            RosarioBerrocal: 15,
            RicardoRealizandoMetas: 10,
            VictorCarles: 15
        }
    },
    {
        id: 5,
        corregimiento: "Chiguirí Arriba",
        centroVotacion: "Escuela Chiguirí Arriba",
        mesa: "Mesa 1",
        escrutados: 200,
        total: 200,
        validos: 195,
        blancos: 3,
        nulos: 2,
        partidos: {
            PRD: 75,
            PartidoPopular: 15,
            MOLIRENA: 20,
            Panameñista: 25,
            CambioDemocratico: 40,
            RealizandoMetas: 10,
            MOCA: 10
        },
        candidatos: {
            DanielRamos: 40,
            NestosTinGuardia: 35,
            JohnNicola: 12,
            EyberCastañeda: 13,
            JulioDeLaGuardia: 25,
            NestorChen: 15,
            RosarioBerrocal: 5,
            RicardoRealizandoMetas: 5,
            VictorCarles: 10
        }
    }
];

// 🆕 FUNCIONES PARA INGRESAR DATOS MANUALMENTE

function mostrarFormularioElectoral() {
    const formulario = document.getElementById('formulario-electoral');
    formulario.classList.remove('hidden');
    
    // Limpiar formulario
    document.getElementById('form-datos-electorales').reset();
}

function ocultarFormularioElectoral() {
    document.getElementById('formulario-electoral').classList.add('hidden');
}

function calcularTotales() {
    // Obtener valores de los partidos
    const cd = parseInt(document.getElementById('electoral-cd').value) || 0;
    const prd = parseInt(document.getElementById('electoral-prd').value) || 0;
    const popular = parseInt(document.getElementById('electoral-popular').value) || 0;
    const molirena = parseInt(document.getElementById('electoral-molirena').value) || 0;
    const panamenista = parseInt(document.getElementById('electoral-panamenista').value) || 0;
    const rm = parseInt(document.getElementById('electoral-rm').value) || 0;
    const moca = parseInt(document.getElementById('electoral-moca').value) || 0;
    
    // Calcular total
    const totalVotos = cd + prd + popular + molirena + panamenista + rm + moca;
    
    // Mostrar resultado
    alert(`📊 Total de votos calculados: ${totalVotos}\n\n` +
          `Cambio Democrático: ${cd}\n` +
          `PRD: ${prd}\n` +
          `Partido Popular: ${popular}\n` +
          `MOLIRENA: ${molirena}\n` +
          `Panameñista: ${panamenista}\n` +
          `Realizando Metas: ${rm}\n` +
          `MOCA: ${moca}`);
}

// 🆕 FUNCIÓN PARA GUARDAR DATOS ELECTORALES
async function guardarDatosElectorales(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const corregimiento = document.getElementById('electoral-corregimiento').value;
    const centroVotacion = document.getElementById('electoral-centro').value;
    const mesa = document.getElementById('electoral-mesa').value;
    const escrutados = parseInt(document.getElementById('electoral-escrutados').value) || 0;
    const validos = parseInt(document.getElementById('electoral-validos').value) || 0;
    const blancos = parseInt(document.getElementById('electoral-blancos').value) || 0;
    const nulos = parseInt(document.getElementById('electoral-nulos').value) || 0;
    
    // Obtener votos por partido
    const votosCD = parseInt(document.getElementById('electoral-cd').value) || 0;
    const votosPRD = parseInt(document.getElementById('electoral-prd').value) || 0;
    const votosPopular = parseInt(document.getElementById('electoral-popular').value) || 0;
    const votosMOLIRENA = parseInt(document.getElementById('electoral-molirena').value) || 0;
    const votosPanamenista = parseInt(document.getElementById('electoral-panamenista').value) || 0;
    const votosRM = parseInt(document.getElementById('electoral-rm').value) || 0;
    const votosMOCA = parseInt(document.getElementById('electoral-moca').value) || 0;
    
    // Validaciones
    if (!corregimiento || !centroVotacion || !mesa) {
        mostrarNotificacion('❌ Complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Calcular total de votos ingresados
    const totalVotosIngresados = votosCD + votosPRD + votosPopular + votosMOLIRENA + votosPanamenista + votosRM + votosMOCA;
    
    if (totalVotosIngresados === 0) {
        mostrarNotificacion('❌ Ingrese al menos algunos votos', 'error');
        return;
    }
    
    // Crear objeto con los datos
    const nuevoDatoElectoral = {
        id: Date.now(), // ID temporal
        corregimiento: corregimiento,
        centroVotacion: centroVotacion,
        mesa: mesa,
        escrutados: escrutados,
        total: escrutados,
        validos: validos,
        blancos: blancos,
        nulos: nulos,
        partidos: {
            CambioDemocratico: votosCD,
            PRD: votosPRD,
            PartidoPopular: votosPopular,
            MOLIRENA: votosMOLIRENA,
            Panameñista: votosPanamenista,
            RealizandoMetas: votosRM,
            MOCA: votosMOCA
        },
        candidatos: {
            // Puedes agregar datos de candidatos después si quieres
            DanielRamos: 0,
            NestosTinGuardia: 0,
            JohnNicola: 0,
            EyberCastañeda: 0,
            JulioDeLaGuardia: 0,
            NestorChen: 0,
            RosarioBerrocal: 0,
            RicardoRealizandoMetas: 0,
            VictorCarles: 0
        }
    };
    
    try {
        // Agregar a los datos existentes
        datosElectorales.push(nuevoDatoElectoral);
        
        // Actualizar la interfaz
        cargarDatosElectorales();
        
        // Ocultar formulario
        ocultarFormularioElectoral();
        
        // Mostrar mensaje de éxito
        mostrarNotificacion(`✅ Datos de ${centroVotacion} - ${mesa} guardados exitosamente`, 'success');
        
        console.log('📥 Nuevo dato electoral guardado:', nuevoDatoElectoral);
        
    } catch (error) {
        console.error('❌ Error al guardar datos electorales:', error);
        mostrarNotificacion('❌ Error al guardar los datos', 'error');
    }
}

// 🆕 FUNCIONES DE BÚSQUEDA Y FILTRADO AVANZADO

function inicializarBuscadorElectoral() {
    console.log('🔍 Inicializando buscador electoral...');
    
    // Configurar event listeners para búsqueda en tiempo real
    const buscarInput = document.getElementById('buscar-electoral');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento-electoral');
    const filtroCentro = document.getElementById('filtro-centro-votacion');
    
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            // Búsqueda en tiempo real con delay
            clearTimeout(this.buscarTimeout);
            this.buscarTimeout = setTimeout(() => {
                aplicarBusquedaElectoral();
            }, 500);
        });
    }
    
    if (filtroCorregimiento) {
        filtroCorregimiento.addEventListener('change', function() {
            actualizarCentrosPorCorregimiento(this.value);
            aplicarBusquedaElectoral();
        });
    }
    
    if (filtroCentro) {
        filtroCentro.addEventListener('change', aplicarBusquedaElectoral);
    }
    
    // Cargar opciones de filtros
    cargarOpcionesBusqueda();
}

function cargarOpcionesBusqueda() {
    // Cargar corregimientos únicos
    const corregimientos = [...new Set(datosElectorales.map(d => d.corregimiento))].sort();
    const selectCorregimiento = document.getElementById('filtro-corregimiento-electoral');
    
    if (selectCorregimiento) {
        selectCorregimiento.innerHTML = '<option value="">Todos los corregimientos</option>';
        corregimientos.forEach(corregimiento => {
            const option = document.createElement('option');
            option.value = corregimiento;
            option.textContent = corregimiento;
            selectCorregimiento.appendChild(option);
        });
    }
    
    // Cargar centros de votación únicos
    const centros = [...new Set(datosElectorales.map(d => d.centroVotacion))].sort();
    const selectCentro = document.getElementById('filtro-centro-votacion');
    
    if (selectCentro) {
        selectCentro.innerHTML = '<option value="">Todos los centros de votación</option>';
        centros.forEach(centro => {
            const option = document.createElement('option');
            option.value = centro;
            option.textContent = centro;
            selectCentro.appendChild(option);
        });
    }
}

function actualizarCentrosPorCorregimiento(corregimientoSeleccionado) {
    const selectCentro = document.getElementById('filtro-centro-votacion');
    if (!selectCentro) return;
    
    let centrosFiltrados;
    
    if (corregimientoSeleccionado) {
        centrosFiltrados = [...new Set(
            datosElectorales
                .filter(d => d.corregimiento === corregimientoSeleccionado)
                .map(d => d.centroVotacion)
        )].sort();
    } else {
        centrosFiltrados = [...new Set(datosElectorales.map(d => d.centroVotacion))].sort();
    }
    
    // Guardar selección actual
    const seleccionActual = selectCentro.value;
    
    // Actualizar opciones
    selectCentro.innerHTML = '<option value="">Todos los centros de votación</option>';
    centrosFiltrados.forEach(centro => {
        const option = document.createElement('option');
        option.value = centro;
        option.textContent = centro;
        selectCentro.appendChild(option);
    });
    
    // Restaurar selección si todavía existe
    if (centrosFiltrados.includes(seleccionActual)) {
        selectCentro.value = seleccionActual;
    }
}

function aplicarBusquedaElectoral() {
    const textoBusqueda = document.getElementById('buscar-electoral').value.toLowerCase().trim();
    const corregimiento = document.getElementById('filtro-corregimiento-electoral').value;
    const centro = document.getElementById('filtro-centro-votacion').value;
    
    console.log('🔍 Aplicando búsqueda:', { textoBusqueda, corregimiento, centro });
    
    // Aplicar filtros
    let datosFiltrados = datosElectorales;
    
    // Filtro por texto de búsqueda
    if (textoBusqueda) {
        datosFiltrados = datosFiltrados.filter(mesa => 
            mesa.corregimiento.toLowerCase().includes(textoBusqueda) ||
            mesa.centroVotacion.toLowerCase().includes(textoBusqueda) ||
            mesa.mesa.toLowerCase().includes(textoBusqueda)
        );
    }
    
    // Filtro por corregimiento
    if (corregimiento) {
        datosFiltrados = datosFiltrados.filter(mesa => mesa.corregimiento === corregimiento);
    }
    
    // Filtro por centro de votación
    if (centro) {
        datosFiltrados = datosFiltrados.filter(mesa => mesa.centroVotacion === centro);
    }
    
    // Actualizar datos filtrados
    datosElectoralesFiltrados = datosFiltrados;
    
    // Actualizar interfaz
    actualizarEstadisticasElectorales();
    mostrarTablaResultados();
    generarMapaCorregimientos();
    generarGraficoPartidos();
    
    // Mostrar información de resultados
    mostrarInfoBusqueda(datosFiltrados.length);
}

function mostrarInfoBusqueda(cantidadFiltrados) {
    const infoBusqueda = document.getElementById('info-busqueda-electoral');
    const contadorResultados = document.getElementById('contador-resultados-electoral');
    const totalMesas = document.getElementById('total-mesas-electoral');
    
    if (infoBusqueda && contadorResultados && totalMesas) {
        contadorResultados.textContent = cantidadFiltrados;
        totalMesas.textContent = datosElectorales.length;
        
        if (cantidadFiltrados !== datosElectorales.length) {
            infoBusqueda.style.display = 'flex';
        } else {
            infoBusqueda.style.display = 'none';
        }
    }
}

function limpiarBusquedaElectoral() {
    console.log('🧹 Limpiando búsqueda electoral...');
    
    // Limpiar campos de búsqueda
    document.getElementById('buscar-electoral').value = '';
    document.getElementById('filtro-corregimiento-electoral').value = '';
    document.getElementById('filtro-centro-votacion').value = '';
    
    // Recargar todas las opciones de centros
    cargarOpcionesBusqueda();
    
    // Mostrar todos los datos
    datosElectoralesFiltrados = [...datosElectorales];
    
    // Actualizar interfaz
    actualizarEstadisticasElectorales();
    mostrarTablaResultados();
    generarMapaCorregimientos();
    generarGraficoPartidos();
    
    // Ocultar información de búsqueda
    const infoBusqueda = document.getElementById('info-busqueda-electoral');
    if (infoBusqueda) {
        infoBusqueda.style.display = 'none';
    }
    
    mostrarNotificacion('🔍 Mostrando todas las mesas electorales', 'success');
}

// 🆕 FUNCIÓN DE BÚSQUEDA RÁPIDA DESDE EL DASHBOARD
function buscarDesdeDashboard(tipo, valor) {
    console.log(`🎯 Búsqueda rápida: ${tipo} = ${valor}`);
    
    switch(tipo) {
        case 'corregimiento':
            document.getElementById('filtro-corregimiento-electoral').value = valor;
            actualizarCentrosPorCorregimiento(valor);
            break;
        case 'centro':
            document.getElementById('filtro-centro-votacion').value = valor;
            break;
    }
    
    aplicarBusquedaElectoral();
    
    // Hacer scroll a la sección electoral
    setTimeout(() => {
        document.getElementById('analisis-electoral').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

// 🆕 FUNCIÓN PARA EDITAR DATOS EXISTENTES
function editarDatoElectoral(id) {
    const dato = datosElectorales.find(d => d.id === id);
    if (!dato) {
        mostrarNotificacion('❌ Dato no encontrado', 'error');
        return;
    }
    
    // Llenar el formulario con los datos existentes
    document.getElementById('electoral-corregimiento').value = dato.corregimiento;
    document.getElementById('electoral-centro').value = dato.centroVotacion;
    document.getElementById('electoral-mesa').value = dato.mesa;
    document.getElementById('electoral-escrutados').value = dato.escrutados;
    document.getElementById('electoral-validos').value = dato.validos;
    document.getElementById('electoral-blancos').value = dato.blancos;
    document.getElementById('electoral-nulos').value = dato.nulos;
    
    // Llenar votos por partido
    document.getElementById('electoral-cd').value = dato.partidos.CambioDemocratico || 0;
    document.getElementById('electoral-prd').value = dato.partidos.PRD || 0;
    document.getElementById('electoral-popular').value = dato.partidos.PartidoPopular || 0;
    document.getElementById('electoral-molirena').value = dato.partidos.MOLIRENA || 0;
    document.getElementById('electoral-panamenista').value = dato.partidos.Panameñista || 0;
    document.getElementById('electoral-rm').value = dato.partidos.RealizandoMetas || 0;
    document.getElementById('electoral-moca').value = dato.partidos.MOCA || 0;
    
    // Mostrar formulario
    mostrarFormularioElectoral();
    
    // Cambiar el comportamiento del botón guardar temporalmente
    const form = document.getElementById('form-datos-electorales');
    form.onsubmit = function(e) {
        e.preventDefault();
        actualizarDatoElectoral(id);
    };
    
    // Cambiar texto del botón
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = '💾 Actualizar Datos';
    submitBtn.style.background = '#f39c12';
}

// 🆕 FUNCIÓN PARA ACTUALIZAR DATOS EXISTENTES
function actualizarDatoElectoral(id) {
    const datoIndex = datosElectorales.findIndex(d => d.id === id);
    if (datoIndex === -1) {
        mostrarNotificacion('❌ Dato no encontrado para actualizar', 'error');
        return;
    }
    
    // Obtener nuevos valores del formulario
    const corregimiento = document.getElementById('electoral-corregimiento').value;
    const centroVotacion = document.getElementById('electoral-centro').value;
    const mesa = document.getElementById('electoral-mesa').value;
    const escrutados = parseInt(document.getElementById('electoral-escrutados').value) || 0;
    const validos = parseInt(document.getElementById('electoral-validos').value) || 0;
    const blancos = parseInt(document.getElementById('electoral-blancos').value) || 0;
    const nulos = parseInt(document.getElementById('electoral-nulos').value) || 0;
    
    // Obtener votos por partido
    const votosCD = parseInt(document.getElementById('electoral-cd').value) || 0;
    const votosPRD = parseInt(document.getElementById('electoral-prd').value) || 0;
    const votosPopular = parseInt(document.getElementById('electoral-popular').value) || 0;
    const votosMOLIRENA = parseInt(document.getElementById('electoral-molirena').value) || 0;
    const votosPanamenista = parseInt(document.getElementById('electoral-panamenista').value) || 0;
    const votosRM = parseInt(document.getElementById('electoral-rm').value) || 0;
    const votosMOCA = parseInt(document.getElementById('electoral-moca').value) || 0;
    
    // Actualizar el dato
    datosElectorales[datoIndex] = {
        ...datosElectorales[datoIndex],
        corregimiento,
        centroVotacion,
        mesa,
        escrutados,
        total: escrutados,
        validos,
        blancos,
        nulos,
        partidos: {
            CambioDemocratico: votosCD,
            PRD: votosPRD,
            PartidoPopular: votosPopular,
            MOLIRENA: votosMOLIRENA,
            Panameñista: votosPanamenista,
            RealizandoMetas: votosRM,
            MOCA: votosMOCA
        }
    };
    
    // Actualizar la interfaz
    cargarDatosElectorales();
    
    // Ocultar formulario
    ocultarFormularioElectoral();
    
    // Restaurar comportamiento normal del formulario
    const form = document.getElementById('form-datos-electorales');
    form.onsubmit = guardarDatosElectorales;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = '💾 Guardar Datos';
    submitBtn.style.background = '#27ae60';
    
    mostrarNotificacion('✅ Datos actualizados exitosamente', 'success');
}

// 🆕 FUNCIÓN PARA ELIMINAR DATOS
function eliminarDatoElectoral(id) {
    if (!confirm('¿Está seguro de que desea eliminar estos datos electorales?')) {
        return;
    }
    
    const datoIndex = datosElectorales.findIndex(d => d.id === id);
    if (datoIndex === -1) {
        mostrarNotificacion('❌ Dato no encontrado', 'error');
        return;
    }
    
    const datoEliminado = datosElectorales.splice(datoIndex, 1)[0];
    
    // Actualizar la interfaz
    cargarDatosElectorales();
    
    mostrarNotificacion(`✅ Datos de ${datoEliminado.centroVotacion} - ${datoEliminado.mesa} eliminados`, 'success');
}

// 🆕 Variable para controlar el módulo electoral
let datosElectoralesFiltrados = [];

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

// 🆕 FUNCIÓN LOGIN CORREGIDA Y MEJORADA
async function login() {
    console.log('🔄 Botón login presionado - INICIANDO...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
        return;
    }
    
    // 🆕 MOSTRAR INDICADOR DE CARGA
    const loginBtn = document.querySelector('#login-form button');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '⏳ Iniciando sesión...';
    loginBtn.disabled = true;
    
    try {
        console.log('📡 Enviando credenciales al servidor...');
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📨 Respuesta del servidor recibida:', response.status);
        
        const data = await response.json();
        console.log('📊 Datos de respuesta:', data);
        
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
        console.error('💥 Error grave en login:', error);
        mostrarNotificacion('Error al conectar con el servidor. Verifica tu conexión.', 'error');
    } finally {
        // 🆕 RESTAURAR BOTÓN
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
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
        
        // 🆕 MOSTRAR MÓDULO ELECTORAL
        const moduloElectoral = document.getElementById('analisis-electoral');
        if (moduloElectoral) {
            moduloElectoral.classList.remove('hidden');
        }
    } else {
        if (loginForm) loginForm.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
        
        // 🆕 OCULTAR MÓDULO ELECTORAL
        const moduloElectoral = document.getElementById('analisis-electoral');
        if (moduloElectoral) {
            moduloElectoral.classList.add('hidden');
        }
    }
}

// FUNCIÓN COMPLETAMENTE ACTUALIZADA
async function cargarDatos() {
    if (!appState.isAuthenticated) return;
    
    console.log('📥 Cargando todos los datos...');
    
    // 1. Cargar datos básicos
    await cargarDirigentes();
    await cargarColaboradores();
    await cargarApoyos();
    
    // 2. INICIALIZAR COMPONENTES Y MOSTRAR DASHBOARD DE DIRIGENTES
    setTimeout(() => {
        // Inicializar componentes básicos
        renderizarDirigentes();      
        inicializarFiltros();        
        cargarCorregimientos();
        inicializarBuscadorApoyos();
        actualizarSelectDirigentes();
        
        // CARGAR Y MOSTRAR DASHBOARD DE DIRIGENTES CON DATOS
        mostrarDashboard('dirigentes');
        
        console.log('✅ Todos los componentes inicializados');
    }, 100);
    
    console.log('✅ Todos los datos cargados');
}

// FUNCIÓN MEJORADA - CARGAR TODOS LOS DIRIGENTES
async function cargarDirigentes() {
    try {
        const response = await fetch('/api/dirigentes/todos');
        const data = await response.json();
        
        if (response.ok) {
            appState.dirigentes = data;
            appState.todosLosDirigentes = data;
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

// 🆕 FUNCIÓN MEJORADA PARA MOSTRAR APOYOS CON ACCIONES
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
                <!-- 🆕 BOTONES DE ACCIÓN -->
                <button class="edit" onclick="editarApoyo(${apoyo.id})" 
                        style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 0.8em;">
                    ✏️ Editar
                </button>
                <button class="delete" onclick="eliminarApoyo(${apoyo.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 0.8em;">
                    🗑️ Eliminar
                </button>
                <button class="constancia" onclick="generarConstanciaApoyo(${apoyo.id})"
                        style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 0.8em;">
                    📄 Constancia
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Apoyos renderizados con acciones:', appState.apoyos.length);
}

// FUNCIÓN MEJORADA - CON SCROLL AL AGREGAR NUEVO
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
    
    // SCROLL AUTOMÁTICO SOLO SI NO ESTAMOS VIENDO LA SECCIÓN
    setTimeout(() => {
        if (!isElementInViewport('gestion-dirigentes')) {
            console.log('📜 Haciendo scroll a Gestión de Dirigentes...');
            scrollToSection('gestion-dirigentes');
            highlightSection('gestion-dirigentes');
        }
    }, 100);
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

            // 🆕 ACTUALIZAR LISTA DE COORDINADORES Y MANTENER FILTROS
        cargarCoordinadores();
        await filtrarDirigentes(); // Mantener los filtros aplicados
        
    } else {
        mostrarNotificacion(data.error, 'error');
    }
}

// En la función eliminarDirigente(), después de eliminar, agrega:
async function eliminarDirigente(id) {
    // ... código existente ...
    
    if (response.ok) {
        mostrarNotificacion(data.message, 'success');
        await cargarDirigentes();
        await renderizarDirigentes();
        
        // 🆕 ACTUALIZAR LISTA DE COORDINADORES Y MANTENER FILTROS
        cargarCoordinadores();
        await filtrarDirigentes(); // Mantener los filtros aplicados
        
    } else {
        mostrarNotificacion(data.error, 'error');
    }
}
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// FUNCIÓN MEJORADA PARA MOSTRAR FORMULARIO DE APOYO
function mostrarFormApoyo(dirigenteId = null, dirigenteNombre = null) {
    const form = document.getElementById('form-apoyo');
    if (!form) return;
    
    // Mostrar formulario
    form.classList.remove('hidden');
    
    // INICIALIZAR COMPONENTES
    configurarFechaAutomatica();
    configurarTipoApoyo();
    inicializarBuscadorApoyos();
    
    // CARGAR DIRIGENTES EN EL SELECT
    actualizarSelectDirigentes();
    
    // SI SE PASA UN DIRIGENTE ESPECÍFICO, SELECCIONARLO
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

// FUNCIÓN CORREGIDA - MENSAJES EN VERDE
async function registrarApoyo(event) {
    event.preventDefault();
    
    const dirigenteId = document.getElementById('apoyo-dirigente').value;
    const colaboradorId = document.getElementById('apoyo-colaborador').value;
    const tipo = document.getElementById('apoyo-tipo').value;
    const descripcion = document.getElementById('apoyo-descripcion').value;
    const monto = document.getElementById('apoyo-monto').value;
    
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
            // MENSAJE DE ÉXITO EN VERDE
            const mensajeExito = data.message || `✅ Apoyo ${tipo} registrado exitosamente por $${montoNumerico.toFixed(2)}`;
            mostrarNotificacion(mensajeExito, 'success');
            
            ocultarFormApoyo();
            document.getElementById('apoyo-form').reset();
            
            await cargarApoyos();
            await cargarDashboard();
            
        } else {
            // MENSAJE DE ERROR EN ROJO
            const mensajeError = data.error || 'Error al registrar el apoyo';
            mostrarNotificacion(`❌ ${mensajeError}`, 'error');
        }
    } catch (error) {
        console.error('💥 Error de conexión:', error);
        mostrarNotificacion('❌ Error de conexión con el servidor', 'error');
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

// FUNCIÓN MEJORADA CON BOTÓN DE REGISTRAR APOYO
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
            
            // CALCULAR TOTAL DE APOYOS ECONÓMICOS
            const totalEconomico = apoyos
                .filter(a => a.tipo === 'economico' && a.monto)
                .reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
            
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
                <!-- BOTÓN DE CONSTANCIA -->
                <button onclick="verConstanciaApoyo(${apoyo.id})" 
                        style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8em; display: flex; align-items: center; gap: 5px; margin: 0 auto;">
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
                    <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                        <p style="margin: 0; color: #856404;">
                            💡 <strong>¿Desea agregar este dirigente al sistema?</strong><br>
                            <button onclick="agregarDirigenteDesdeBusqueda('${cedula}')" 
                                    style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                                ➕ Agregar Nuevo Dirigente
                            </button>
                        </p>
                    </div>
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

// FUNCIONES DEL DASHBOARD
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

// FUNCIÓN MEJORADA - MUESTRA TOTAL DE TODOS LOS APOYOS
function actualizarDashboard(estadisticas) {
    console.log('📊 Actualizando dashboard con:', estadisticas);
    
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
    
    // APOYOS ECONÓMICOS - AHORA SUMA TODOS LOS TIPOS
    const totalMonto = estadisticas.totalMontoGeneral || 
                      // Si no existe el nuevo campo, calcular manualmente
                      appState.apoyos.reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
    
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
    
    // MOSTRAR DETALLES EN CONSOLA PARA VERIFICAR
    console.log('💰 Total general de montos:', totalMonto);
}

// FUNCIÓN MEJORADA - CALCULA TODOS LOS MONTOS LOCALMENTE
function calcularEstadisticasLocales() {
    const totalDirigentes = appState.dirigentes.length;
    const totalApoyos = appState.apoyos.length;
    const buenaParticipacion = appState.dirigentes.filter(d => d.participacion === 'buena').length;
    
    // SUMAR MONTOS DE TODOS LOS TIPOS DE APOYO
    const totalMonto = appState.apoyos.reduce((sum, apoyo) => {
        return sum + (parseFloat(apoyo.monto) || 0);
    }, 0);
    
    document.getElementById('total-dirigentes').textContent = totalDirigentes;
    document.getElementById('total-apoyos').textContent = totalApoyos;
    document.getElementById('buena-participacion').textContent = buenaParticipacion;
    document.getElementById('total-monto').textContent = `$${totalMonto.toFixed(2)}`;
    
    console.log('💰 Cálculo local - Monto total de todos los apoyos:', totalMonto);
}

// FUNCIÓN MEJORADA PARA RENDERIZAR DIRIGENTES
function renderizarDirigentes(mostrarTodos = false) {
    const tbody = document.getElementById('dirigentes-body');
    if (!tbody) {
        console.log('❌ Tabla de dirigentes no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    // Decidir qué dirigentes mostrar
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

// FUNCIÓN MEJORADA - CON SCROLL AUTOMÁTICO
function editarDirigente(id) {
    console.log('✏️ Editando dirigente ID:', id);
    
    const dirigente = appState.dirigentes.find(d => d.id === id);
    if (dirigente) {
        // 1. Primero mostrar el formulario de edición
        mostrarFormDirigente(dirigente);
        
        // 2. Esperar un poquito y luego hacer scroll automático
        setTimeout(() => {
            console.log('🔄 Haciendo scroll automático...');
            scrollToSection('gestion-dirigentes');
            highlightSection('gestion-dirigentes');
        }, 200); // Esperar 200 milisegundos
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

// 🆕 FUNCIÓN MEJORADA PARA INICIALIZAR FILTROS
function inicializarFiltros() {
    console.log('🔧 Inicializando filtros...');
    
    const buscarInput = document.getElementById('buscar-dirigente');
    const filtroCorregimiento = document.getElementById('filtro-corregimiento');
    const filtroParticipacion = document.getElementById('filtro-participacion');
    const filtroCoordinador = document.getElementById('filtro-coordinador'); // 🆕 NUEVO
    
    // 🆕 CARGAR FILTROS GUARDADOS
    cargarFiltrosGuardados();
    
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            clearTimeout(this.buscarTimeout);
            this.buscarTimeout = setTimeout(() => {
                filtrarDirigentes();
                guardarFiltros(); // 🆕 GUARDAR FILTROS
            }, 500);
        });
    }
    
    if (filtroCorregimiento) {
        filtroCorregimiento.addEventListener('change', function() {
            filtrarDirigentes();
            guardarFiltros(); // 🆕 GUARDAR FILTROS
        });
    }
    
    if (filtroParticipacion) {
        filtroParticipacion.addEventListener('change', function() {
            filtrarDirigentes();
            guardarFiltros(); // 🆕 GUARDAR FILTROS
        });
    }
    
    // 🆕 EVENT LISTENER PARA NUEVO FILTRO DE COORDINADOR
    if (filtroCoordinador) {
        filtroCoordinador.addEventListener('change', function() {
            filtrarDirigentes();
            guardarFiltros(); // 🆕 GUARDAR FILTROS
        });
    }
    
    // Cargar opciones de filtros
    cargarCorregimientos();
    cargarCoordinadores(); // 🆕 CARGAR COORDINADORES
}

// FUNCIÓN ACTUALIZADA - CORREGIMIENTOS CON ESPACIOS
async function cargarCorregimientos() {
    // LISTA FIJA CON LOS 16 CORREGIMIENTOS Y SUS ESPACIOS
    const corregimientosFijos = [
        "Boca de Tucué",
        "Candelario Ovalle", 
        "Cañaveral",
        "Chiguirí Arriba",
        "Coclé",
        "El Coco",
        "General Victoriano Lorenzo",
        "Las Minas",
        "Pajonal ",
        "Penonomé ",
        "Riecito",
        "Rio Grande ",
        "Río Indio", 
        "San Miguel ",
        "Toabré",
        "Tulú"
    ];
    
    const select = document.getElementById('filtro-corregimiento');
    if (!select) return;
    
    // Limpiar y agregar opciones fijas
    select.innerHTML = '<option value="">Todos los corregimientos</option>';
    
    corregimientosFijos.forEach(corregimiento => {
        const option = document.createElement('option');
        option.value = corregimiento;
        option.textContent = corregimiento;
        select.appendChild(option);
    });
    
    console.log('✅ Corregimientos fijos cargados:', corregimientosFijos.length);
}

// 🆕 FUNCIÓN PARA CARGAR COORDINADORES ÚNICOS
function cargarCoordinadores() {
    console.log('👥 Cargando lista de coordinadores...');
    
    // Obtener coordinadores únicos de los dirigentes
    const coordinadores = [...new Set(appState.dirigentes.map(d => d.coordinador).filter(Boolean))].sort();
    const selectCoordinador = document.getElementById('filtro-coordinador');
    
    if (selectCoordinador) {
        // Guardar selección actual antes de limpiar
        const seleccionActual = selectCoordinador.value;
        
        // Limpiar y agregar opciones
        selectCoordinador.innerHTML = '<option value="">Todos los coordinadores</option>';
        coordinadores.forEach(coordinador => {
            const option = document.createElement('option');
            option.value = coordinador;
            option.textContent = coordinador;
            selectCoordinador.appendChild(option);
        });
        
        // 🆕 RESTAURAR SELECCIÓN GUARDADA
        const filtrosGuardados = obtenerFiltrosGuardados();
        if (filtrosGuardados.coordinador) {
            selectCoordinador.value = filtrosGuardados.coordinador;
        } else if (seleccionActual && coordinadores.includes(seleccionActual)) {
            // Si había una selección y todavía existe, mantenerla
            selectCoordinador.value = seleccionActual;
        }
        
        console.log('✅ Coordinadores cargados:', coordinadores.length);
    }
}

// 🆕 FUNCIÓN MEJORADA PARA FILTRAR DIRIGENTES
async function filtrarDirigentes() {
    const query = document.getElementById('buscar-dirigente')?.value.toLowerCase() || '';
    const corregimiento = document.getElementById('filtro-corregimiento')?.value || '';
    const participacion = document.getElementById('filtro-participacion')?.value || '';
    const coordinador = document.getElementById('filtro-coordinador')?.value || ''; // 🆕 NUEVO
    
    console.log('🔍 Filtros aplicados:', { query, corregimiento, participacion, coordinador });
    
    try {
        // Primero intentar con el servidor
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (corregimiento) params.append('corregimiento', corregimiento);
        if (participacion) params.append('participacion', participacion);
        if (coordinador) params.append('coordinador', coordinador); // 🆕 NUEVO
        
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
        filtrarDirigentesLocalmente(query, corregimiento, participacion, coordinador); // 🆕 ACTUALIZADO
    }
}

// FUNCIÓN MEJORADA PARA MOSTRAR DIRIGENTES FILTRADOS
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

// 🆕 FUNCIÓN ACTUALIZADA PARA FILTRADO LOCAL
function filtrarDirigentesLocalmente(query, corregimiento, participacion, coordinador) {
    
    console.log('🔍 FILTRANDO con:', {
        query, 
        corregimiento, 
        participacion, 
        coordinador // 🆕 NUEVO FILTRO
    });
    
    let dirigentesFiltrados = [...appState.dirigentes];
    
    console.log('📊 Total dirigentes para filtrar:', dirigentesFiltrados.length);
    
    // Filtro por búsqueda (nombre, cédula, comunidad, coordinador)
    if (query) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            (d.nombre && d.nombre.toLowerCase().includes(query)) ||
            (d.cedula && d.cedula.includes(query)) ||
            (d.comunidad && d.comunidad.toLowerCase().includes(query)) ||
            (d.coordinador && d.coordinador.toLowerCase().includes(query)) // 🆕 BUSCAR TAMBIÉN EN COORDINADOR
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
    
    // 🆕 FILTRO POR COORDINADOR
    if (coordinador) {
        dirigentesFiltrados = dirigentesFiltrados.filter(d => 
            d.coordinador && d.coordinador === coordinador
        );
        console.log('👥 Después de coordinador:', dirigentesFiltrados.length);
    }
    
    mostrarDirigentesFiltrados(dirigentesFiltrados);
}

// FUNCIÓN MEJORADA PARA MOSTRAR TODOS LOS DIRIGENTES
function mostrarTodosLosDirigentes() {
    renderizarDirigentes(true); // true = mostrar todos
    mostrarNotificacion(`Mostrando todos los ${appState.dirigentes.length} dirigentes`, 'success');
    
    // Ocultar el botón "Ver todos" ya que ya estamos viendo todos
    const infoResultados = document.getElementById('info-resultados');
    if (infoResultados) {
        infoResultados.style.display = 'none';
    }
}

// FUNCIÓN MEJORADA PARA ACTUALIZAR SELECT DE DIRIGENTES
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

// FUNCIÓN PARA OBTENER SOLO LOS ÚLTIMOS 10 DIRIGENTES (para el dashboard)
function obtenerUltimosDirigentes() {
    if (!appState.dirigentes || appState.dirigentes.length === 0) {
        return [];
    }
    
    // Ordenar por fecha de creación (más recientes primero) y tomar 10
    return [...appState.dirigentes]
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        .slice(0, 10);
}

// FUNCIÓN PARA EL BUSCADOR INTELIGENTE DE DIRIGENTES EN APOYOS
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

// FUNCIÓN MEJORADA - PRE-CARGA CORRECTA DE DATOS
function registrarApoyoDesdeVerificacion(dirigenteId, dirigenteNombre, dirigenteCedula) {
    // Verificar que el usuario esté autenticado
    if (!appState.isAuthenticated) {
        mostrarNotificacion('❌ Debe iniciar sesión para registrar apoyos', 'error');
        // Redirigir al login si no está autenticado
        document.getElementById('username').focus();
        return;
    }
    
    console.log('🎯 Intentando registrar apoyo para:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    // PRIMERO asegurarnos de que el panel de administración esté visible
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
    }
    
    // MOSTRAR LA SECCIÓN DE GESTIÓN DE APOYOS
    const seccionApoyos = document.getElementById('gestion-apoyos');
    if (seccionApoyos) {
        // Hacer scroll suave a la sección de apoyos
        seccionApoyos.scrollIntoView({ behavior: 'smooth' });
        
        // ESPERAR un momento y luego abrir el formulario
        setTimeout(() => {
            mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula);
        }, 500);
    } else {
        // Si no encuentra la sección, abrir directamente el formulario
        mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula);
    }
}

// FUNCIÓN ESPECÍFICA PARA PRE-CARGAR DATOS EN FORMULARIO DE APOYO
function mostrarFormApoyoConDirigente(dirigenteId, dirigenteNombre, dirigenteCedula) {
    console.log('📝 Pre-cargando datos en formulario:', { dirigenteId, dirigenteNombre, dirigenteCedula });
    
    // 1. Mostrar el formulario de apoyo
    const formApoyo = document.getElementById('form-apoyo');
    if (!formApoyo) {
        console.error('❌ No se encontró el formulario de apoyo');
        mostrarNotificacion('Error: No se puede abrir el formulario de apoyo', 'error');
        return;
    }
    
    formApoyo.classList.remove('hidden');
    
    // 2. Configurar componentes básicos
    configurarFechaAutomatica();
    configurarTipoApoyo();
    
    // 3. ESPERAR a que el select de dirigentes se cargue
    const esperarSelect = setInterval(() => {
        const selectDirigente = document.getElementById('apoyo-dirigente');
        
        if (selectDirigente && selectDirigente.options.length > 1) {
            clearInterval(esperarSelect);
            console.log('✅ Select de dirigentes cargado, procediendo a seleccionar...');
            
            // 4. BUSCAR y SELECCIONAR el dirigente en el select
            let encontrado = false;
            for (let i = 0; i < selectDirigente.options.length; i++) {
                const option = selectDirigente.options[i];
                if (option.value == dirigenteId) {
                    selectDirigente.value = dirigenteId;
                    encontrado = true;
                    console.log('✅ Dirigente seleccionado en el select');
                    break;
                }
            }
            
            // 5. Si no se encuentra, forzar la selección
            if (!encontrado && selectDirigente.options.length > 0) {
                // Buscar por texto que coincida con el nombre o cédula
                for (let i = 0; i < selectDirigente.options.length; i++) {
                    const option = selectDirigente.options[i];
                    if (option.text.includes(dirigenteCedula) || option.text.includes(dirigenteNombre)) {
                        selectDirigente.value = option.value;
                        encontrado = true;
                        console.log('✅ Dirigente encontrado por búsqueda de texto');
                        break;
                    }
                }
            }
            
            // 6. ACTUALIZAR el buscador para mostrar el dirigente seleccionado
            const buscador = document.getElementById('buscar-dirigente-apoyo');
            if (buscador) {
                buscador.value = `${dirigenteNombre} - ${dirigenteCedula}`;
                console.log('✅ Buscador actualizado con datos del dirigente');
                
                // Forzar evento de input para filtrar
                buscador.dispatchEvent(new Event('input'));
            }
            
            // 7. MOSTRAR confirmación visual
            if (encontrado) {
                mostrarNotificacion(`✅ Dirigente "${dirigenteNombre}" seleccionado para registro de apoyo`, 'success');
                
                // RESALTAR visualmente el formulario
                formApoyo.style.border = '2px solid #9b59b6';
                formApoyo.style.boxShadow = '0 0 10px rgba(155, 89, 182, 0.3)';
                
                setTimeout(() => {
                    formApoyo.style.border = '';
                    formApoyo.style.boxShadow = '';
                }, 3000);
                
            } else {
                mostrarNotificacion(`⚠️ Dirigente encontrado pero no en la lista. Complete manualmente.`, 'warning');
            }
            
        } else if (selectDirigente && selectDirigente.options.length <= 1) {
            console.log('⏳ Esperando que se carguen los dirigentes en el select...');
        }
    }, 100); // Verificar cada 100ms
    
    // Timeout de seguridad - si después de 3 segundos no carga
    setTimeout(() => {
        clearInterval(esperarSelect);
        const selectDirigente = document.getElementById('apoyo-dirigente');
        if (selectDirigente && selectDirigente.value !== dirigenteId) {
            console.warn('⚠️ No se pudo pre-seleccionar automáticamente');
            mostrarNotificacion(`ℹ️ Busque manualmente a "${dirigenteNombre}" en la lista`, 'info');
        }
    }, 3000);
}

// FUNCIONES PARA SCROLL AUTOMÁTICO

// Función para scroll suave a cualquier sección
function scrollToSection(sectionId) {
    console.log('🎯 Haciendo scroll a:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
        // Ajuste para que no quede detrás del header
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        console.log('✅ Scroll completado');
    }
}

// Función para resaltar una sección
function highlightSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Aplicar resaltado azul
        section.style.border = '3px solid #3498db';
        section.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.5)';
        section.style.transition = 'all 0.5s ease';
        
        // Quitar el resaltado después de 3 segundos
        setTimeout(() => {
            section.style.border = '';
            section.style.boxShadow = '';
        }, 3000);
    }
}

// Función para verificar si un elemento está visible en pantalla
function isElementInViewport(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// FUNCIÓN PARA VER CONSTANCIA DESDE VERIFICACIÓN
function verConstanciaApoyo(apoyoId) {
    console.log('📄 Abriendo constancia del apoyo ID:', apoyoId);
    
    // Verificar si el usuario está autenticado
    if (!appState.isAuthenticated) {
        mostrarNotificacion('🔐 Debe iniciar sesión para ver constancias', 'error');
        
        // Opcional: Hacer scroll al formulario de login
        setTimeout(() => {
            const loginSection = document.querySelector('header');
            if (loginSection) {
                loginSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
        
        return;
    }
    
    // Abrir la constancia en nueva pestaña
    window.open(`/constancia-apoyo/${apoyoId}`, '_blank');
    
    // Mostrar mensaje de confirmación
    mostrarNotificacion('📄 Constancia abierta en nueva pestaña', 'success');
}

// 🆕 FUNCIONES PARA EL MÓDULO ELECTORAL

function inicializarModuloElectoral() {
    if (!appState.isAuthenticated) return;
    
    console.log('🗳️ Inicializando módulo electoral...');
    datosElectoralesFiltrados = [...datosElectorales];
    
    // 🆕 INICIALIZAR BUSCADOR
    inicializarBuscadorElectoral();
    
    // Cargar datos iniciales
    cargarDatosElectorales();
}

function cargarFiltrosElectorales() {
    // Cargar corregimientos únicos
    const corregimientos = [...new Set(datosElectorales.map(d => d.corregimiento))];
    const selectCorregimiento = document.getElementById('filtro-corregimiento-electoral');
    
    if (selectCorregimiento) {
        selectCorregimiento.innerHTML = '<option value="">Todos los corregimientos</option>';
        corregimientos.forEach(corregimiento => {
            const option = document.createElement('option');
            option.value = corregimiento;
            option.textContent = corregimiento;
            selectCorregimiento.appendChild(option);
        });
    }
    
    // Cargar centros de votación únicos
    const centros = [...new Set(datosElectorales.map(d => d.centroVotacion))];
    const selectCentro = document.getElementById('filtro-centro-votacion');
    
    if (selectCentro) {
        selectCentro.innerHTML = '<option value="">Todos los centros de votación</option>';
        centros.forEach(centro => {
            const option = document.createElement('option');
            option.value = centro;
            option.textContent = centro;
            selectCentro.appendChild(option);
        });
    }
}

function cargarDatosElectorales() {
    const corregimiento = document.getElementById('filtro-corregimiento-electoral')?.value || '';
    const centro = document.getElementById('filtro-centro-votacion')?.value || '';
    
    // Aplicar filtros
    let datosFiltrados = datosElectorales;
    
    if (corregimiento) {
        datosFiltrados = datosFiltrados.filter(d => d.corregimiento === corregimiento);
    }
    
    if (centro) {
        datosFiltrados = datosFiltrados.filter(d => d.centroVotacion === centro);
    }
    
    datosElectoralesFiltrados = datosFiltrados;
    actualizarEstadisticasElectorales();
    mostrarTablaResultados();
    generarMapaCorregimientos();
    generarGraficoPartidos();
}

function mostrarTodosLosDatos() {
    document.getElementById('filtro-corregimiento-electoral').value = '';
    document.getElementById('filtro-centro-votacion').value = '';
    cargarDatosElectorales();
}

function actualizarEstadisticasElectorales() {
    const datos = datosElectoralesFiltrados;
    
    // Calcular totales
    const totalVotosCD = datos.reduce((sum, mesa) => sum + (mesa.partidos.CambioDemocratico || 0), 0);
    const totalVotosPRD = datos.reduce((sum, mesa) => sum + (mesa.partidos.PRD || 0), 0);
    const totalVotosValidos = datos.reduce((sum, mesa) => sum + (mesa.validos || 0), 0);
    
    const porcentajeCD = totalVotosValidos > 0 ? ((totalVotosCD / totalVotosValidos) * 100).toFixed(1) : 0;
    
    // Contar mesas ganadas
    const mesasGanadas = datos.filter(mesa => {
        const votosCD = mesa.partidos.CambioDemocratico || 0;
        const maxOtros = Math.max(
            mesa.partidos.PRD || 0,
            mesa.partidos.Panameñista || 0,
            mesa.partidos.MOLIRENA || 0,
            mesa.partidos.PartidoPopular || 0
        );
        return votosCD > maxOtros;
    }).length;
    
    // Actualizar tarjetas
    document.getElementById('total-votos-cd').textContent = totalVotosCD.toLocaleString();
    document.getElementById('total-votos-prd').textContent = totalVotosPRD.toLocaleString();
    document.getElementById('porcentaje-cd').textContent = `${porcentajeCD}%`;
    document.getElementById('mesas-ganadas').textContent = `${mesasGanadas}/${datos.length}`;
}

function mostrarTablaResultados() {
    const tbody = document.getElementById('cuerpo-tabla-resultados');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Agrupar por centro de votación
    const porCentro = {};
    datosElectoralesFiltrados.forEach(mesa => {
        const key = `${mesa.corregimiento}-${mesa.centroVotacion}`;
        if (!porCentro[key]) {
            porCentro[key] = {
                corregimiento: mesa.corregimiento,
                centroVotacion: mesa.centroVotacion,
                totalVotos: 0,
                votosCD: 0,
                votosPRD: 0,
                votosPanameñista: 0,
                mesas: [] // 🆕 Guardar las mesas individuales
            };
        }
        
        porCentro[key].totalVotos += mesa.validos || 0;
        porCentro[key].votosCD += mesa.partidos.CambioDemocratico || 0;
        porCentro[key].votosPRD += mesa.partidos.PRD || 0;
        porCentro[key].votosPanameñista += mesa.partidos.Panameñista || 0;
        porCentro[key].mesas.push(mesa); // 🆕 Agregar mesa
    });
    
    // Mostrar en tabla
    Object.values(porCentro).forEach(centro => {
        const porcentajeCD = centro.totalVotos > 0 ? ((centro.votosCD / centro.totalVotos) * 100).toFixed(1) : 0;
        const resultado = centro.votosCD > centro.votosPRD ? '✅ Ganó CD' : '❌ Ganó PRD';
        const colorResultado = centro.votosCD > centro.votosPRD ? '#27ae60' : '#e74c3c';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${centro.corregimiento}</strong></td>
            <td>${centro.centroVotacion}</td>
            <td>${centro.totalVotos.toLocaleString()}</td>
            <td style="color: #3498db; font-weight: bold;">${centro.votosCD}</td>
            <td style="color: #e74c3c;">${centro.votosPRD}</td>
            <td style="color: #f39c12;">${centro.votosPanameñista}</td>
            <td style="font-weight: bold; color: ${porcentajeCD >= 50 ? '#27ae60' : '#e74c3c'}">
                ${porcentajeCD}%
            </td>
            <td style="color: ${colorResultado}; font-weight: bold;">
                ${resultado}
            </td>
            <td class="actions">
                <button class="edit" onclick="editarCentroElectoral('${centro.corregimiento}', '${centro.centroVotacion}')" style="background: #f39c12; padding: 5px 10px; font-size: 0.8em;">
                    ✏️ Editar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // 🆕 MOSTRAR MESAS INDIVIDUALES
        centro.mesas.forEach(mesa => {
            const mesaTr = document.createElement('tr');
            mesaTr.style.background = '#f8f9fa';
            const mesaPorcentajeCD = mesa.validos > 0 ? ((mesa.partidos.CambioDemocratico / mesa.validos) * 100).toFixed(1) : 0;
            const mesaResultado = mesa.partidos.CambioDemocratico > mesa.partidos.PRD ? '✅ CD' : '❌ PRD';
            
            mesaTr.innerHTML = `
                <td style="padding-left: 40px; font-size: 0.9em; color: #666;">↳ ${mesa.mesa}</td>
                <td style="font-size: 0.9em; color: #666;">${mesa.validos} votos</td>
                <td style="font-size: 0.9em; color: #3498db; font-weight: bold;">${mesa.partidos.CambioDemocratico || 0}</td>
                <td style="font-size: 0.9em; color: #e74c3c;">${mesa.partidos.PRD || 0}</td>
                <td style="font-size: 0.9em; color: #f39c12;">${mesa.partidos.Panameñista || 0}</td>
                <td style="font-size: 0.9em; font-weight: bold; color: ${mesaPorcentajeCD >= 50 ? '#27ae60' : '#e74c3c'}">
                    ${mesaPorcentajeCD}%
                </td>
                <td style="font-size: 0.9em; color: ${mesa.partidos.CambioDemocratico > mesa.partidos.PRD ? '#27ae60' : '#e74c3c'};">
                    ${mesaResultado}
                </td>
                <td class="actions">
                    <button class="edit" onclick="editarDatoElectoral(${mesa.id})" style="background: #f39c12; padding: 3px 8px; font-size: 0.7em; margin: 2px;">
                        ✏️
                    </button>
                    <button class="delete" onclick="eliminarDatoElectoral(${mesa.id})" style="background: #e74c3c; padding: 3px 8px; font-size: 0.7em; margin: 2px;">
                        🗑️
                    </button>
                </td>
            `;
            tbody.appendChild(mesaTr);
        });
    });
}

function generarMapaCorregimientos() {
    const contenedor = document.getElementById('mapa-corregimientos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    // Agrupar por corregimiento
    const porCorregimiento = {};
    datosElectoralesFiltrados.forEach(mesa => {
        if (!porCorregimiento[mesa.corregimiento]) {
            porCorregimiento[mesa.corregimiento] = {
                votosCD: 0,
                votosPRD: 0,
                totalVotos: 0,
                mesas: 0
            };
        }
        
        porCorregimiento[mesa.corregimiento].votosCD += mesa.partidos.CambioDemocratico || 0;
        porCorregimiento[mesa.corregimiento].votosPRD += mesa.partidos.PRD || 0;
        porCorregimiento[mesa.corregimiento].totalVotos += mesa.validos || 0;
        porCorregimiento[mesa.corregimiento].mesas += 1;
    });
    
    // Crear tarjetas de corregimientos
    Object.entries(porCorregimiento).forEach(([corregimiento, datos]) => {
        const porcentajeCD = datos.totalVotos > 0 ? ((datos.votosCD / datos.totalVotos) * 100).toFixed(1) : 0;
        const color = porcentajeCD >= 50 ? '#27ae60' : '#e74c3c';
        const icono = porcentajeCD >= 50 ? '✅' : '❌';
        
        const tarjeta = document.createElement('div');
        tarjeta.style.cssText = `
            padding: 15px;
            border: 2px solid ${color};
            border-radius: 8px;
            background: ${color}15;
            text-align: center;
            transition: transform 0.2s;
            cursor: pointer;
        `;
        
        tarjeta.onmouseover = () => tarjeta.style.transform = 'scale(1.05)';
        tarjeta.onmouseout = () => tarjeta.style.transform = 'scale(1)';
        
        // 🆕 HACER CLIC PARA FILTRAR POR CORREGIMIENTO
        tarjeta.onclick = () => buscarDesdeDashboard('corregimiento', corregimiento);
        
        tarjeta.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${corregimiento}</h4>
            <div style="font-size: 28px; font-weight: bold; color: ${color}; margin: 10px 0;">
                ${porcentajeCD}%
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                ${datos.votosCD} de ${datos.totalVotos} votos
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                <span style="color: #3498db;">CD: ${datos.votosCD}</span>
                <span style="color: #e74c3c;">PRD: ${datos.votosPRD}</span>
            </div>
            <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 5px;">
                📊 ${datos.mesas} mesa${datos.mesas !== 1 ? 's' : ''}
            </div>
            <div style="margin-top: 8px; font-size: 12px; font-weight: bold; color: ${color};">
                ${icono} ${porcentajeCD >= 50 ? 'GANAMOS' : 'PERDIMOS'}
            </div>
            <div style="margin-top: 5px; font-size: 10px; color: #3498db;">
                👆 Click para filtrar
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function generarGraficoPartidos() {
    const contenedor = document.getElementById('grafico-partidos');
    if (!contenedor) return;
    
    // Calcular totales por partido
    const totalesPartidos = {
        CambioDemocratico: 0,
        PRD: 0,
        Panameñista: 0,
        MOLIRENA: 0,
        PartidoPopular: 0,
        RealizandoMetas: 0,
        MOCA: 0
    };
    
    datosElectoralesFiltrados.forEach(mesa => {
        Object.keys(totalesPartidos).forEach(partido => {
            totalesPartidos[partido] += mesa.partidos[partido] || 0;
        });
    });
    
    const totalGeneral = Object.values(totalesPartidos).reduce((a, b) => a + b, 0);
    
    // Colores para cada partido
    const coloresPartidos = {
        CambioDemocratico: '#3498db',
        PRD: '#e74c3c', 
        Panameñista: '#f39c12',
        MOLIRENA: '#9b59b6',
        PartidoPopular: '#2ecc71',
        RealizandoMetas: '#e67e22',
        MOCA: '#34495e'
    };
    
    // Generar gráfico de barras
    contenedor.innerHTML = '';
    
    Object.entries(totalesPartidos)
        .sort(([,a], [,b]) => b - a)
        .forEach(([partido, votos]) => {
            if (votos === 0) return;
            
            const porcentaje = totalGeneral > 0 ? ((votos / totalGeneral) * 100).toFixed(1) : 0;
            const anchoBarra = totalGeneral > 0 ? ((votos / totalGeneral) * 100) : 0;
            
            const barra = document.createElement('div');
            barra.style.marginBottom = '12px';
            barra.innerHTML = `
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: #2c3e50; min-width: 180px;">${partido}:</span>
                    <span style="font-weight: bold; color: ${coloresPartidos[partido]}; margin: 0 10px;">
                        ${votos} votos
                    </span>
                    <span style="color: #666; font-size: 12px;">${porcentaje}%</span>
                </div>
                <div style="height: 25px; background: #ecf0f1; border-radius: 12px; overflow: hidden;">
                    <div style="width: ${anchoBarra}%; height: 100%; background: ${coloresPartidos[partido]}; 
                         display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; 
                         color: white; font-weight: bold; font-size: 12px; transition: width 1s ease-in-out;">
                    </div>
                </div>
            `;
            contenedor.appendChild(barra);
        });
}

// 🆕 CONFIGURAR EVENT LISTENER PARA EL FORMULARIO
document.addEventListener('DOMContentLoaded', function() {
    const formElectoral = document.getElementById('form-datos-electorales');
    if (formElectoral) {
        formElectoral.addEventListener('submit', guardarDatosElectorales);
    }
});

// 🆕 FUNCIONES PARA CONTROLAR DASHBOARDS SEPARADOS

function mostrarDashboard(tipo) {
    // Ocultar todos los dashboards
    document.getElementById('dashboard-dirigentes').classList.add('hidden');
    document.getElementById('dashboard-electoral').classList.add('hidden');
    
    // Remover activo de todos los botones
    document.getElementById('btn-dirigentes').style.background = '#3498db';
    document.getElementById('btn-electoral').style.background = '#9b59b6';
    
    // Mostrar dashboard seleccionado
    if (tipo === 'dirigentes') {
        document.getElementById('dashboard-dirigentes').classList.remove('hidden');
        document.getElementById('btn-dirigentes').style.background = '#2980b9';
        console.log('👥 Mostrando dashboard de dirigentes');
    } else if (tipo === 'electoral') {
        document.getElementById('dashboard-electoral').classList.remove('hidden');
        document.getElementById('btn-electoral').style.background = '#8e44ad';
        
        // 🆕 INICIALIZAR Y ACTUALIZAR DATOS ELECTORALES
        inicializarModuloElectoral();
        console.log('📊 Mostrando dashboard electoral');
    }
}

// 🆕 FUNCIÓN CORREGIDA PARA ACTUALIZAR ESTADÍSTICAS ELECTORALES
function actualizarEstadisticasElectorales() {
    const datos = datosElectoralesFiltrados;
    
    // 🆕 CALCULAR NUEVAS ESTADÍSTICAS
    const totalMesas = datos.length;
    const totalVotosCD = datos.reduce((sum, mesa) => sum + (mesa.partidos.CambioDemocratico || 0), 0);
    const totalVotosPRD = datos.reduce((sum, mesa) => sum + (mesa.partidos.PRD || 0), 0);
    const totalVotosValidos = datos.reduce((sum, mesa) => sum + (mesa.validos || 0), 0);
    const totalEscrutados = datos.reduce((sum, mesa) => sum + (mesa.escrutados || 0), 0);
    
    const porcentajeCD = totalVotosValidos > 0 ? ((totalVotosCD / totalVotosValidos) * 100).toFixed(1) : 0;
    const participacionTotal = totalEscrutados > 0 ? ((totalVotosValidos / totalEscrutados) * 100).toFixed(1) : 0;
    
    // 🆕 Contar mesas ganadas (CORREGIDO)
    const mesasGanadas = datos.filter(mesa => {
        const votosCD = mesa.partidos.CambioDemocratico || 0;
        
        // Encontrar el máximo de los otros partidos principales
        const otrosPartidos = [
            mesa.partidos.PRD || 0,
            mesa.partidos.Panameñista || 0,
            mesa.partidos.MOLIRENA || 0,
            mesa.partidos.PartidoPopular || 0,
            mesa.partidos.RealizandoMetas || 0,
            mesa.partidos.MOCA || 0,
            mesa.partidos.RicardoJaen || 0,
            mesa.partidos.RaulCamargo || 0,
            mesa.partidos.ReyesAguilar || 0
        ];
        
        const maxOtros = Math.max(...otrosPartidos);
        return votosCD > maxOtros;
    }).length;
    
    console.log('📊 Estadísticas electorales calculadas:', {
        totalMesas,
        totalVotosCD,
        totalVotosPRD,
        porcentajeCD,
        mesasGanadas,
        participacionTotal
    });
    
    // 🆕 ACTUALIZAR TARJETAS DEL DASHBOARD ELECTORAL
    document.getElementById('total-mesas').textContent = totalMesas.toLocaleString();
    document.getElementById('total-votos-cd').textContent = totalVotosCD.toLocaleString();
    document.getElementById('total-votos-prd').textContent = totalVotosPRD.toLocaleString();
    document.getElementById('porcentaje-cd').textContent = `${porcentajeCD}%`;
    document.getElementById('mesas-ganadas').textContent = `${mesasGanadas}/${totalMesas}`;
    document.getElementById('participacion-total').textContent = `${participacionTotal}%`;
}

// 🆕 FUNCIÓN MEJORADA PARA GUARDAR DATOS ELECTORALES
async function guardarDatosElectorales(event) {
    event.preventDefault();
    
    // ... (todo el código anterior de validaciones y obtención de datos) ...
    
    try {
        // Agregar a los datos existentes
        datosElectorales.push(nuevoDatoElectoral);
        
        // 🆕 ACTUALIZAR EL DASHBOARD ELECTORAL INMEDIATAMENTE
        datosElectoralesFiltrados = [...datosElectorales];
        actualizarEstadisticasElectorales();
        mostrarTablaResultados();
        generarMapaCorregimientos();
        generarGraficoPartidos();
        
        // Ocultar formulario
        ocultarFormularioElectoral();
        
        // Mostrar mensaje de éxito
        mostrarNotificacion(`✅ Datos de ${centroVotacion} - ${mesa} guardados exitosamente`, 'success');
        
        console.log('📥 Nuevo dato electoral guardado y dashboard actualizado:', nuevoDatoElectoral);
        
    } catch (error) {
        console.error('❌ Error al guardar datos electorales:', error);
        mostrarNotificacion('❌ Error al guardar los datos', 'error');
    }
}

// 🆕 MODIFICAR LA INICIALIZACIÓN
function inicializarModuloElectoral() {
    if (!appState.isAuthenticated) return;
    
    console.log('🗳️ Inicializando módulo electoral...');
    datosElectoralesFiltrados = [...datosElectorales];
    
    // 🆕 ACTUALIZAR ESTADÍSTICAS INMEDIATAMENTE
    actualizarEstadisticasElectorales();
    
    // Inicializar buscador y componentes
    inicializarBuscadorElectoral();
    cargarDatosElectorales();
    
    console.log('✅ Módulo electoral inicializado con', datosElectorales.length, 'mesas');
}

// 🆕 FUNCIÓN PARA CAMBIAR ENTRE DASHBOARDS
function mostrarDashboard(tipo) {
    console.log('🎯 Cambiando a dashboard: ' + tipo);
    
    // Ocultar todos los dashboards
    document.getElementById('dashboard-dirigentes').classList.add('hidden');
    document.getElementById('dashboard-electoral').classList.add('hidden');
    
    // Cambiar colores de botones
    document.getElementById('btn-dirigentes').style.background = '#3498db';
    document.getElementById('btn-electoral').style.background = '#9b59b6';
    
    // Mostrar dashboard seleccionado
    if (tipo === 'dirigentes') {
        document.getElementById('dashboard-dirigentes').classList.remove('hidden');
        document.getElementById('btn-dirigentes').style.background = '#2980b9';
        
        // ACTUALIZAR DATOS DE DIRIGENTES
        actualizarDashboardDirigentes();
        console.log('👥 Mostrando dashboard de dirigentes');
        
    } else if (tipo === 'electoral') {
        document.getElementById('dashboard-electoral').classList.remove('hidden');
        document.getElementById('btn-electoral').style.background = '#8e44ad';
        
        // INICIALIZAR DATOS ELECTORALES
        inicializarModuloElectoral();
        console.log('📊 Mostrando dashboard electoral');
    }
}

// 🆕 FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS DE DIRIGENTES
async function actualizarDashboardDirigentes() {
    console.log('📊 Actualizando estadísticas de dirigentes...');
    
    try {
        // Intentar cargar del servidor
        const response = await fetch('/api/estadisticas');
        
        if (response.ok) {
            const estadisticas = await response.json();
            actualizarDashboard(estadisticas);
            console.log('✅ Estadísticas cargadas del servidor');
        } else {
            // Si falla, calcular localmente
            throw new Error('Servidor no disponible');
        }
    } catch (error) {
        console.log('🔄 Usando cálculo local...');
        calcularEstadisticasLocales();
    }
}

// 🆕 FUNCIÓN DE EMERGENCIA - VER DATOS
function verDatosActuales() {
    console.log('🔍 Revisando datos actuales:');
    console.log('- Dirigentes:', appState.dirigentes.length);
    console.log('- Apoyos:', appState.apoyos.length);
    console.log('- Colaboradores:', appState.colaboradores.length);
    
    alert('📊 Datos actuales:\n' +
          'Dirigentes: ' + appState.dirigentes.length + '\n' +
          'Apoyos: ' + appState.apoyos.length + '\n' +
          'Colaboradores: ' + appState.colaboradores.length);
}

// 🆕 FUNCIONES PARA EDITAR Y ELIMINAR APOYOS

// Función para editar un apoyo
async function editarApoyo(apoyoId) {
    console.log('✏️ Editando apoyo ID:', apoyoId);
    
    // Buscar el apoyo en los datos
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
            // Cargar datos en el formulario
            document.getElementById('apoyo-dirigente').value = apoyo.dirigente_id;
            document.getElementById('apoyo-colaborador').value = apoyo.colaborador_id;
            document.getElementById('apoyo-tipo').value = apoyo.tipo;
            document.getElementById('apoyo-descripcion').value = apoyo.descripcion || '';
            document.getElementById('apoyo-monto').value = apoyo.monto || '';
            
            // Configurar fecha (convertir formato)
            const fecha = new Date(apoyo.fecha);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            document.getElementById('apoyo-fecha').value = fechaFormateada;
            
            // Actualizar buscador para mostrar el dirigente seleccionado
            const buscador = document.getElementById('buscar-dirigente-apoyo');
            if (buscador && apoyo.dirigente_nombre) {
                buscador.value = apoyo.dirigente_nombre;
                buscador.dispatchEvent(new Event('input'));
            }
            
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

// Función para eliminar un apoyo
async function eliminarApoyo(apoyoId) {
    console.log('🗑️ Intentando eliminar apoyo ID:', apoyoId);
    
    // Buscar el apoyo para mostrar información
    const apoyo = appState.apoyos.find(a => a.id === apoyoId);
    if (!apoyo) {
        mostrarNotificacion('❌ Apoyo no encontrado', 'error');
        return;
    }
    
    // Confirmar eliminación
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
        // Enviar solicitud de eliminación al servidor
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
            console.error('❌ Error del servidor al eliminar:', data);
        }
        
    } catch (error) {
        console.error('💥 Error de conexión al eliminar apoyo:', error);
        mostrarNotificacion('❌ Error de conexión al eliminar apoyo', 'error');
    }
}

// 🆕 MODIFICAR LA FUNCIÓN registrarApoyo PARA SOPORTAR EDICIÓN
// Busca la función registrarApoyo y REEMPLÁZALA por esta versión:

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
        fecha: fecha // 🆕 Incluir fecha para edición
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

// 🆕 SISTEMA PARA GUARDAR Y RECUPERAR FILTROS

// Función para guardar los filtros actuales
function guardarFiltros() {
    const filtros = {
        buscar: document.getElementById('buscar-dirigente').value,
        corregimiento: document.getElementById('filtro-corregimiento').value,
        participacion: document.getElementById('filtro-participacion').value,
        coordinador: document.getElementById('filtro-coordinador').value // 🆕 NUEVO
    };
    
    // Guardar en localStorage
    localStorage.setItem('filtrosDirigentes', JSON.stringify(filtros));
    console.log('💾 Filtros guardados:', filtros);
}

// Función para cargar los filtros guardados
function cargarFiltrosGuardados() {
    try {
        const filtrosGuardados = localStorage.getItem('filtrosDirigentes');
        if (filtrosGuardados) {
            const filtros = JSON.parse(filtrosGuardados);
            
            // Aplicar filtros guardados
            if (document.getElementById('buscar-dirigente') && filtros.buscar) {
                document.getElementById('buscar-dirigente').value = filtros.buscar;
            }
            if (document.getElementById('filtro-corregimiento') && filtros.corregimiento) {
                document.getElementById('filtro-corregimiento').value = filtros.corregimiento;
            }
            if (document.getElementById('filtro-participacion') && filtros.participacion) {
                document.getElementById('filtro-participacion').value = filtros.participacion;
            }
            // 🆕 CARGAR FILTRO DE COORDINADOR
            if (document.getElementById('filtro-coordinador') && filtros.coordinador) {
                document.getElementById('filtro-coordinador').value = filtros.coordinador;
            }
            
            console.log('📂 Filtros cargados:', filtros);
            return filtros;
        }
    } catch (error) {
        console.error('❌ Error al cargar filtros guardados:', error);
    }
    return null;
}

// Función para obtener filtros guardados
function obtenerFiltrosGuardados() {
    try {
        const filtrosGuardados = localStorage.getItem('filtrosDirigentes');
        return filtrosGuardados ? JSON.parse(filtrosGuardados) : {};
    } catch (error) {
        return {};
    }
}

// Función para limpiar todos los filtros
function limpiarFiltros() {
    // Limpiar campos
    document.getElementById('buscar-dirigente').value = '';
    document.getElementById('filtro-corregimiento').value = '';
    document.getElementById('filtro-participacion').value = '';
    document.getElementById('filtro-coordinador').value = '';
    
    // Limpiar localStorage
    localStorage.removeItem('filtrosDirigentes');
    
    // Aplicar filtros (mostrar todos)
    filtrarDirigentes();
    
    mostrarNotificacion('🧹 Filtros limpiados', 'success');
}

// 🆕 CÓDIGO TEMPORAL PARA DIAGNOSTICAR (ELIMINAR DESPUÉS)
console.log('🔧 Script.js cargado correctamente');

// Verificar que las funciones existan
console.log('✅ Función login existe:', typeof login);
console.log('✅ Función cargarDatos existe:', typeof cargarDatos);

// Agregar event listener directo al botón de login
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página completamente cargada');
    
    const loginBtn = document.querySelector('#login-form button');
    if (loginBtn) {
        console.log('✅ Botón de login encontrado');
        // Agregar event listener adicional por si acaso
        loginBtn.addEventListener('click', function(e) {
            console.log('🎯 Click detectado en botón login');
            login();
        });
    } else {
        console.error('❌ Botón de login NO encontrado');
    }
    
    // Verificar que los campos de login existan
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    console.log('✅ Campo usuario existe:', !!usernameField);
    console.log('✅ Campo contraseña existe:', !!passwordField);
});

// 🆕 SOLUCIÓN: AGREGAR EVENT LISTENER DIRECTO
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM completamente cargado');
    
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        console.log('✅ Botón de login encontrado, agregando event listener...');
        loginBtn.addEventListener('click', login);
    } else {
        console.error('❌ Botón de login NO encontrado con id="btn-login"');
    }
    
    // Verificar que la función login existe
    console.log('🔍 Función login disponible:', typeof login);
});




