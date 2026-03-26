// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index'; // Make sure this path is correct

const app = createApp(App);

app.use(router); // ✅ This is necessary!
app.mount('#app');