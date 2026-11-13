
import {
  initTakazaCategories,
  loadTakazaCategories
} from "./takaza-categories.js";


let initialized = false;


/* =========================
   INITIALIZE TAKAZA MANAGER
========================= */

export function initTakazaManager() {

  if (initialized) return;

  initialized = true;

  // Initialize Takaza Categories module
  initTakazaCategories();

  console.log("Takaza Manager initialized.");
}


/* =========================
   LOAD TAKAZA MANAGEMENT
========================= */

export async function loadTakazaManager() {

  await loadTakazaCategories();

}

