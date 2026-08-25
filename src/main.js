import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/reference.css'
import './styles/runtime.css'
import { paletteVariables } from './styles/palette.js'

for (const [property, value] of Object.entries(paletteVariables)) {
  document.documentElement.style.setProperty(property, value)
}

createRoot(document.getElementById('app')).render(createElement(App))
