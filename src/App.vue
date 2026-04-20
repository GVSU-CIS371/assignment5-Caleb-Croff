<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <div id="auth-area">
      <div v-if="beverageStore.user">
        <span>{{ beverageStore.user.displayName || beverageStore.user.email }}</span>
        <button type="button" @click="signOut">Sign Out</button>
      </div>
      <button v-else type="button" @click="withGoogle">Sign in with Google</button>
    </div>

    <p v-if="message" id="message">{{ message }}</p>

    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="base in beverageStore.bases" :key="base.id">
          <label>
            <input
              type="radio"
              name="base"
              :id="base.id"
              :value="base.id"
              v-model="beverageStore.currentBase"
            />
            {{ base.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="creamer in beverageStore.creamers" :key="creamer.id">
          <label>
            <input
              type="radio"
              name="creamer"
              :id="creamer.id"
              :value="creamer.id"
              v-model="beverageStore.currentCreamer"
            />
            {{ creamer.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="syrup in beverageStore.syrups" :key="syrup.id">
          <label>
            <input
              type="radio"
              name="syrup"
              :id="syrup.id"
              :value="syrup.id"
              v-model="beverageStore.currentSyrup"
            />
            {{ syrup.name }}
          </label>
        </template>
      </li>
    </ul>

    <input
      id="beverage-name"
      v-model="beverageStore.beverageName"
      type="text"
      aria-label="Beverage Name"
      placeholder="Beverage Name"
    />
    <button type="button" :disabled="!beverageStore.user" @click="makeBeverage">Make Beverage</button>

    <div v-if="beverageStore.user && beverageStore.beverages.length" id="beverage-container">
      <template v-for="beverage in beverageStore.beverages" :key="beverage.id">
        <label>
          <input
            type="radio"
            name="saved-beverage"
            :value="beverage.id"
            v-model="beverageStore.selectedBeverageId"
            @change="beverageStore.showBeverage(beverage.id)"
          />
          {{ beverage.name }}
        </label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.ts";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
const message = ref("");

onAuthStateChanged(auth, (user) => {
  beverageStore.setUser(user);
});

async function withGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    message.value = "";
  } catch (err: any) {
    message.value = err.message ?? "Sign-in failed. Please try again.";
  }
}

async function signOut() {
  await firebaseSignOut(auth);
  message.value = "";
}

async function makeBeverage() {
  message.value = await beverageStore.makeBeverage();
}
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
}
</style>
