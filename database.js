const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dirigentes.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de administradores
  db.run(`CREATE TABLE IF NOT EXISTS administradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Tabla de dirigentes
  db.run(`CREATE TABLE IF NOT EXISTS dirigentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    telefono TEXT,
    corregimiento TEXT NOT NULL,
    comunidad TEXT NOT NULL,
    coordinador TEXT NOT NULL,
    participacion TEXT DEFAULT 'regular',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Tabla de apoyos
  db.run(`CREATE TABLE IF NOT EXISTS apoyos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dirigente_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    descripcion TEXT,
    monto DECIMAL(10,2),
    fecha DATE NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dirigente_id) REFERENCES dirigentes (id)
  )`);
  
  // Crear un administrador por defecto (cambiar en producción)
  const adminPassword = 'admin123'; // Cambiar esto en producción
  bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) throw err;
    
    db.run('INSERT OR IGNORE INTO administradores (username, password) VALUES (?, ?)', 
      ['admin', hash], function(err) {
        if (err) {
          console.error('Error creando administrador por defecto:', err);
        } else {
          console.log('Administrador por defecto creado: admin / admin123');
        }
    });
  });
});


module.exports = db;

