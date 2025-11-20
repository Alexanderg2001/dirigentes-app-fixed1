const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para Render
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-secreta-temporal',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Configuración de timeout para Render
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutos
  res.setTimeout(300000);
  next();
});

// Inicializar base de datos
const db = require('./database.js');

// Rutas de autenticación
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM administradores WHERE username = ? AND activo = TRUE', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
    
    if (row && await bcrypt.compare(password, row.password)) {
      req.session.userId = row.id;
      req.session.username = row.username;
      req.session.rol = row.rol;
      req.session.isAdmin = row.rol === 'admin';
      res.json({ 
        success: true, 
        rol: row.rol,
        username: row.username 
      });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
};

// Ruta para datos de usuario actual
app.get('/api/usuario-actual', requireAuth, (req, res) => {
  res.json({
    id: req.session.userId,
    username: req.session.username,
    rol: req.session.rol,
    isAdmin: req.session.isAdmin
  });
});

// RUTAS PRINCIPALES

// Obtener últimos 10 dirigentes
app.get('/api/dirigentes', requireAuth, (req, res) => {
  db.all('SELECT * FROM dirigentes ORDER BY creado_en DESC, id DESC LIMIT 10', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener dirigentes' });
    }
    res.json(rows);
  });
});

// Obtener TODOS los dirigentes (para el buscador de apoyos)
app.get('/api/dirigentes/todos', requireAuth, (req, res) => {
  db.all('SELECT * FROM dirigentes ORDER BY nombre', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener todos los dirigentes' });
    }
    res.json(rows);
  });
});

// Crear dirigente
app.post('/api/dirigentes', requireAuth, (req, res) => {
  const { nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion } = req.body;
  
  db.run(
    'INSERT INTO dirigentes (nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion || 'regular'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear dirigente' });
      }
      res.json({ id: this.lastID, message: 'Dirigente creado exitosamente' });
    }
  );
});

// Actualizar dirigente
app.put('/api/dirigentes/:id', requireAuth, (req, res) => {
  const { nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion } = req.body;
  const id = req.params.id;
  
  db.run(
    'UPDATE dirigentes SET nombre = ?, cedula = ?, telefono = ?, corregimiento = ?, comunidad = ?, coordinador = ?, participacion = ? WHERE id = ?',
    [nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar dirigente' });
      }
      res.json({ message: 'Dirigente actualizado exitosamente' });
    }
  );
});

// Eliminar dirigente
app.delete('/api/dirigentes/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM dirigentes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar dirigente' });
    }
    res.json({ message: 'Dirigente eliminado exitosamente' });
  });
});

// Obtener colaboradores
app.get('/api/colaboradores', requireAuth, (req, res) => {
  db.all('SELECT * FROM colaboradores WHERE activo = TRUE ORDER BY nombre', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener colaboradores' });
    }
    res.json(rows);
  });
});

// 🆕 RUTA MEJORADA - OBTENER APOYOS CON NOMBRES DE DIRIGENTES
app.get('/api/apoyos', requireAuth, (req, res) => {
    db.all(`
        SELECT a.*, 
               d.nombre as dirigente_nombre,
               d.cedula as dirigente_cedula,
               c.nombre as colaborador_nombre
        FROM apoyos a 
        LEFT JOIN dirigentes d ON a.dirigente_id = d.id 
        LEFT JOIN colaboradores c ON a.colaborador_id = c.id
        ORDER BY a.fecha DESC
    `, (err, rows) => {
        if (err) {
            console.error('Error al obtener apoyos:', err);
            return res.status(500).json({ error: 'Error al obtener apoyos' });
        }
        res.json(rows);
    });
});

// Crear apoyo
app.post('/api/apoyos', requireAuth, (req, res) => {
  const { dirigente_id, tipo, descripcion, monto, colaborador_id } = req.body;
  
  const ahora = new Date();
  const fecha = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  db.run(
    'INSERT INTO apoyos (dirigente_id, tipo, descripcion, monto, fecha, colaborador_id) VALUES (?, ?, ?, ?, ?, ?)',
    [dirigente_id, tipo, descripcion, monto || null, fecha, colaborador_id || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al registrar apoyo' });
      }
      res.json({ id: this.lastID, message: 'Apoyo registrado exitosamente' });
    }
  );
});

