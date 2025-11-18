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

// Obtener apoyos
app.get('/api/apoyos', requireAuth, (req, res) => {
  db.all('SELECT * FROM apoyos ORDER BY fecha DESC', (err, rows) => {
    if (err) {
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

// Búsqueda pública de dirigente
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

// 🆕 RUTAS PARA NUEVAS FUNCIONALIDADES

// Estadísticas para el dashboard
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
    if (!err) estadisticas.participacion = rows;

    // Contar apoyos por tipo
    db.all(`
      SELECT tipo, COUNT(*) as total, SUM(monto) as total_monto 
      FROM apoyos 
      GROUP BY tipo
    `, (err, rows) => {
      if (!err) estadisticas.apoyos = rows;

      // Total de dirigentes
      db.get('SELECT COUNT(*) as total FROM dirigentes', (err, row) => {
        if (!err && row) estadisticas.totalDirigentes = row.total;

        // Total de apoyos
        db.get('SELECT COUNT(*) as total FROM apoyos', (err, row) => {
          if (!err && row) estadisticas.totalApoyos = row.total;
          
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

// Ruta para generar constancia de apoyo
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
    if (err || !resultado) {
      return res.status(404).send('Apoyo no encontrado');
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Constancia de Apoyo</title>
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
          <h1>CONSTANCIA DE ENTREGA DE APOYO</h1>
        </div>
        
        <div class="content">
          <p><strong>Dirigente:</strong> ${resultado.dirigente_nombre}</p>
          <p><strong>Cédula:</strong> ${resultado.cedula}</p>
          <p><strong>Tipo de apoyo:</strong> ${resultado.tipo}</p>
          <p><strong>Descripción:</strong> ${resultado.descripcion || 'No especificada'}</p>
          <p><strong>Monto:</strong> ${resultado.monto ? `$${resultado.monto}` : 'No aplica'}</p>
          <p><strong>Fecha:</strong> ${new Date(resultado.fecha).toLocaleDateString()}</p>
          <p><strong>Entregado por:</strong> ${resultado.colaborador_nombre || 'No especificado'}</p>
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
