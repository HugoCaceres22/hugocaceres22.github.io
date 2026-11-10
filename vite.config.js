import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{portfolio:resolve(import.meta.dirname,'index.html'),room:resolve(import.meta.dirname,'room/index.html')}}}});