// 🆕 RUTA PARA OBTENER UN DIRIGENTE ESPECÍFICO
app.get('/api/dirigentes/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM dirigentes WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el dirigente' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Dirigente no encontrado' });
        }
        
        res.json(row);
    });
});

// Búsqueda pública de dirigente
// 🆕 RUTA MEJORADA - BUSCAR DIRIGENTE CON HISTORIAL DE APOYOS
app.get('/api/buscar-dirigente', (req, res) => {
    const cedula = req.query.cedula;
    
    db.get('SELECT * FROM dirigentes WHERE cedula = ?', [cedula], (err, dirigente) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la búsqueda' });
        }
        
        if (!dirigente) {
            return res.json({ encontrado: false });
        }
        
        // 🆕 BUSCAR APOYOS DEL DIRIGENTE
        db.all(`
            SELECT a.*, c.nombre as colaborador_nombre, c.cargo as colaborador_cargo
            FROM apoyos a 
            LEFT JOIN colaboradores c ON a.colaborador_id = c.id
            WHERE a.dirigente_id = ?
            ORDER BY a.fecha DESC
        `, [dirigente.id], (err, apoyos) => {
            if (err) {
                console.error('Error al cargar apoyos:', err);
                return res.json({ 
                    encontrado: true, 
                    dirigente: dirigente,
                    apoyos: [] 
                });
            }
            
            res.json({ 
                encontrado: true, 
                dirigente: dirigente,
                apoyos: apoyos 
            });
        });
    });
});

// 🆕 RUTA MEJORADA - SUMA TODOS LOS MONTOS
app.get('/api/estadisticas', requireAuth, (req, res) => {
    const estadisticas = {
        participacion: [],
        apoyos: [],
        totalDirigentes: 0,
        totalApoyos: 0,
        totalMontoGeneral: 0 // 🆕 NUEVO: total de TODOS los montos
    };

    // Contar dirigentes por participación
    db.all(`
        SELECT participacion, COUNT(*) as total 
        FROM dirigentes 
        GROUP BY participacion
    `, (err, rows) => {
        if (!err) estadisticas.participacion = rows;

        // 🆕 CONTAR APOYOS Y SUMAR TODOS LOS MONTOS (no solo económicos)
        db.all(`
            SELECT tipo, COUNT(*) as total, SUM(COALESCE(monto, 0)) as total_monto 
            FROM apoyos 
            GROUP BY tipo
        `, (err, rows) => {
            if (!err) {
                estadisticas.apoyos = rows;
                
                // 🆕 CALCULAR TOTAL GENERAL DE TODOS LOS MONTOS
                let totalGeneral = 0;
                rows.forEach(apoyo => {
                    totalGeneral += apoyo.total_monto || 0;
                });
                estadisticas.totalMontoGeneral = totalGeneral;
            }

            // Total de dirigentes
            db.get('SELECT COUNT(*) as total FROM dirigentes', (err, row) => {
                if (!err && row) estadisticas.totalDirigentes = row.total;

                // Total de apoyos
                db.get('SELECT COUNT(*) as total FROM apoyos', (err, row) => {
                    if (!err && row) estadisticas.totalApoyos = row.total;
                    
                    console.log('📊 Enviando estadísticas MEJORADAS:', estadisticas);
                    res.json(estadisticas);
                });
            });
        });
    });
});

