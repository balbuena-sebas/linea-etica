const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS más específico y con mejor logging
const corsOptions = {
  origin: (origin, callback) => {
    console.log('🌐 Origen de la petición:', origin);
    
    // Permitir peticiones sin origen (Postman, curl, apps móviles)
    if (!origin) return callback(null, true);

    // Lista de dominios permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5500', // Live Server
      'https://beertan-api.onrender.com'
    ];

    // Verificar si el origen contiene netlify.app
    const isNetlifyApp = origin.includes('.netlify.app');
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowedOrigin = allowedOrigins.includes(origin);

    if (isNetlifyApp || isLocalhost || isAllowedOrigin) {
      console.log('✅ CORS permitido para:', origin);
      callback(null, true);
    } else {
      console.warn('🚫 CORS bloqueado para origen:', origin);
      callback(new Error(`CORS no permitido para origen: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Middleware
app.use(express.json());

// Configurar Supabase con validación
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Falta configuración de Supabase');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'FALTA');
  console.error('SUPABASE_KEY:', supabaseKey ? 'Configurada' : 'FALTA');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ RUTA DE PRUEBA (GET)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    cors: 'Configurado para Netlify y localhost'
  });
});

// ✅ RUTA DEBUG CON MÁS INFORMACIÓN
app.get('/api/debug', (req, res) => {
  res.json({
    routes: [
      'GET /api/health',
      'GET /api/reports',
      'POST /api/reports',
      'DELETE /api/reports/:id'
    ],
    supabase: {
      url: supabaseUrl ? 'CONFIGURADA' : 'FALTANTE',
      key: supabaseKey ? 'CONFIGURADA (oculta)' : 'FALTANTE'
    },
    environment: {
      port: PORT,
      node_env: process.env.NODE_ENV || 'development'
    },
    cors: {
      enabled: true,
      allowsNetlify: true,
      allowsLocalhost: true
    },
    headers: req.headers
  });
});

// ✅ RUTA PARA OBTENER REPORTES (GET)
app.get('/api/reports', async (req, res) => {
  try {
    console.log('📋 Obteniendo reportes...');
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Reportes obtenidos: ${data.length}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ RUTA PARA CREAR REPORTE (POST)
app.post('/api/reports', async (req, res) => {
  try {
    console.log('📝 Creando reporte:', req.body);
    const { tipo, mensaje } = req.body;

    // Validar datos de entrada
    if (!tipo || !mensaje) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: tipo y mensaje son obligatorios' 
      });
    }

    const reporteData = {
      id: uuidv4(),
      tipo,
      mensaje,
      fecha: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reportes')
      .insert([reporteData])
      .select(); // Agregar select() para obtener los datos insertados

    if (error) {
      console.error('❌ Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Reporte creado con ID:', reporteData.id);
    res.json({ message: 'Reporte guardado exitosamente', data });
  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ RUTA PARA ELIMINAR REPORTE (DELETE)
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando reporte ID:', id);

    if (!id) {
      return res.status(400).json({ error: 'ID de reporte requerido' });
    }

    const { error } = await supabase
      .from('reportes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Reporte eliminado');
    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta raíz para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    message: 'Beer Tan API funcionando correctamente',
    status: 'OK',
    endpoints: [
      'GET /api/health - Estado del servidor',
      'GET /api/debug - Información de debug',
      'GET /api/reports - Obtener reportes',
      'POST /api/reports - Crear reporte',
      'DELETE /api/reports/:id - Eliminar reporte'
    ],
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    availableRoutes: ['/', '/api/health', '/api/debug', '/api/reports']
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('===================================');
  console.log('🚀 Servidor corriendo en puerto:', PORT);
  console.log('🌐 URL:', `https://beertan-api.onrender.com`);
  console.log('===================================');
  console.log('📋 UUID habilitado para IDs seguros');
  console.log('🌍 CORS configurado para Netlify y localhost');
  console.log('🔗 Supabase conectado');
  console.log('===================================');
});
