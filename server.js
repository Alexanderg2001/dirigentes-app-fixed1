const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Después de: app.use(session({ ... }));

// Middleware de rate limiting básico
const rateLimit = {};
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/login')) {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimit[ip]) {
      rateLimit[ip] = { count: 1, firstRequest: now };
    } else {
      const timeDiff = now - rateLimit[ip].firstRequest;
      if (timeDiff < 60000) {
        rateLimit[ip].count++;
        if (rateLimit[ip].count > 100) {
          return res.status(429).json({ error: 'Demasiadas solicitudes' });
        }
      } else {
        rateLimit[ip] = { count: 1, firstRequest: now };
      }
    }
  }
  next();
});

// Función de auditoría (agregar después de los middlewares)
const auditar = (tabla, registroId, accion, datosAnteriores, datosNuevos, usuarioId) => {
  db.run(
    'INSERT INTO auditoria (tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
    [tabla, registroId, accion, JSON.stringify(datosAnteriores), JSON.stringify(datosNuevos), usuarioId]
  );
};

// Función de validación
const validarDirigente = (dirigente) => {
  const errores = [];
  
  if (!dirigente.nombre || dirigente.nombre.length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!dirigente.cedula || !/^\d+$/.test(dirigente.cedula)) {
    errores.push('La cédula debe contener solo números');
  }
  
  if (dirigente.telefono && !/^[\d\s\-()+]+$/.test(dirigente.telefono)) {
    errores.push('Formato de teléfono inválido');
  }
  
  return errores;
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'clave-secreta-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

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
      req.session.rol = row.rol; // 🆕 Guardar el rol en sesión
      req.session.isAdmin = row.rol === 'admin'; // 🆕 Definir si es admin
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

// Rutas de la API
app.get('/api/dirigentes', requireAuth, (req, res) => {
  // Obtener los 10 últimos dirigentes ordenados por los más recientes primero
  db.all('SELECT * FROM dirigentes ORDER BY creado_en DESC, id DESC LIMIT 10', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener dirigentes' });
    }
    res.json(rows);
  });
});

app.post('/api/dirigentes', requireAuth, (req, res) => {
  const { nombre, cedula, telefono, corregimiento, comunidad, coordinador } = req.body;
  
  db.run(
    'INSERT INTO dirigentes (nombre, cedula, telefono, corregimiento, comunidad, coordinador) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, cedula, telefono, corregimiento, comunidad, coordinador],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear dirigente' });
      }
      res.json({ id: this.lastID, message: 'Dirigente creado exitosamente' });
    }
  );
});

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

app.delete('/api/dirigentes/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM dirigentes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar dirigente' });
    }
    res.json({ message: 'Dirigente eliminado exitosamente' });
  });
});

// 🆕 RUTA PARA OBTENER TODOS LOS DIRIGENTES (sin límite)
app.get('/api/dirigentes/todos', requireAuth, (req, res) => {
  db.all('SELECT * FROM dirigentes ORDER BY nombre', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener todos los dirigentes' });
    }
    res.json(rows);
  });
});

app.get('/api/buscar-dirigente', (req, res) => {
  const cedula = req.query.cedula;
  
  db.get('SELECT * FROM dirigentes WHERE cedula = ?', [cedula], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la búsqueda' });
    }
    
    if (row) {
      res.json({ encontrado: true, dirigente: row });
    } else {
      res.json({ encontrado: false });
    }
  });
});

// Rutas para apoyos
app.get('/api/apoyos', requireAuth, (req, res) => {
  db.all('SELECT * FROM apoyos', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener apoyos' });
    }
    res.json(rows);
  });
});

app.post('/api/apoyos', requireAuth, (req, res) => {
  const { dirigente_id, tipo, descripcion, monto, } = req.body;
  
  // Obtener fecha en zona horaria local (Panamá)
const ahora = new Date();
const fecha = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  db.run(
    'INSERT INTO apoyos (dirigente_id, tipo, descripcion, monto, fecha) VALUES (?, ?, ?, ?, ?)',
    [dirigente_id, tipo, descripcion, monto || null, fecha],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al registrar apoyo' });
      }
      res.json({ id: this.lastID, message: 'Apoyo registrado exitosamente' });
    }
  );
});