// Búsqueda avanzada de dirigentes
app.get('/api/dirigentes/buscar', requireAuth, (req, res) => {
  const { q, corregimiento, participacion } = req.query;
  let sql = 'SELECT * FROM dirigentes WHERE 1=1';
  let params = [];

  if (q) {
    sql += ' AND (nombre LIKE ? OR cedula LIKE ? OR comunidad LIKE ? OR coordinador LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (corregimiento) {
    sql += ' AND corregimiento = ?';
    params.push(corregimiento);
  }
  if (participacion) {
    sql += ' AND participacion = ?';
    params.push(participacion);
  }

  sql += ' ORDER BY creado_en DESC LIMIT 50';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la búsqueda' });
    }
    res.json(rows);
  });
});

// Obtener corregimientos
app.get('/api/corregimientos', requireAuth, (req, res) => {
  db.all('SELECT DISTINCT nombre FROM corregimientos ORDER BY nombre', (err, rows) => {
    if (err) {
      return res.json([]);
    }
    res.json(rows);
  });
});

// Ruta para generar constancia de dirigente
app.get('/constancia/:dirigenteId', requireAuth, (req, res) => {
  const dirigenteId = req.params.dirigenteId;
  
  db.get('SELECT * FROM dirigentes WHERE id = ?', [dirigenteId], (err, dirigente) => {
    if (err || !dirigente) {
      return res.status(404).send('Dirigente no encontrado');
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Constancia de Dirigente</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin: 20px 0; line-height: 1.6; }
          .firma { margin-top: 80px; text-align: center; }
          .firma-line { width: 300px; border-top: 1px solid #000; margin: 0 auto; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONSTANCIA DE DIRIGENTE COMUNITARIO</h1>
        </div>
        
        <div class="content">
          <p>Por medio de la presente se hace constar que <strong>${dirigente.nombre}</strong>, 
          identificado con cédula de ciudadanía No. <strong>${dirigente.cedula}</strong>, 
          es reconocido(a) como dirigente comunitario(a) en el corregimiento de 
          <strong>${dirigente.corregimiento}</strong>, comunidad de <strong>${dirigente.comunidad}</strong>.</p>
          
          <p>En su labor, responde ante el coordinador <strong>${dirigente.coordinador}</strong> 
          y su nivel de participación se evalúa como: 
          <strong>${dirigente.participacion === 'buena' ? 'BUENA' : dirigente.participacion === 'regular' ? 'REGULAR' : 'MALA'}</strong>.</p>
          
          <p>Esta constancia se expide a solicitud del interesado para los fines que estime convenientes.</p>
        </div>
        
        <div class="firma">
          <div class="firma-line"></div>
          <p>Firma del Dirigente</p>
        </div>
        
        <div class="footer">
          <p>Fecha de emisión: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()">Imprimir Constancia</button>
          <button onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `);
  });
});

// 🆕 RUTA CORREGIDA PARA GENERAR CONSTANCIA DE APOYO CON LOGO REAL
app.get('/constancia-apoyo/:apoyoId', requireAuth, (req, res) => {
    const apoyoId = req.params.apoyoId;
    
    db.get(`
        SELECT a.*, d.nombre as dirigente_nombre, d.cedula, d.telefono, 
               d.corregimiento, d.comunidad, d.coordinador, d.participacion,
               c.nombre as colaborador_nombre, c.cargo as colaborador_cargo
        FROM apoyos a 
        LEFT JOIN dirigentes d ON a.dirigente_id = d.id 
        LEFT JOIN colaboradores c ON a.colaborador_id = c.id
        WHERE a.id = ?
    `, [apoyoId], (err, resultado) => {
        if (err) {
            console.error('Error en consulta de constancia:', err);
            return res.status(500).send('Error del servidor');
        }
        
        if (!resultado) {
            return res.status(404).send('Apoyo no encontrado');
        }
        
        // Formatear monto si es apoyo económico
        const montoFormateado = resultado.tipo === 'economico' && resultado.monto ? 
            `$${parseFloat(resultado.monto).toLocaleString('es-PA', { minimumFractionDigits: 2 })}` : 'No aplica';
        
        // Generar HTML de la constancia
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Constancia de Entrega - ${resultado.dirigente_nombre}</title>
                <meta charset="UTF-8">
                <style>
                    @page {
                        size: letter;
                        margin: 0.5in;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                        font-size: 14px;
                        padding: 20px;
                    }
                    
                    .container {
                        max-width: 7.5in;
                        margin: 0 auto;
                        border: 2px solid #333;
                        padding: 30px;
                        position: relative;
                    }
                    
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    
                    .logo-section {
                        flex: 1;
                        text-align: left;
                    }
                    
                    .logo {
                        max-width: 120px;
                        max-height: 80px;
                    }
                    
                    .logo-fallback {
                        border: 2px solid #2c3e50;
                        padding: 10px;
                        text-align: center;
                        display: inline-block;
                    }
                    
                    .logo-fallback div:first-child {
                        font-size: 16px;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    
                    .logo-fallback div:last-child {
                        font-size: 12px;
                        color: #666;
                    }
                    
                    .title-section {
                        flex: 2;
                        text-align: center;
                    }
                    
                    .title-section h1 {
                        font-size: 22px;
                        color: #2c3e50;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    .title-section p {
                        font-size: 12px;
                        color: #666;
                    }
                    
                    .document-info {
                        flex: 1;
                        text-align: right;
                    }
                    
                    .document-number {
                        font-size: 14px;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    
                    .document-type {
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .content-section {
                        margin-bottom: 25px;
                    }
                    
                    .section-title {
                        background: #2c3e50;
                        color: white;
                        padding: 8px 12px;
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                    }
                    
                    .info-item {
                        margin-bottom: 10px;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #333;
                        font-size: 12px;
                        margin-bottom: 3px;
                    }
                    
                    .info-value {
                        color: #000;
                        font-size: 13px;
                        padding: 5px 0;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    
                    .details-table th {
                        background: #f8f9fa;
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    
                    .details-table td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        font-size: 12px;
                    }
                    
                    .total-row {
                        background: #e3f2fd;
                        font-weight: bold;
                    }
                    
                    .signatures {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                        margin-top: 60px;
                        padding-top: 20px;
                        border-top: 2px solid #333;
                    }
                    
                    .signature-box {
                        text-align: center;
                    }
                    
                    .signature-line {
                        width: 250px;
                        border-top: 1px solid #000;
                        margin: 30px auto 5px;
                    }
                    
                    .signature-label {
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 5px;
                    }
                    
                    .signature-name {
                        font-size: 12px;
                        margin-top: 3px;
                    }
                    
                    .footer {
                        margin-top: 30px;
                        padding-top: 10px;
                        border-top: 1px solid #ccc;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                    
                    .highlight {
                        background: #fff3cd;
                        padding: 12px;
                        border-left: 4px solid #ffc107;
                        margin: 15px 0;
                        font-size: 12px;
                    }
                    
                    .amount {
                        font-size: 16px;
                        font-weight: bold;
                        color: #27ae60;
                    }
                    
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        
                        .container {
                            border: none;
                            padding: 0;
                            margin: 0;
                        }
                    }
                    
                    @media screen {
                        body {
                            background: #f5f5f5;
                        }
                        
                        .container {
                            background: white;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- ENCABEZADO CON LOGO REAL -->
                    <div class="header">
                        <div class="logo-section">
                            <!-- 🆕 LOGO REAL -->
                            <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='inline-block';">
                            <!-- LOGO DE RESPALDO -->
                            <div id="logo-fallback" class="logo-fallback" style="display: none;">
                                <div>GOBIERNO</div>
                                <div>COMUNITARIO</div>
                            </div>
                        </div>
                        
                        <div class="title-section">
                            <h1>CONSTANCIA DE ENTREGA</h1>
                            <p>Documento Oficial - Sistema de Gestión Comunitaria</p>
                            <p>${new Date().toLocaleDateString('es-PA', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                        </div>
                        
                        <div class="document-info">
                            <div class="document-number">N° AP-${apoyoId.toString().padStart(4, '0')}</div>
                            <div class="document-type">Constancia Válida</div>
                        </div>
                    </div>
                    
                    <!-- INFORMACIÓN DEL BENEFICIARIO -->
                    <div class="content-section">
                        <div class="section-title">INFORMACIÓN DEL BENEFICIARIO</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">NOMBRE COMPLETO:</div>
                                <div class="info-value">${resultado.dirigente_nombre || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">CÉDULA DE IDENTIDAD:</div>
                                <div class="info-value">${resultado.cedula || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">TELÉFONO:</div>
                                <div class="info-value">${resultado.telefono || 'No registrado'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">CORREGIMIENTO:</div>
                                <div class="info-value">${resultado.corregimiento || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">COMUNIDAD:</div>
                                <div class="info-value">${resultado.comunidad || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">COORDINADOR:</div>
                                <div class="info-value">${resultado.coordinador || 'No especificado'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- DETALLES DEL APOYO -->
                    <div class="content-section">
                        <div class="section-title">DETALLES DEL APOYO ENTREGADO</div>
                        
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th width="20%">CONCEPTO</th>
                                    <th width="45%">DESCRIPCIÓN</th>
                                    <th width="15%">FECHA</th>
                                    <th width="20%">VALOR</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="text-transform: uppercase; font-weight: bold;">${resultado.tipo || 'No especificado'}</td>
                                    <td>${resultado.descripcion || 'Apoyo comunitario registrado'}</td>
                                    <td>${new Date(resultado.fecha).toLocaleDateString('es-PA')}</td>
                                    <td class="amount">${montoFormateado}</td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL ENTREGADO:</td>
                                    <td class="amount">${montoFormateado}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- OBSERVACIONES -->
                    <div class="highlight">
                        <strong>OBSERVACIONES:</strong><br>
                        Por medio de la presente se hace constar la entrega del apoyo descrito al dirigente comunitario arriba mencionado. 
                        Este documento es válido como constancia oficial de recepción.
                    </div>
                    
                    <!-- FIRMAS -->
                    <div class="signatures">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">FIRMA DEL DIRIGENTE BENEFICIADO</div>
                            <div class="signature-name">${resultado.dirigente_nombre || '_________________________'}</div>
                            <div class="signature-label">Cédula: ${resultado.cedula || '___________________'}</div>
                        </div>
                        
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">FIRMA DE QUIEN ENTREGA</div>
                            <div class="signature-name">${resultado.colaborador_nombre || '_________________________'}</div>
                            <div class="signature-label">${resultado.colaborador_cargo || 'Colaborador Autorizado'}</div>
                        </div>
                    </div>
                    
                    <!-- PIE DE PÁGINA -->
                    <div class="footer">
                        <p>
                            <strong>Constancia generada automáticamente por el Sistema de Gestión de Dirigentes Comunitarios</strong><br>
                            Fecha de generación: ${new Date().toLocaleDateString('es-PA')} ${new Date().toLocaleTimeString('es-PA')} | 
                            Este documento es una constancia oficial válida
                        </p>
                    </div>
                </div>
                
                <!-- BOTONES SOLO PARA PANTALLA -->
                <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
                    <button onclick="window.print()" style="
                        padding: 12px 24px; 
                        background: #27ae60; 
                        color: white; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        margin: 5px;
                        font-size: 14px;
                        font-weight: bold;
                    ">
                        🖨️ IMPRIMIR CONSTANCIA
                    </button>
                    <button onclick="window.close()" style="
                        padding: 12px 24px; 
                        background: #e74c3c; 
                        color: white; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        margin: 5px;
                        font-size: 14px;
                    ">
                        ❌ CERRAR VENTANA
                    </button>
                    <div style="margin-top: 15px; font-size: 12px; color: #666;">
                        <strong>Consejo:</strong> Para mejor resultado de impresión, use papel tamaño carta (8.5" x 11")
                    </div>
                </div>
                
                <script>
                    // Mostrar logo de respaldo si la imagen no carga
                    setTimeout(() => {
                        const logoImg = document.querySelector('.logo');
                        const logoFallback = document.getElementById('logo-fallback');
                        if (logoImg && logoImg.naturalHeight === 0) {
                            logoImg.style.display = 'none';
                            logoFallback.style.display = 'inline-block';
                        }
                    }, 500);
                    
                    // Auto-imprimir después de 1 segundo
                    setTimeout(() => { 
                        window.print(); 
                    }, 1000);
                </script>
            </body>
            </html>
        `;
        
        res.send(html);
    });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});


// 🆕 RUTAS PARA GESTIÓN DE COLABORADORES

// Crear colaborador
app.post('/api/colaboradores', requireAuth, (req, res) => {
    const { nombre, cedula, cargo } = req.body;
    
    db.run(
        'INSERT INTO colaboradores (nombre, cedula, cargo) VALUES (?, ?, ?)',
        [nombre, cedula, cargo],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear colaborador' });
            }
            res.json({ id: this.lastID, message: 'Colaborador creado exitosamente' });
        }
    );
});

