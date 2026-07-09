const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const dotenv       = require('dotenv');
const fs           = require('fs');
const path         = require('path');
const { exec }     = require('child_process');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config();
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ─── Uploads directory ───────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── Serve static frontend from /public ──────────────────────────────────────
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// ─── API Routes ───────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const clubRoutes    = require('./routes/clubRoutes');
const eventRoutes   = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/clubs',    clubRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/students', studentRoutes);

// ─── Page routes – serve HTML files ──────────────────────────────────────────
const page = (name) => (_, res) => res.sendFile(path.join(publicDir, `${name}.html`));
app.get('/login',   page('login'));
app.get('/admin',   page('admin'));
app.get('/club',    page('club'));
app.get('/student', page('student'));
app.get('/event',   page('event'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'OK', message: 'UNIVIBE is healthy' }));

// ─── Fallback: serve index.html for any unknown route ────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(publicDir, 'index.html')));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\x1b[32m✓ UNIVIBE running at: ${url}\x1b[0m`);
  console.log(`  API  → ${url}/api`);
  console.log(`  Mode → ${process.env.NODE_ENV || 'development'}`);
  if (process.env.AUTO_OPEN !== 'false') {
    const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${cmd} ${url}`);
  }
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled error: ${err.message}`);
  server.close(() => process.exit(1));
});
