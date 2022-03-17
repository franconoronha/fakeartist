import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
/* import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client' */

/* createApp(App).mount('#app') */

const app = createApp(App)
/* app.use(new VueSocketIO({
    debug: true,
    connection: SocketIO('http://localhost:3000'),
  })
); */

app.mount('#app')