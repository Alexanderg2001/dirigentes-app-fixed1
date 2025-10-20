const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

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
  
  db.get('SELECT * FROM administradores WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
    
    if (row && await bcrypt.compare(password, row.password)) {
      req.session.userId = row.id;
      req.session.isAdmin = true;
      res.json({ success: true });
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
  db.all('SELECT * FROM dirigentes', (err, rows) => {
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
    [nombre, cedula, corregimiento, comunidad, coordinador, participacion, id],
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
  const { dirigente_id, tipo, descripcion, monto, fecha } = req.body;
  
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
