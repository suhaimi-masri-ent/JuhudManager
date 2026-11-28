
import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";
const PAGE_SIZE = 50;

let currentPage = 0;
let hasNextPage = false;
let requestSequence = 0;

function getToken() {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearLocalSession() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

function redirectToLogin() {
    window.location.replace("./index.html");
}

function handleSessionError(error) {
    if (
        error.message === "Invalid or expired session." ||
        error.message === "A valid Bearer token is required."
    ) {
        clearLocalSession();
        redirectToLogin();
        return true;
    }

    return false;
}

function createElement(tag, className = "", text = undefined) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined && text !== null) {
        element.textContent = String(text);
    }

    return element;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "medium"
    }).format(date);
}

function formatLabel(value) {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function showNotice(message, type = "success") {
    const notice = $("pageNotice");

    notice.textContent = message;
    notice.className = type === "error"
        ? "notice error"
        : "notice";

    notice.hidden = false;
}

function clearNotice() {
    const notice = $("pageNotice");

    notice.textContent = "";
    notice.hidden = true;
    notice.className = "notice";
}

function setLoading(loading) {
    $("loadingState").hidden = !loading;

    if (loading) {
        $("emptyState").hidden = true;
        $("auditRecordList").replaceChildren();
        $("pagination").hidden = true;
    }
}

function getFilters() {
    return {
        search: $("searchInput").value.trim(),
        action: $("actionFilter").value.trim(),
        entityType: $("entityTypeFilter").value.trim(),
        dateFrom: $("dateFromFilter").value,
        dateTo: $("dateToFilter").value
    };
}

function appendMeta(container, label, value) {
    const paragraph = document.createElement("p");
    const strong = createElement("strong", "", `${label}: `);

    paragraph.append(
        strong,
        document.createTextNode(
            value === null || value === undefined || value === ""
                ? "—"
                : String(value)
        )
    );

    container.appendChild(paragraph);
}

function formatJson(value) {
    if (value === null || value === undefined || value === "") {
        return "No data recorded.";
    }

    if (typeof value !== "string") {
        return JSON.stringify(value, null, 2);
    }

    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

function createJsonPanel(title, value) {
    const panel = createElement("div", "audit-json-panel");
    const heading = createElement("h4", "", title);
    const pre = document.createElement("pre");

    pre.textContent = formatJson(value);

    panel.append(heading, pre);

    return panel;
}

function renderAuditRecord(record) {
    const card = createElement("article", "audit-record");

    const header = createElement("div", "audit-record-header");
    const titleGroup = document.createElement("div");

    titleGroup.appendChild(
        createElement("h3", "", formatLabel(record.action))
    );

    titleGroup.appendChild(
        createElement(
            "span",
            "audit-type",
            `${formatLabel(record.entityType)} · ${record.auditId || "—"}`
        )
    );

    header.append(
        titleGroup,
        createElement("time", "audit-time", formatDate(record.createdAt))
    );

    const meta = createElement("div", "audit-meta");

    appendMeta(
        meta,
        "Actor",
        record.actorName || record.actorUserId
    );

    appendMeta(
        meta,
        "Target",
        record.targetName || record.targetEmail || record.entityId
    );

    appendMeta(meta, "Actor User ID", record.actorUserId);
    appendMeta(meta, "Entity ID", record.entityId);
    appendMeta(meta, "Target Email", record.targetEmail);
    appendMeta(meta, "Country", record.countryId);

    card.append(header, meta);

    if (record.reason) {
        card.appendChild(
            createElement("div", "audit-reason", `Reason: ${record.reason}`)
        );
    }

    const details = createElement("details", "audit-json");
    const summary = createElement(
        "summary",
        "",
        "View Before / After Details"
    );

    const jsonGrid = createElement("div", "audit-json-grid");

    jsonGrid.append(
        createJsonPanel("Before", record.beforeJson),
        createJsonPanel("After", record.afterJson)
    );

    details.append(summary, jsonGrid);
    card.appendChild(details);

    return card;
}

function renderRecords(records, total) {
    const container = $("auditRecordList");
    container.replaceChildren();

    $("loadingState").hidden = true;

    const hasRecords = records.length > 0;

    $("emptyState").hidden = hasRecords;
    $("recordCount").textContent =
        `${total} total record${total === 1 ? "" : "s"}`;

    if (!hasRecords) {
        $("pagination").hidden = true;
        return;
    }

    records.forEach(record => {
        container.appendChild(renderAuditRecord(record));
    });

    renderPagination();
}

function renderPagination() {
    $("pagination").hidden = false;

    $("pageInformation").textContent =
        `Page ${currentPage + 1}`;

    $("previousPageButton").disabled = currentPage === 0;
    $("nextPageButton").disabled = !hasNextPage;
}

async function loadAuditRecords() {
    const sequence = ++requestSequence;

    clearNotice();
    setLoading(true);

    const filters = getFilters();

    if (
        filters.dateFrom &&
        filters.dateTo &&
        filters.dateFrom > filters.dateTo
    ) {
        setLoading(false);
        showNotice(
            "Start date must not be after end date.",
            "error"
        );
        return;
    }

    const params = new URLSearchParams({
        search: filters.search,
        action: filters.action,
        entityType: filters.entityType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        limit: String(PAGE_SIZE),
        offset: String(currentPage * PAGE_SIZE)
    });

    try {
        const result = await apiRequest(
            `/super-admin/audit-trail?${params.toString()}`,
            null,
            getToken()
        );

        if (sequence !== requestSequence) return;

        if (result.readOnly !== true) {
            throw new Error(
                "The server did not confirm read-only audit access."
            );
        }

        const records = Array.isArray(result.records)
            ? result.records
            : [];

        hasNextPage = result.hasMore === true;

        renderRecords(
            records,
            Number(result.total || 0)
        );
    } catch (error) {
        if (sequence !== requestSequence) return;
        if (handleSessionError(error)) return;

        setLoading(false);
        $("emptyState").hidden = true;
        $("pagination").hidden = true;

        showNotice(
            `Unable to load audit records: ${error.message}`,
            "error"
        );
    }
}

function resetFilters() {
    $("filterForm").reset();
    currentPage = 0;
    loadAuditRecords();
}

async function logout() {
    const button = $("logoutButton");
    const token = getToken();

    if (!token) {
        clearLocalSession();
        redirectToLogin();
        return;
    }

    button.disabled = true;
    button.textContent = "Logging out...";

    try {
        await apiRequest("/auth/logout", {}, token);

        clearLocalSession();
        redirectToLogin();
    } catch (error) {
        button.disabled = false;
        button.textContent = "Logout";

        showNotice(
            `Logout could not be completed: ${error.message}`,
            "error"
        );
    }
}

$("filterForm").addEventListener("submit", event => {
    event.preventDefault();
    currentPage = 0;
    loadAuditRecords();
});

$("resetFilterButton").addEventListener("click", resetFilters);
$("refreshButton").addEventListener("click", loadAuditRecords);
$("previousPageButton").addEventListener("click", () => {
    if (currentPage === 0) return;

    currentPage -= 1;
    loadAuditRecords();
});

$("nextPageButton").addEventListener("click", () => {
    if (!hasNextPage) return;

    currentPage += 1;
    loadAuditRecords();
});

$("logoutButton").addEventListener("click", logout);

if (!getToken()) {
    redirectToLogin();
} else {
    loadAuditRecords();
}