// Actualizar colaborador
app.put('/api/colaboradores/:id', requireAuth, (req, res) => {
    const { nombre, cedula, cargo } = req.body;
    const id = req.params.id;
    
    db.run(
        'UPDATE colaboradores SET nombre = ?, cedula = ?, cargo = ? WHERE id = ?',
        [nombre, cedula, cargo, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar colaborador' });
            }
            res.json({ message: 'Colaborador actualizado exitosamente' });
        }
    );
});

// Desactivar colaborador
app.put('/api/colaboradores/:id/desactivar', requireAuth, (req, res) => {
    const id = req.params.id;
    
    db.run(
        'UPDATE colaboradores SET activo = FALSE WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al desactivar colaborador' });
            }
            res.json({ message: 'Colaborador desactivado exitosamente' });
        }
    );
});

// Activar colaborador
app.put('/api/colaboradores/:id/activar', requireAuth, (req, res) => {
    const id = req.params.id;
    
    db.run(
        'UPDATE colaboradores SET activo = TRUE WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al activar colaborador' });
            }
            res.json({ message: 'Colaborador activado exitosamente' });
        }
    );
});

// 🆕 RUTAS PARA GESTIÓN COMPLETA DE COLABORADORES

// Obtener TODOS los colaboradores (incluyendo inactivos)
app.get('/api/colaboradores/todos', requireAuth, (req, res) => {
    db.all('SELECT * FROM colaboradores ORDER BY nombre', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener colaboradores' });
        }
        res.json(rows);
    });
});

