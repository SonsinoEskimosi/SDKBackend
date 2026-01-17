const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
const oldLogsDir = path.join(logsDir, 'old');
const currentLogFile = path.join(logsDir, 'app.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

if (!fs.existsSync(oldLogsDir)) {
  fs.mkdirSync(oldLogsDir, { recursive: true });
}

if (fs.existsSync(currentLogFile)) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
  const dateStr = timestamp[0];
  const timeStr = timestamp[1].substring(0, 8);
  const archiveName = `app-${dateStr}-${timeStr}.log`;
  const archivePath = path.join(oldLogsDir, archiveName);
  
  fs.renameSync(currentLogFile, archivePath);
  console.log(`Archived old log to: logs/old/${archiveName}`);
} else {
  console.log('No existing log file to archive');
}
