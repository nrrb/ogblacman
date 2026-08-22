import { createApp } from 'vue'
import App from './App.vue'
import './styles/reference.css'
import './styles/runtime.css'
import { paletteVariables } from './styles/palette.js'

for (const [property, value] of Object.entries(paletteVariables)) {
  document.documentElement.style.setProperty(property, value)
}

createApp(App).mount('#app')
