import { createApi } from './bootstrap.js';

const app = await createApi();
await app.listen(3001, '127.0.0.1');
console.log('API listening on http://127.0.0.1:3001');
