import { createApp } from "vue";
import "./styles/mug.scss";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useBeverageStore } from "./stores/beverageStore";

const pinia = createPinia();
const app = createApp(App).use(pinia);

const store = useBeverageStore();
store.init().then(() => {
  app.mount("#app");
});
