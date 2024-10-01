import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ServerConnection from './lib/ServerConnection';

const server = import.meta.env.VITE_SERVER_URL;
const sc = new ServerConnection(server);
const app = createApp(App);
app.provide('serverConnection', sc);
app.mount('#app');
