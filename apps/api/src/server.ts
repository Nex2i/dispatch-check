import { createApp } from './app.js';
const app = await createApp();
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT || 10000) });
for (const signal of ['SIGTERM','SIGINT']) process.once(signal, async () => { await app.close(); process.exit(0); });
