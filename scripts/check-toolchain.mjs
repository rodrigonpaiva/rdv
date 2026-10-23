const expectedNode = 'v24.22.1';
const expectedNpm = '12.2.1';
const userAgent = process.env.npm_config_user_agent ?? '';
if (process.version !== expectedNode || !userAgent.startsWith(`npm/${expectedNpm} `)) {
  console.error(`Use Node ${expectedNode.slice(1)} and npm ${expectedNpm}. Current: ${process.version}, ${userAgent || 'npm not detected'}.`);
  process.exitCode = 1;
}