// Ruta para generar constancia
app.get('/constancia/:dirigenteId', requireAuth, (req, res) => {

// ========== 🆕 NUEVAS RUTAS API - AGREGAR DESPUÉS DE constancia ==========

// 1. Dashboard con estadísticas
app.get('/api/estadisticas', requireAuth, (req, res) => {
  const estadisticas = {
    participacion: [],
    apoyos: [],
    totalDirigentes: 0,
    totalApoyos: 0
  };

  // Contar dirigentes por participación
  db.all(`
    SELECT participacion, COUNT(*) as total 
    FROM dirigentes 
    GROUP BY participacion
  `, (err, rows) => {
    if (err) {
      console.log('⚠️  Error en estadísticas de participación, usando valores por defecto');
    } else {
      estadisticas.participacion = rows;
    }

    // Contar apoyos por tipo
    db.all(`
      SELECT tipo, COUNT(*) as total, SUM(monto) as total_monto 
      FROM apoyos 
      GROUP BY tipo
    `, (err, rows) => {
      if (err) {
        console.log('⚠️  Error en estadísticas de apoyos, usando valores por defecto');
      } else {
        estadisticas.apoyos = rows;
      }

      // Total de dirigentes
      db.get('SELECT COUNT(*) as total FROM dirigentes', (err, row) => {
        if (!err && row) {
          estadisticas.totalDirigentes = row.total;
        }

        // Total de apoyos
        db.get('SELECT COUNT(*) as total FROM apoyos', (err, row) => {
          if (!err && row) {
            estadisticas.totalApoyos = row.total;
          }
          
          res.json(estadisticas);
        });
      });
    });
  });
});

// 2. Búsqueda avanzada de dirigentes
app.get('/api/dirigentes/buscar', requireAuth, (req, res) => {
  const { q, corregimiento, participacion, comunidad } = req.query;
  let sql = 'SELECT * FROM dirigentes WHERE 1=1';
  let params = [];

  if (q) {
    sql += ' AND (nombre LIKE ? OR cedula LIKE ? OR coordinador LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (corregimiento) {
    sql += ' AND corregimiento = ?';
    params.push(corregimiento);
  }
  if (participacion) {
    sql += ' AND participacion = ?';
    params.push(participacion);
  }
  if (comunidad) {
    sql += ' AND comunidad LIKE ?';
    params.push(`%${comunidad}%`);
  }

  // Agregar orden y límite para mostrar solo 10 resultados
  sql += ' ORDER BY creado_en DESC, id DESC LIMIT 10';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error en búsqueda avanzada:', err);
      return res.status(500).json({ error: 'Error en la búsqueda' });
    }
    res.json(rows);
  });
});

