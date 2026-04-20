import { defineStore } from "pinia";
import bases from "../data/bases.json";
import creamers from "../data/creamers.json";
import syrups from "../data/syrups.json";
import tempretures from "../data/tempretures.json";
import type {
  BaseBeverageType,
  BeverageType,
  CreamerType,
  SyrupType,
} from "../types/beverage";

type BeverageState = {
  temps: string[];
  bases: BaseBeverageType[];
  creamers: CreamerType[];
  syrups: SyrupType[];
  beverageName: string;
  beverages: BeverageType[];
  currentTemp: string;
  currentBase: string;
  currentCreamer: string;
  currentSyrup: string;
};

const defaultBase: BaseBeverageType = {
  id: "",
  name: "",
  color: "#6F4E37",
};

const defaultCreamer: CreamerType = {
  id: "",
  name: "",
  color: "transparent",
};

const defaultSyrup: SyrupType = {
  id: "",
  name: "No Syrup",
  color: "#c6c6c6",
};

export const useBeverageStore = defineStore("BeverageStore", {
  state: (): BeverageState => ({
    temps: [...tempretures],
    bases: [...bases],
    creamers: [...creamers],
    syrups: [...syrups],
    beverageName: "",
    beverages: [],
    currentTemp: tempretures.find((temp) => temp === "Cold") ?? tempretures[0] ?? "",
    currentBase: bases.find((base) => base.name === "Coffee")?.id ?? bases[0]?.id ?? "",
    currentCreamer: creamers[0]?.id ?? "",
    currentSyrup: syrups[0]?.id ?? "",
  }),

  getters: {
    selectedBase: (state): BaseBeverageType =>
      state.bases.find((base) => base.id === state.currentBase) ?? state.bases[0] ?? defaultBase,
    selectedCreamer: (state): CreamerType =>
      state.creamers.find((creamer) => creamer.id === state.currentCreamer) ??
      state.creamers[0] ??
      defaultCreamer,
    selectedSyrup: (state): SyrupType =>
      state.syrups.find((syrup) => syrup.id === state.currentSyrup) ??
      state.syrups[0] ??
      defaultSyrup,
    hasCreamer(): boolean {
      return this.selectedCreamer.color !== "transparent";
    },
    hasSyrup(): boolean {
      return this.selectedSyrup.name !== "No Syrup";
    },
  },

  actions: {
    makeBeverage() {
      const name = this.beverageName.trim() || `Beverage ${this.beverages.length + 1}`;
      const beverage: BeverageType = {
        id: `beverage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        temp: this.currentTemp,
        base: this.selectedBase,
        syrup: this.selectedSyrup,
        creamer: this.selectedCreamer,
      };

      this.beverages.push(beverage);
      this.showBeverage(beverage.id);
    },
    showBeverage(beverageId: string) {
      const beverage = this.beverages.find((savedBeverage) => savedBeverage.id === beverageId);

      if (!beverage) {
        return;
      }

      this.beverageName = beverage.name;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base.id;
      this.currentCreamer = beverage.creamer.id;
      this.currentSyrup = beverage.syrup.id;
    },
  },
  persist: true,
});
