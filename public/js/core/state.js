
export let currentUser = null;
export let activityTypes = [];
export let records = [];
export let language = "en";

export function setCurrentUser(user) {
  currentUser = user;
}

export function setActivityTypes(types) {
  activityTypes = types;
}

export function setRecords(data) {
  records = data;
}

export function setLanguage(value) {
  language = value;
}

