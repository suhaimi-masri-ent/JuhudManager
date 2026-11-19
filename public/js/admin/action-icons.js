const paths = {
  view: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  activate: '<path d="M12 2v10"/><path d="M5.6 5.6a8.5 8.5 0 1 0 12.8 0"/>',
  deactivate: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6 18.4 18.4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  filter: '<path d="M4 5h16M7 12h10m-7 7h4"/>'
};

export function icon(name) {
  return `<svg class="action-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.view}</svg>`;
}

export function actionButton(name, label, dataAttribute, value) {
  const attribute = dataAttribute
    ? ` ${dataAttribute}="${String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}"`
    : "";
  return `<button type="button" class="action-icon"${attribute} title="${label}" aria-label="${label}">${icon(name)}</button>`;
}
