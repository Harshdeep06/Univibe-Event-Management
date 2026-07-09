/**
 * UNIVIBE – Root launcher (optional shortcut)
 * You can also just: cd backend && node server.js
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', 'Starting UNIVIBE Application...');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  console.log('\n\x1b[33mStopping UNIVIBE...\x1b[0m');
  server.kill();
  process.exit();
});
