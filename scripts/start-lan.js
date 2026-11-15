const os = require('os');
const { spawn } = require('child_process');

function getActiveLanIp() {
  const interfaces = os.networkInterfaces();
  // Prioritize active Wi-Fi / Ethernet adapters
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const lanIp = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || getActiveLanIp();
const isWeb = process.argv.includes('--web');

console.log('\n');
console.log('\x1b[36m╔════════════════════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║\x1b[0m \x1b[1m\x1b[32m       AFFORDZ CUSTOMER MOBILE APP - NETWORK DEV SERVER               \x1b[0m \x1b[36m║\x1b[0m');
console.log('\x1b[36m╠════════════════════════════════════════════════════════════════════════╣\x1b[0m');
console.log(`\x1b[36m║\x1b[0m  \x1b[1m\x1b[33m• Network Link (Web):\x1b[0m      http://${lanIp}:8081                       \x1b[36m║\x1b[0m`);
console.log(`\x1b[36m║\x1b[0m  \x1b[1m\x1b[35m• Metro Bundler (App):\x1b[0m     exp://${lanIp}:8081                        \x1b[36m║\x1b[0m`);
console.log(`\x1b[36m║\x1b[0m  \x1b[1m\x1b[34m• Backend REST API:\x1b[0m        http://${lanIp}:3001                       \x1b[36m║\x1b[0m`);
console.log('\x1b[36m╚════════════════════════════════════════════════════════════════════════╝\x1b[0m\n');

process.env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
if (!process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
  process.env.EXPO_PUBLIC_API_URL = `http://${lanIp}:3001`;
}

const args = ['expo', 'start', '--host', 'lan', '--port', '8081'];
if (isWeb) {
  args.push('--web');
}

const extraArgs = process.argv.slice(2).filter((a) => a !== '--web');
args.push(...extraArgs);

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, args, {
  stdio: 'inherit',
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: lanIp },
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
