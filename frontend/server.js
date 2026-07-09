const express = require('express');
const path = require('path');
const app = express();

const PORT = 3010;


app.use(express.static(path.join(__dirname, 'public')));


['login', 'admin', 'club', 'student', 'event'].forEach(p => {
  app.get(`/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'public', `${p}.html`)));
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const { exec } = require('child_process');

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`UNIVIBE Frontend Static Server active at: ${url}`);
  
  // Automatically open browser on startup
  const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${startCmd} ${url}`);
});

