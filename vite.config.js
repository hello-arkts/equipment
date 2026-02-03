import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(()=>{
  const envSystemCode = 'equipment'
  return {
    base: `/${envSystemCode}/`,
    plugins: [
      vue(),
      tailwindcss(),
    ],
  }
})
