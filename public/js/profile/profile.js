
import { api } from "../core/api.js";

const $ = id => document.getElementById(id);

export async function loadProfile() {
  const data = await api("/api/profile");
  const p = data.profile;

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
}

