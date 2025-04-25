// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { LucideAArrowDown } from 'lucide-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['Lucide-react']
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { LucideAArrowDown } from 'lucide-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['Lucide-react']
  },
  define: {
    'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
  }
})