// Crear colaborador
app.post('/api/colaboradores', requireAuth, (req, res) => {
    const { nombre, cedula, cargo } = req.body;
    
    db.run(
        'INSERT INTO colaboradores (nombre, cedula, cargo) VALUES (?, ?, ?)',
        [nombre, cedula, cargo],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear colaborador' });
            }
            res.json({ id: this.lastID, message: 'Colaborador creado exitosamente' });
        }
    );
});

// Actualizar colaborador
app.put('/api/colaboradores/:id', requireAuth, (req, res) => {
    const { nombre, cedula, cargo } = req.body;
    const id = req.params.id;
    
    db.run(
        'UPDATE colaboradores SET nombre = ?, cedula = ?, cargo = ? WHERE id = ?',
        [nombre, cedula, cargo, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar colaborador' });
            }
            res.json({ message: 'Colaborador actualizado exitosamente' });
        }
    );
});

// 🆕 ELIMINAR COLABORADOR PERMANENTEMENTE
app.delete('/api/colaboradores/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    
    // Primero verificar si el colaborador tiene apoyos registrados
    db.get('SELECT COUNT(*) as count FROM apoyos WHERE colaborador_id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar apoyos' });
        }
        
        if (row.count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar el colaborador porque tiene apoyos registrados. Primero elimine o reassigne los apoyos.' 
            });
        }
        
        // Si no tiene apoyos, proceder con la eliminación
        db.run('DELETE FROM colaboradores WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar colaborador' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Colaborador no encontrado' });
            }
            
            res.json({ message: 'Colaborador eliminado permanentemente' });
        });
    });
});








