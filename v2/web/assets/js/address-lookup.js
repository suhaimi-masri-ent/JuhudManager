const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

export async function searchAddressSuggestions(query, signal) {
  const searchText = String(query || "").trim();

  if (searchText.length < 3) {
    return [];
  }

  const url = new URL(PHOTON_ENDPOINT);

  url.searchParams.set("q", searchText);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (!response.ok) {
    throw new Error("Address suggestions are temporarily unavailable.");
  }

  const data = await response.json();

  if (!Array.isArray(data.features)) {
    return [];
  }

  return data.features.map(feature => {
    const properties = feature.properties || {};

    return {
      name: properties.name || "",
      housenumber: properties.housenumber || "",
      street: properties.street || "",
      city:
        properties.city ||
        properties.town ||
        properties.village ||
        properties.locality ||
        "",
      state: properties.state || "",
      postcode: properties.postcode || "",
      country: properties.country || "",
      district: properties.district || "",
      displayName: [
        properties.name,
        properties.street,
        properties.city ||
          properties.town ||
          properties.village,
        properties.state,
        properties.country
      ].filter(Boolean).filter((value, index, array) =>
        array.indexOf(value) === index
      ).join(", ")
    };
  }).filter(item => item.displayName);
}
