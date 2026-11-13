
import {
  initTakazaCategories,
  loadTakazaCategories
} from "./takaza-categories.js";

import {
  initTakazaRegistration,
  loadTakazaRegistration
} from "./takaza-registration.js";


let initialized = false;


/* =========================
   INITIALIZE TAKAZA MANAGER
========================= */

export function initTakazaManager() {

  if (initialized) return;

  initialized = true;

  initTakazaCategories();
  initTakazaRegistration();

  console.log("Takaza Manager initialized.");
}


/* =========================
   LOAD TAKAZA MANAGEMENT
========================= */

export async function loadTakazaManager() {

  await Promise.all([
    loadTakazaCategories(),
    loadTakazaRegistration()
  ]);

}
