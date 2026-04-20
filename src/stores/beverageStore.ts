import { defineStore } from "pinia";
import tempretures from "../data/tempretures.json";
import { db } from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type {
  BaseBeverageType,
  BeverageType,
  CreamerType,
  SyrupType,
} from "../types/beverage";

let unsubscribeBeverages: (() => void) | null = null;

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: [...tempretures] as string[],
    bases: [] as BaseBeverageType[],
    creamers: [] as CreamerType[],
    syrups: [] as SyrupType[],
    beverageName: "",
    beverages: [] as BeverageType[],
    currentTemp: tempretures.find((t) => t === "Cold") ?? tempretures[0] ?? "",
    currentBase: "" as string,
    currentCreamer: "" as string,
    currentSyrup: "" as string,
    selectedBeverageId: "" as string,
    user: null as User | null,
  }),

  getters: {
    selectedBase: (state): BaseBeverageType =>
      state.bases.find((base) => base.id === state.currentBase) ?? state.bases[0] ?? { id: "", name: "", color: "#6F4E37" },
    selectedCreamer: (state): CreamerType =>
      state.creamers.find((c) => c.id === state.currentCreamer) ?? state.creamers[0] ?? { id: "", name: "", color: "transparent" },
    selectedSyrup: (state): SyrupType =>
      state.syrups.find((s) => s.id === state.currentSyrup) ?? state.syrups[0] ?? { id: "", name: "No Syrup", color: "#c6c6c6" },
    hasCreamer(): boolean {
      return this.selectedCreamer.color !== "transparent";
    },
    hasSyrup(): boolean {
      return this.selectedSyrup.name !== "No Syrup";
    },
  },

  actions: {
    async init() {
      const [basesSnap, creamersSnap, syrupsSnap] = await Promise.all([
        getDocs(collection(db, "bases")),
        getDocs(collection(db, "creamers")),
        getDocs(collection(db, "syrups")),
      ]);

      this.bases = basesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BaseBeverageType));
      this.creamers = creamersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CreamerType));
      this.syrups = syrupsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SyrupType));

      this.currentBase = this.bases.find((b) => b.name === "Coffee")?.id ?? this.bases[0]?.id ?? "";
      this.currentCreamer = this.creamers[0]?.id ?? "";
      this.currentSyrup = this.syrups[0]?.id ?? "";
    },

    setUser(user: User | null) {
      this.user = user;

      if (unsubscribeBeverages) {
        unsubscribeBeverages();
        unsubscribeBeverages = null;
      }

      if (!user) {
        this.beverages = [];
        this.selectedBeverageId = "";
        return;
      }

      const q = query(collection(db, "beverages"), where("userId", "==", user.uid));
      unsubscribeBeverages = onSnapshot(q, (snapshot) => {
        this.beverages = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name,
            temp: data.temp,
            base: data.base,
            syrup: data.syrup,
            creamer: data.creamer,
          } as BeverageType;
        });

        const stillExists = this.beverages.some((b) => b.id === this.selectedBeverageId);
        if (!stillExists) {
          this.selectedBeverageId = this.beverages[0]?.id ?? "";
          if (this.selectedBeverageId) this.showBeverage(this.selectedBeverageId);
        }
      });
    },

    async makeBeverage(): Promise<string> {
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      if (!this.beverageName.trim() || !this.currentBase || !this.currentCreamer || !this.currentSyrup) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const id = `beverage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const name = this.beverageName.trim();
      const beverage: BeverageType = {
        id,
        name,
        temp: this.currentTemp,
        base: this.selectedBase,
        syrup: this.selectedSyrup,
        creamer: this.selectedCreamer,
      };

      this.beverages.push(beverage);
      this.selectedBeverageId = id;

      await setDoc(doc(db, "beverages", id), {
        ...beverage,
        userId: this.user.uid,
      });

      return `Beverage ${name} made successfully!`;
    },

    showBeverage(beverageId: string) {
      const beverage = this.beverages.find((b) => b.id === beverageId);
      if (!beverage) return;

      this.beverageName = beverage.name;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base.id;
      this.currentCreamer = beverage.creamer.id;
      this.currentSyrup = beverage.syrup.id;
    },
  },
});