// 3. Exportar dirigentes a CSV
app.get('/api/exportar/dirigentes', requireAuth, (req, res) => {
  db.all('SELECT * FROM dirigentes ORDER BY corregimiento, comunidad', (err, rows) => {
    if (err) {
      console.error('Error exportando dirigentes:', err);
      return res.status(500).json({ error: 'Error exportando datos' });
    }

    let csv = 'Nombre,Cédula,Teléfono,Corregimiento,Comunidad,Coordinador,Participación\n';
    
    rows.forEach(dirigente => {
      csv += `"${dirigente.nombre}","${dirigente.cedula}","${dirigente.telefono || ''}","${dirigente.corregimiento}","${dirigente.comunidad}","${dirigente.coordinador}","${dirigente.participacion}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dirigentes.csv');
    res.send(csv);
  });
});

// 4. Gestión de notificaciones
app.get('/api/notificaciones', requireAuth, (req, res) => {
  db.all('SELECT * FROM notificaciones WHERE leida = FALSE ORDER BY creado_en DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.log('⚠️  Tabla notificaciones no disponible, devolviendo array vacío');
      return res.json([]);
    }
    res.json(rows);
  });
});

app.post('/api/notificaciones/:id/leer', requireAuth, (req, res) => {
  db.run('UPDATE notificaciones SET leida = TRUE WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.log('⚠️  Tabla notificaciones no disponible');
      return res.json({ message: 'Notificación marcada como leída' });
    }
    res.json({ message: 'Notificación marcada como leída' });
  });
});

// 5. Gestión de corregimientos y comunidades
app.get('/api/corregimientos', requireAuth, (req, res) => {
  db.all('SELECT * FROM corregimientos ORDER BY nombre', (err, rows) => {
    if (err) {
      console.log('⚠️  Tabla corregimientos no disponible, devolviendo array vacío');
      return res.json([]);
    }
    res.json(rows);
  });
});

app.get('/api/comunidades', requireAuth, (req, res) => {
  const { corregimiento_id } = req.query;
  
  if (!corregimiento_id) {
    return res.json([]);
  }
  
  let sql = `
    SELECT c.*, cor.nombre as corregimiento_nombre 
    FROM comunidades c 
    LEFT JOIN corregimientos cor ON c.corregimiento_id = cor.id 
    WHERE c.corregimiento_id = ?
  `;

  db.all(sql, [corregimiento_id], (err, rows) => {
    if (err) {
      console.log('⚠️  Tabla comunidades no disponible, devolviendo array vacío');
      return res.json([]);
    }
    res.json(rows);
  });
});

// ========== FIN NUEVAS RUTAS ==========
  const dirigenteId = req.params.dirigenteId;
  
  db.get('SELECT * FROM dirigentes WHERE id = ?', [dirigenteId], (err, dirigente) => {
    if (err || !dirigente) {
      return res.status(404).send('Dirigente no encontrado');
    }
    
    // Aquí podrías usar un motor de plantillas como EJS para una constancia más elaborada
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

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);

});

// ========== NUEVAS RUTAS - AGREGAR DESPUÉS DE LAS RUTAS EXISTENTES ==========

// Dashboard con estadísticas
app.get('/api/estadisticas', requireAuth, (req, res) => {
  const estadisticas = {};

  // Contar dirigentes por participación
  db.all(`
    SELECT participacion, COUNT(*) as total 
    FROM dirigentes 
    GROUP BY participacion
  `, (err, rows) => {
    if (err) {
      console.error('Error en estadísticas de participación:', err);
      return res.status(500).json({ error: 'Error en estadísticas' });
    }
    
    estadisticas.participacion = rows;

    // Contar apoyos por tipo
    db.all(`
      SELECT tipo, COUNT(*) as total, SUM(monto) as total_monto 
      FROM apoyos 
      GROUP BY tipo
    `, (err, rows) => {
      if (err) {
        console.error('Error en estadísticas de apoyos:', err);
        return res.status(500).json({ error: 'Error en estadísticas' });
      }
      
      estadisticas.apoyos = rows;

      // Total de dirigentes
      db.get('SELECT COUNT(*) as total FROM dirigentes', (err, row) => {
        if (err) {
          console.error('Error contando dirigentes:', err);
          return res.status(500).json({ error: 'Error en estadísticas' });
        }
        
        estadisticas.totalDirigentes = row.total;
        
        // Total de apoyos
        db.get('SELECT COUNT(*) as total FROM apoyos', (err, row) => {
          if (err) {
            console.error('Error contando apoyos:', err);
            return res.status(500).json({ error: 'Error en estadísticas' });
          }
          
          estadisticas.totalApoyos = row.total;
          res.json(estadisticas);
        });
      });
    });
  });
});

// Búsqueda avanzada de dirigentes
app.get('/api/dirigentes/buscar', requireAuth, (req, res) => {
  const { q, corregimiento, participacion, comunidad } = req.query;
  let sql = 'SELECT * FROM dirigentes WHERE 1=1';
  let params = [];

  if (q) {
    sql += ' AND (nombre LIKE ? OR cedula LIKE ? OR coordinador LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (corregimiento) {
    sql += ' AND corregimiento = ?';
    params.push(corregimiento);
  }
  if (participacion) {
    sql += ' AND participacion = ?';
    params.push(participacion);
  }
  if (comunidad) {
    sql += ' AND comunidad LIKE ?';
    params.push(`%${comunidad}%`);
  }

  sql += ' ORDER BY nombre';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error en búsqueda avanzada:', err);
      return res.status(500).json({ error: 'Error en la búsqueda' });
    }
    res.json(rows);
  });
});

// Exportar dirigentes a CSV
app.get('/api/exportar/dirigentes', requireAuth, (req, res) => {
  db.all('SELECT * FROM dirigentes ORDER BY corregimiento, comunidad', (err, rows) => {
    if (err) {
      console.error('Error exportando dirigentes:', err);
      return res.status(500).json({ error: 'Error exportando datos' });
    }

    let csv = 'Nombre,Cédula,Teléfono,Corregimiento,Comunidad,Coordinador,Participación\n';
    
    rows.forEach(dirigente => {
      csv += `"${dirigente.nombre}","${dirigente.cedula}","${dirigente.telefono || ''}","${dirigente.corregimiento}","${dirigente.comunidad}","${dirigente.coordinador}","${dirigente.participacion}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dirigentes.csv');
    res.send(csv);
  });
});

// Gestión de notificaciones
app.get('/api/notificaciones', requireAuth, (req, res) => {
  db.all('SELECT * FROM notificaciones WHERE leida = FALSE ORDER BY creado_en DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.error('Error cargando notificaciones:', err);
      return res.status(500).json({ error: 'Error cargando notificaciones' });
    }
    res.json(rows);
  });
});

