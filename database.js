const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// En producción, usar path persistente si está disponible
let dbPath;

if (process.env.NODE_ENV === 'production') {
    // En Render con disk, usar esta ruta:
    dbPath = '/opt/render/project/src/data/dirigentes.db';
} else {
    dbPath = path.join(__dirname, 'dirigentes.db');
}

// Asegurarse de que el directorio existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Directorio de BD creado:', dbDir);
}

const db = new sqlite3.Database(dbPath);

// Función segura para crear tablas si no existen
function inicializarTablas() {
    console.log('🔄 Verificando estructura de la base de datos...');
    
    const tablas = [
        // 🆕 MODIFICADA tabla de administradores con rol
        `CREATE TABLE IF NOT EXISTS administradores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT DEFAULT 'admin',
            activo BOOLEAN DEFAULT TRUE,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS dirigentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cedula TEXT UNIQUE NOT NULL,
            telefono TEXT,
            corregimiento TEXT NOT NULL,
            comunidad TEXT NOT NULL,
            coordinador TEXT NOT NULL,
            participacion TEXT DEFAULT 'regular',
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS apoyos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dirigente_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            descripcion TEXT,
            monto DECIMAL(10,2),
            fecha DATE NOT NULL,
            colaborador_id INTEGER,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dirigente_id) REFERENCES dirigentes (id),
            FOREIGN KEY (colaborador_id) REFERENCES colaboradores (id)
        )`,
        
        // 🆕 NUEVA tabla de colaboradores
        `CREATE TABLE IF NOT EXISTS colaboradores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cedula TEXT NOT NULL,
            cargo TEXT NOT NULL,
            activo BOOLEAN DEFAULT TRUE,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS notificaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            tipo TEXT DEFAULT 'info',
            leida BOOLEAN DEFAULT FALSE,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS corregimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL
        )`,
        
        `CREATE TABLE IF NOT EXISTS comunidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            corregimiento_id INTEGER,
            FOREIGN KEY (corregimiento_id) REFERENCES corregimientos (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tabla_afectada TEXT NOT NULL,
            registro_id INTEGER,
            accion TEXT NOT NULL,
            datos_anteriores TEXT,
            datos_nuevos TEXT,
            usuario_id INTEGER,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    // Crear tablas una por una
    let tablasCreadas = 0;
    tablas.forEach((sql, index) => {
        db.run(sql, function(err) {
            if (err) {
                console.error(`❌ Error creando tabla ${index + 1}:`, err.message);
            } else {
                tablasCreadas++;
                console.log(`✅ Tabla ${index + 1} verificada/creada`);
            }
            
            // Cuando todas las tablas estén procesadas
            if (index === tablas.length - 1) {
                console.log(`🎉 Base de datos inicializada: ${tablasCreadas}/${tablas.length} tablas listas`);
                insertarDatosIniciales();
            }
        });
    });
}

// Función para insertar datos iniciales SOLO si no existen
function insertarDatosIniciales() {
    // Verificar si existe el administrador
    db.get('SELECT COUNT(*) as count FROM administradores WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
            console.log('⚠️  No se pudo verificar administrador:', err.message);
            return;
        }
        
        if (row.count === 0) {
            const adminPassword = 'admin123';
            bcrypt.hash(adminPassword, 10, (err, hash) => {
                if (err) {
                    console.error('❌ Error hashing password:', err);
                    return;
                }
                
                db.run('INSERT INTO administradores (username, password, rol) VALUES (?, ?, ?)', 
                    ['admin', hash, 'admin'], function(err) {
                    if (err) {
                        console.error('❌ Error creando administrador:', err.message);
                    } else {
                        console.log('👤 Administrador por defecto creado: admin / admin123');
                    }
                });
            });
        } else {
            console.log('👤 Administrador ya existe, omitiendo creación');
        }
    });

    // Insertar colaboradores de ejemplo
    db.get('SELECT COUNT(*) as count FROM colaboradores', (err, row) => {
        if (err) {
            console.log('⚠️  Tabla colaboradores no disponible aún:', err.message);
            return;
        }
        
        if (row.count === 0) {
            const colaboradores = [
                { nombre: 'Ana Pérez', cedula: '8-123-456', cargo: 'Asistente Social' },
                { nombre: 'Carlos Rodríguez', cedula: '8-234-567', cargo: 'Coordinador de Campo' },
                { nombre: 'María González', cedula: '8-345-678', cargo: 'Trabajadora Social' },
                { nombre: 'José Martínez', cedula: '8-456-789', cargo: 'Promotor Comunitario' }
            ];
            
            let insertados = 0;
            colaboradores.forEach(colab => {
                db.run('INSERT INTO colaboradores (nombre, cedula, cargo) VALUES (?, ?, ?)', 
                    [colab.nombre, colab.cedula, colab.cargo], function(err) {
                    if (err) {
                        console.error(`❌ Error insertando colaborador ${colab.nombre}:`, err.message);
                    } else {
                        insertados++;
                        console.log(`✅ Colaborador "${colab.nombre}" insertado`);
                    }
                    
                    if (insertados === colaboradores.length) {
                        console.log(`🎉 ${insertados} colaboradores insertados exitosamente`);
                    }
                });
            });
        } else {
            console.log(`👥 Ya existen ${row.count} colaboradores, omitiendo inserción`);
        }
    });

    // Crear usuario colaborador de ejemplo
    setTimeout(() => {
        db.get('SELECT COUNT(*) as count FROM administradores WHERE username = ?', ['colaborador'], (err, row) => {
            if (err) {
                console.log('⚠️  No se pudo verificar usuario colaborador:', err.message);
                return;
            }
            
            if (row.count === 0) {
                bcrypt.hash('colab123', 10, (err, hash) => {
                    if (err) {
                        console.error('❌ Error hashing password colaborador:', err);
                        return;
                    }
                    db.run('INSERT INTO administradores (username, password, rol) VALUES (?, ?, ?)', 
                        ['colaborador', hash, 'colaborador'], function(err) {
                        if (err) {
                            console.log('⚠️  Error creando usuario colaborador:', err.message);
                        } else {
                            console.log('👤 Usuario colaborador creado: colaborador / colab123');
                        }
                    });
                });
            } else {
                console.log('👤 Usuario colaborador ya existe, omitiendo creación');
            }
        });
    }, 1000);
    
    // Verificar y insertar corregimientos SOLO si la tabla está vacía
    db.get('SELECT COUNT(*) as count FROM corregimientos', (err, row) => {
        if (err) {
            console.log('⚠️  No se pudo verificar corregimientos:', err.message);
            return;
        }
        
        if (row.count === 0) {
            console.log('🏘️  Insertando corregimientos por defecto...');
            const corregimientosDefault = ['San Francisco', 'El Valle', 'Bethania', 'Pacora', 'Tocumen'];
            
            let insertados = 0;
            corregimientosDefault.forEach(nombre => {
                db.run('INSERT INTO corregimientos (nombre) VALUES (?)', [nombre], function(err) {
                    if (err) {
                        console.error(`❌ Error insertando corregimiento ${nombre}:`, err.message);
                    } else {
                        insertados++;
                        console.log(`✅ Corregimiento "${nombre}" insertado`);
                    }
                    
                    if (insertados === corregimientosDefault.length) {
                        console.log(`🎉 ${insertados} corregimientos insertados exitosamente`);
                    }
                });
            });
        } else {
            console.log(`🏘️  Ya existen ${row.count} corregimientos, omitiendo inserción`);
        }
    });
}

// 🆕 FUNCIÓN PARA ACTUALIZAR TABLAS EXISTENTES (VERSIÓN SIMPLIFICADA Y SEGURA)
function actualizarTablasExistente() {
    console.log('🔄 Verificando actualizaciones de tablas existentes...');
    
    // Intentar agregar columnas directamente (si falla, es porque ya existen)
    db.run("ALTER TABLE administradores ADD COLUMN rol TEXT DEFAULT 'admin'", (err) => {
        if (err) {
            console.log('✅ Columna "rol" ya existe en administradores');
        } else {
            console.log('✅ Columna "rol" agregada a tabla administradores');
            // Actualizar administrador existente
            db.run("UPDATE administradores SET rol = 'admin' WHERE username = 'admin'", (err) => {
                if (err) {
                    console.log('⚠️  No se pudo actualizar administrador:', err.message);
                } else {
                    console.log('✅ Administrador actualizado con rol "admin"');
                }
            });
        }
    });

    setTimeout(() => {
        db.run("ALTER TABLE administradores ADD COLUMN activo BOOLEAN DEFAULT TRUE", (err) => {
            if (err) {
                console.log('✅ Columna "activo" ya existe en administradores');
            } else {
                console.log('✅ Columna "activo" agregada a tabla administradores');
            }
        });
    }, 100);

    setTimeout(() => {
        db.run("ALTER TABLE apoyos ADD COLUMN colaborador_id INTEGER", (err) => {
            if (err) {
                console.log('✅ Columna "colaborador_id" ya existe en apoyos');
            } else {
                console.log('✅ Columna "colaborador_id" agregada a tabla apoyos');
            }
        });
    }, 200);
}

// Inicializar la base de datos cuando se conecte
db.on('open', () => {
    console.log('🔗 Conectado a la base de datos:', dbPath);
    inicializarTablas();
    actualizarTablasExistente(); // 🆕 Agregar esta línea
});

db.on('error', (err) => {
    console.error('❌ Error de base de datos:', err);
});

module.exports = db;
