const { spawn } = require('child_process');

const processes = [];

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] stopped with signal ${signal}`);
    } else {
      console.log(`[${name}] exited with code ${code}`);
    }
  });

  processes.push(child);
  return child;
}

const backend = startProcess('backend', 'npm', ['run', 'dev'], '.');
const frontend = startProcess('frontend', 'npm', ['run', 'dev'], '..\\frontend');
const fastapiPython = 'C:/Users/ss/Desktop/skn/.venv/Scripts/python.exe';
const fastapi = startProcess('fastapi', fastapiPython, ['-m', 'uvicorn', 'model.app:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], '..');

function shutdown() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backend.on('close', (code) => {
  if (code !== 0) {
    shutdown();
  }
});

frontend.on('close', (code) => {
  if (code !== 0) {
    shutdown();
  }
});

fastapi.on('close', (code) => {
  if (code !== 0) {
    shutdown();
  }
});