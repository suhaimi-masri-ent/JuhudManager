
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


export async function loadProfile() {
  const data = await api("/api/profile");
  const p = data.profile;
  initNationalityAutocomplete();
  
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

