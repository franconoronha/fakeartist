import VueSocketIOExt from 'vue-socket.io-extended'
import { createApp } from 'vue'
import { io } from 'socket.io-client'
import App from './App.vue'

import './main.scss' // CSS Global

const socket = io('http://localhost:3000')
const app = createApp(App)
app.use(VueSocketIOExt, socket)

app.mount('#app')