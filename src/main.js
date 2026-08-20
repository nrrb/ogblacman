import { createApp } from 'vue'
import App from './App.vue'
import './styles/reference.css'
import './styles/runtime.css'

document.documentElement.classList.add('w-mod-js', 'w-mod-ix')
document.body.classList.add('body')

createApp(App).mount('#app')