app.post('/api/notificaciones/:id/leer', requireAuth, (req, res) => {
  db.run('UPDATE notificaciones SET leida = TRUE WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error actualizando notificación:', err);
      return res.status(500).json({ error: 'Error actualizando notificación' });
    }
    res.json({ message: 'Notificación marcada como leída' });
  });
});

// Gestión de corregimientos y comunidades
app.get('/api/corregimientos', requireAuth, (req, res) => {
  db.all('SELECT * FROM corregimientos ORDER BY nombre', (err, rows) => {
    if (err) {
      console.error('Error cargando corregimientos:', err);
      return res.status(500).json({ error: 'Error cargando corregimientos' });
    }
    res.json(rows);
  });
});

app.get('/api/comunidades', requireAuth, (req, res) => {
  const { corregimiento_id } = req.query;
  let sql = `
    SELECT c.*, cor.nombre as corregimiento_nombre 
    FROM comunidades c 
    LEFT JOIN corregimientos cor ON c.corregimiento_id = cor.id 
    WHERE 1=1
  `;
  let params = [];

  if (corregimiento_id) {
    sql += ' AND c.corregimiento_id = ?';
    params.push(corregimiento_id);
  }

  sql += ' ORDER BY c.nombre';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error cargando comunidades:', err);
      return res.status(500).json({ error: 'Error cargando comunidades' });
    }
    res.json(rows);
  });
});

