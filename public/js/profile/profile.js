
import { api } from "../core/api.js";

const $ = id => document.getElementById(id);

function initNationalityAutocomplete() {
  const datalist = $("nationalityCountries");

  if (!datalist || datalist.dataset.initialized === "true") return;

  const countryCodes = `
    AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
    BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
    CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
    DE DJ DK DM DO DZ
    EC EE EG EH ER ES ET
    FI FJ FK FM FO FR
    GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
    HK HM HN HR HT HU
    ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
    KE KG KH KI KM KN KP KR KW KY KZ
    LA LB LC LI LK LR LS LT LU LV LY
    MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
    NA NC NE NF NG NI NL NO NP NR NU NZ
    OM
    PA PE PF PG PH PK PL PM PN PR PS PT PW PY
    QA
    RE RO RS RU RW
    SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
    TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
    UA UG UM US UY UZ
    VA VC VE VG VI VN VU
    WF WS
    YE YT
    ZA ZM ZW
    XK
  `;

  const regionNames = new Intl.DisplayNames(["en"], {
    type: "region"
  });

  const countries = countryCodes
    .trim()
    .split(/\s+/)
    .map(code => regionNames.of(code))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  countries.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });

  datalist.dataset.initialized = "true";
}

function initAddressAutocomplete() {
  const input = $("street");
  const suggestions = $("streetSuggestions");

  if (
    !input ||
    !suggestions ||
    input.dataset.initialized === "true"
  ) return;

  input.dataset.initialized = "true";

  let debounceTimer;
  let controller;
  let results = [];

  function clearSuggestions() {
    suggestions.innerHTML = "";
    suggestions.hidden = true;
    results = [];
  }

  function showMessage(message) {
    suggestions.innerHTML = "";

    const item = document.createElement("div");
    item.textContent = message;
    item.style.padding = "12px";
    item.style.fontSize = "12px";
    item.style.color = "var(--muted)";

    suggestions.appendChild(item);
    suggestions.hidden = false;
  }

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    if (controller) controller.abort();

    const query = input.value.trim();

    if (query.length < 3) {
      clearSuggestions();
      return;
    }

    debounceTimer = setTimeout(async () => {
      controller = new AbortController();

      try {
        const url =
          "https://photon.komoot.io/api/?" +
          new URLSearchParams({
            q: query,
            limit: "5",
            lang: "en"
          });

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Address search failed");
        }

        const data = await response.json();
        results = data.features || [];

        if (!results.length) {
          showMessage("No address found.");
          return;
        }

        suggestions.innerHTML = "";

        results.forEach((feature, index) => {
          const p = feature.properties || {};

          const address = [
            p.housenumber,
            p.street || p.name,
            p.postcode,
            p.city || p.town || p.village || p.district,
            p.state,
            p.country
          ].filter(Boolean).join(", ");

          const button = document.createElement("button");
          button.type = "button";
          button.textContent = address || "Unnamed location";

          button.addEventListener("click", () => {
            selectAddress(index);
          });

          suggestions.appendChild(button);
        });

        suggestions.hidden = false;

      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Address autocomplete:", error);
          showMessage("Unable to search addresses.");
        }
      }
    }, 700);
  });

  function selectAddress(index) {
    const feature = results[index];
    if (!feature) return;

    const p = feature.properties || {};

    $("country").value = p.country || "";
    $("state").value = p.state || "";

    $("city").value =
      p.city ||
      p.town ||
      p.village ||
      p.municipality ||
      p.district ||
      "";

    $("postcode").value = p.postcode || "";

    input.value = p.street || p.name || "";

    clearSuggestions();
  }

  document.addEventListener("click", event => {
    if (
      !input.contains(event.target) &&
      !suggestions.contains(event.target)
    ) {
      clearSuggestions();
    }
  });
}

export async function loadProfile() {
  const data = await api("/api/profile");
  const p = data.profile;
  initNationalityAutocomplete();
  initAddressAutocomplete();
  
  $("dob").value = p.date_of_birth || "";
  $("gender").value = p.gender || "";
  $("marital").value = p.marital_status || "";
  $("nationality").value = p.nationality || "";
  $("country").value = p.country || "";
  $("state").value = p.state_province || "";
  $("city").value = p.city_district || "";
  $("postcode").value = p.postcode || "";
  $("street").value = p.street_address || "";
  $("buildingNo").value = p.building_number || "";
  $("buildingName").value = p.building_name || "";
  $("address2").value = p.address_line_2 || "";
    // Employment Information
  $("employmentStatus").value = p.employment_status || "";
  $("employmentType").value = p.employment_type || "";
  $("employmentSector").value = p.employment_sector || "";
  $("occupation").value = p.occupation || "";
  $("employerCompany").value = p.employer_company || "";
  $("department").value = p.department || "";
  $("positionDesignation").value = p.position_designation || "";
  $("workLocation").value = p.work_location || "";
}

