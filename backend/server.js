const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Compatible con Render

// ✅ CORS dinámico: permite localhost y cualquier dominio *.netlify.app
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (Postman, curl)
    if (!origin) return callback(null, true);

    if (
      origin.includes("localhost") ||         // Desarrollo local
      origin.includes("netlify.app") ||       // Cualquier deploy de Netlify
      origin === "https://beertan-api.onrender.com" // Tu backend (para auto-consumo)
    ) {
      callback(null, true);
    } else {
      console.warn("🚫 CORS bloqueado para origen:", origin);
      callback(new Error("CORS no permitido"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// Middleware
app.use(express.json());

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ RUTA DE PRUEBA (GET)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// ✅ RUTA DEBUG
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
      key: supabaseKey ? 'CONFIGURADA' : 'FALTANTE'
    },
    environment: {
      port: PORT,
      node_env: process.env.NODE_ENV || 'development'
    }
  });
});

// ✅ RUTA PARA OBTENER REPORTES (GET)
app.get('/api/reports', async (req, res) => {
  try {
    console.log('Obteniendo reportes...');
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Reportes obtenidos:', data.length);
    res.json(data);
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ RUTA PARA CREAR REPORTE (POST) - CON UUID Y FECHA
app.post('/api/reports', async (req, res) => {
  try {
    console.log('Creando reporte:', req.body);
    const { tipo, mensaje } = req.body;

    const reporteData = {
      id: uuidv4(),
      tipo,
      mensaje,
      fecha: new Date().toISOString() // 🔑 AÑADIDO: fecha para evitar "Invalid Date"
    };

    const { data, error } = await supabase
      .from('reportes')
      .insert([reporteData]);

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Reporte creado con ID:', reporteData.id);
    res.json({ message: 'Reporte guardado exitosamente', data });
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ RUTA PARA ELIMINAR REPORTE (DELETE)
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Eliminando reporte ID:', id);

    const { error } = await supabase
      .from('reportes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Reporte eliminado');
    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para log de requests
app.use((req, res, next) => {
  console.log('📨 Request recibida:', req.method, req.url);
  next();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('===================================');
  console.log('🚀 Servidor corriendo en http://localhost:' + PORT);
  console.log('===================================');
  console.log('📋 UUID habilitado para IDs seguros');
  console.log('🌐 CORS configurado para Netlify');
  console.log('===================================');
});