// Ruta para generar constancia por APOYO INDIVIDUAL
app.get('/constancia-apoyo/:apoyoId', requireAuth, (req, res) => {
  const apoyoId = req.params.apoyoId;
  
  // Obtener datos del apoyo Y del dirigente
  db.get(`
    SELECT a.*, d.nombre as dirigente_nombre, d.cedula, d.telefono, 
           d.corregimiento, d.comunidad, d.coordinador, d.participacion
    FROM apoyos a 
    LEFT JOIN dirigentes d ON a.dirigente_id = d.id 
    WHERE a.id = ?
  `, [apoyoId], (err, resultado) => {
    if (err || !resultado) {
      return res.status(404).send('Apoyo no encontrado');
    }
    
    const { dirigente_nombre, cedula, telefono, corregimiento, comunidad, coordinador, participacion, ...apoyo } = resultado;
    
    // Formatear monto si es apoyo económico
    const montoFormateado = apoyo.tipo === 'economico' && apoyo.monto ? 
      `$${parseFloat(apoyo.monto).toLocaleString('es-PA', { minimumFractionDigits: 2 })}` : 'N/A';
    
    // Generar HTML de la constancia tipo factura
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Constancia de Apoyo - ${dirigente_nombre}</title>
        <meta charset="UTF-8">
        <style>
          /* ESTILOS PARA IMPRESIÓN EN HOJA 8.5" x 11" */
          @page {
            size: letter; /* 8.5" x 11" */
            margin: 0.5in;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.4;
            color: #000;
            background: white;
            font-size: 12px;
          }
          
          .container {
            max-width: 7.5in;
            margin: 0 auto;
            padding: 0.2in;
          }
          
          /* ENCABEZADO TIPO FACTURA */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.3in;
            border-bottom: 2px solid #333;
            padding-bottom: 0.2in;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .logo {
            max-width: 1.5in;
            max-height: 0.8in;
          }
          
          .company-info {
            flex: 2;
            text-align: center;
          }
          
          .company-info h1 {
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .company-info p {
            font-size: 10px;
            color: #666;
            margin: 2px 0;
          }
          
          .document-info {
            flex: 1;
            text-align: right;
          }
          
          .document-number {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .document-type {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          
          /* CUERPO DEL DOCUMENTO */
          .document-body {
            margin: 0.2in 0;
          }
          
          .section {
            margin-bottom: 0.2in;
          }
          
          .section-title {
            background: #2c3e50;
            color: white;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
            border-radius: 3px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .info-item {
            margin-bottom: 8px;
          }
          
          .info-label {
            font-weight: bold;
            color: #333;
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .info-value {
            color: #000;
            font-size: 11px;
            padding: 4px 0;
            border-bottom: 1px solid #eee;
          }
          
          /* TABLA DE DETALLES */
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .details-table th {
            background: #f8f9fa;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            color: #333;
          }
          
          .details-table td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 10px;
          }
          
          .details-table .total-row {
            background: #e3f2fd;
            font-weight: bold;
          }
          
          /* FIRMAS */
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.3in;
            margin-top: 0.4in;
            padding-top: 0.2in;
            border-top: 2px solid #333;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-line {
            width: 3in;
            border-top: 1px solid #000;
            margin: 20px auto 5px;
          }
          
          .signature-label {
            font-size: 10px;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .signature-name {
            font-size: 11px;
            margin-top: 3px;
          }
          
          /* PIE DE PÁGINA */
          .footer {
            margin-top: 0.3in;
            padding-top: 0.1in;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 9px;
            color: #666;
          }
          
          /* ESTILOS ESPECIALES */
          .highlight {
            background: #fff3cd;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin: 10px 0;
          }
          
          .amount {
            font-size: 14px;
            font-weight: bold;
            color: #27ae60;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(0,0,0,0.1);
            z-index: -1;
            pointer-events: none;
          }
          
          /* OCULTAR BOTONES EN IMPRESIÓN */
          @media print {
            .no-print {
              display: none !important;
            }
            
            body {
              margin: 0;
              padding: 0;
            }
            
            .container {
              padding: 0;
            }
          }
          
          /* ESTILOS PARA PANTALLA */
          @media screen {
            body {
              background: #f5f5f5;
              padding: 20px;
            }
            
            .container {
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border-radius: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">CONSTANCIA OFICIAL</div>
        
        <div class="container">
          <!-- ENCABEZADO -->
          <div class="header">
            <div class="logo-section">
              <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'">
              <div style="margin-top: 10px; font-size: 10px; color: #666;">
                <strong>Sistema de Gestión</strong><br>
                Dirigentes Comunitarios
              </div>
            </div>
            
            <div class="company-info">
              <h1>CONSTANCIA DE ENTREGA DE APOYO</h1>
              <p>Documento Oficial - Sistema de Gestión Comunitaria</p>
              <p>${new Date().toLocaleDateString('es-PA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            
            <div class="document-info">
              <div class="document-number">N° AP-${apoyo.id.toString().padStart(4, '0')}</div>
              <div class="document-type">Constancia Válida</div>
            </div>
          </div>
          
          <!-- INFORMACIÓN DEL BENEFICIARIO -->
          <div class="document-body">
            <div class="section">
              <div class="section-title">INFORMACIÓN DEL BENEFICIARIO</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">NOMBRE COMPLETO:</div>
                  <div class="info-value">${dirigente_nombre}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">CÉDULA DE IDENTIDAD:</div>
                  <div class="info-value">${cedula}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">TELÉFONO:</div>
                  <div class="info-value">${telefono || 'No registrado'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">CORREGIMIENTO:</div>
                  <div class="info-value">${corregimiento}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">COMUNIDAD:</div>
                  <div class="info-value">${comunidad}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">COORDINADOR:</div>
                  <div class="info-value">${coordinador}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">NIVEL DE PARTICIPACIÓN:</div>
                  <div class="info-value" style="text-transform: uppercase; font-weight: bold;">
                    ${participacion}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- DETALLES DEL APOYO -->
            <div class="section">
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
                    <td style="text-transform: uppercase; font-weight: bold;">${apoyo.tipo}</td>
                    <td>${apoyo.descripcion || 'Apoyo comunitario registrado'}</td>
                    <td>${new Date(apoyo.fecha).toLocaleDateString('es-PA')}</td>
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
          </div>
          
          <!-- FIRMAS -->
<div class="signatures">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">FIRMA DEL DIRIGENTE BENEFICIADO</div>
    <div class="signature-name">${dirigente_nombre}</div>
    <div class="signature-label">Cédula: ${cedula}</div>
  </div>
  
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">FIRMA DE QUIEN ENTREGA</div>
    <div class="signature-name">_________________________</div>
    <div class="signature-label">Nombre: ___________________</div>
    <div class="signature-label">Cédula: ___________________</div>
    <div class="signature-label">Cargo: Colaborador Autorizado</div>
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
          // Auto-imprimir opcional (descomenta si quieres que se imprima automáticamente)
          // setTimeout(() => { window.print(); }, 1000);
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
});












