# Sistema de Gestión de Dirigentes Comunitarios

Una aplicación web para gestionar dirigentes comunitarios, sus datos, participación y apoyos recibidos.

## Características

- **Autenticación de administradores**: Sistema seguro de inicio de sesión
- **Gestión de dirigentes**: Crear, editar, eliminar y visualizar dirigentes
- **Búsqueda pública**: Verificación de dirigentes por cédula
- **Sistema de evaluación**: Clasificación de participación (buena, regular, mala)
- **Registro de apoyos**: Control de apoyos económicos y en víveres
- **Generación de constancias**: Documentos imprimibles para firmar

## Instalación y despliegue

### Requisitos previos

- Node.js (versión 14 o superior)
- Cuenta en Render.com
- Cuenta en GitHub

### Despliegue en Render

1. Crea un repositorio en GitHub y sube todos los archivos
2. Ve a [Render.com](https://render.com) y crea una cuenta o inicia sesión
3. Haz clic en "New" y selecciona "Web Service"
4. Conecta tu repositorio de GitHub
5. En la configuración:
   - **Name**: `dirigentes-app` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Region**: Selecciona la más cercana
   - **Branch**: `main` (o la rama principal)
   - **Root Directory**: (deja en blanco)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Haz clic en "Create Web Service"

### Configuración inicial

Después del despliegue:

1. Accede a tu aplicación (la URL se mostrará en el dashboard de Render)
2. Inicia sesión con las credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

**IMPORTANTE**: Cambia la contraseña del administrador por defecto lo antes posible.

## Uso de la aplicación

### Para administradores

1. **Iniciar sesión**: Usa las credenciales de administrador
2. **Gestionar dirigentes**:
   - Agregar nuevos dirigentes con sus datos completos
   - Editar información existente
   - Evaluar nivel de participación
   - Generar constancias imprimibles
3. **Registrar apoyos**:
   - Apoyos económicos con montos específicos
   - Apoyos en víveres con descripción
   - Otros tipos de apoyo

### Para usuarios públicos

1. **Verificar dirigentes**: 
   - Ingresar número de cédula en el buscador
   - Verificar si la persona es dirigente registrada
   - Consultar información básica y nivel de participación

## Estructura de la base de datos

La aplicación utiliza SQLite y crea automáticamente las siguientes tablas:

- **administradores**: Usuarios con acceso al panel de administración
- **dirigentes**: Información de los dirigentes comunitarios
- **apoyos**: Registro de apoyos proporcionados a dirigentes

## Personalización

Puedes personalizar la aplicación modificando:

- Los estilos en `public/styles.css`
- Las opciones de evaluación de participación en el código
- Los tipos de apoyo disponibles
- El diseño de las constancias

## Seguridad

- Las contraseñas se almacenan con hash bcrypt
- Sesiones con expiración automática
- Validación de datos en frontend y backend

## Soporte

Si tienes problemas con la aplicación, revisa los logs en el dashboard de Render o contacta al desarrollador.