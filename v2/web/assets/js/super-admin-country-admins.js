import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let countries = [];
let assignments = [];
let candidates = [];
let selectedCandidate = null;

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

function showNotice(message, type = "success") {
    const notice = $("pageNotice");
    notice.textContent = message;
    notice.className = type === "error" ? "notice error" : "notice";
    notice.hidden = false;
}

function clearNotice() {
    const notice = $("pageNotice");
    notice.textContent = "";
    notice.hidden = true;
    notice.className = "notice";
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

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);

    return element;
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function selectedCountryId() {
    return $("countrySelect").value;
}

function selectedStatus() {
    return $("statusFilter").value;
}

async function loadCountries() {
    const result = await apiRequest(
        "/super-admin/countries",
        null,
        getToken()
    );

    countries = Array.isArray(result.countries)
        ? result.countries
        : [];

    const select = $("countrySelect");
    const previousValue = select.value;

    select.replaceChildren();

    if (countries.length === 0) {
        select.appendChild(
            createElement("option", "", "No countries available")
        );
        select.disabled = true;
        $("selectedCountryInfo").hidden = true;
        return;
    }

    select.disabled = false;

    countries.forEach(country => {
        const option = createElement(
            "option",
            "",
            `${country.countryName} (${country.countryCode})`
        );

        option.value = country.countryId;
        select.appendChild(option);
    });

    const matchingCountry = countries.find(
        country => country.countryId === previousValue
    );

    select.value = matchingCountry
        ? previousValue
        : countries[0].countryId;

    updateSelectedCountryInfo();
}

function updateSelectedCountryInfo() {
    const country = countries.find(
        item => item.countryId === selectedCountryId()
    );

    if (!country) {
        $("selectedCountryInfo").hidden = true;
        return;
    }

    $("selectedCountryName").textContent =
        `${country.countryName} (${country.countryCode})`;

    $("selectedCountryStatus").textContent =
        `Status: ${country.countryStatus}`;

    $("selectedCountryInfo").hidden = false;

    $("assignSection").hidden = country.countryStatus !== "ACTIVE";

    if (country.countryStatus !== "ACTIVE") {
        clearSelectedCandidate();
        $("candidateResults").replaceChildren();
        $("candidateEmptyState").hidden = true;
    }
}

async function loadAssignments() {
    const countryId = selectedCountryId();

    if (!countryId) {
        assignments = [];
        renderAssignments();
        return;
    }

    const params = new URLSearchParams({
        country: countryId,
        status: selectedStatus()
    });

    const result = await apiRequest(
        `/super-admin/country-admins?${params.toString()}`,
        null,
        getToken()
    );

    assignments = Array.isArray(result.assignments)
        ? result.assignments
        : [];

    renderAssignments();
}

function createStatusBadge(status) {
    const active = status === "ACTIVE";

    return createElement(
        "span",
        `assignment-status ${active ? "active" : "revoked"}`,
        status || "UNKNOWN"
    );
}

function createRevokeButton(assignment) {
    const button = createElement(
        "button",
        "action-button",
        "Revoke"
    );

    button.type = "button";
    button.disabled = assignment.assignmentStatus !== "ACTIVE";

    button.addEventListener("click", () => {
        revokeAssignment(assignment, button);
    });

    return button;
}

function renderAssignments() {
    const body = $("assignmentTableBody");
    const mobile = $("assignmentMobileList");

    body.replaceChildren();
    mobile.replaceChildren();

    $("assignmentCount").textContent =
        `${assignments.length} record${assignments.length === 1 ? "" : "s"}`;

    const hasAssignments = assignments.length > 0;

    $("assignmentEmptyState").hidden = hasAssignments;
    $("assignmentTableWrap").hidden = !hasAssignments;

    assignments.forEach(assignment => {
        const name = assignment.fullName || assignment.userName || "-";
        const email = assignment.email || "-";
        const status = assignment.assignmentStatus || "UNKNOWN";
        const assignedAt = formatDate(assignment.assignedAt);
        const activeCount = Number(assignment.activeCountryCount || 0);

        const row = document.createElement("tr");

        row.append(
            createElement("td", "", name),
            createElement("td", "", email)
        );

        const statusCell = document.createElement("td");
        statusCell.appendChild(createStatusBadge(status));

        row.appendChild(statusCell);
        row.append(
            createElement("td", "", assignedAt),
            createElement("td", "", activeCount)
        );

        const actionCell = document.createElement("td");
        actionCell.appendChild(createRevokeButton(assignment));
        row.appendChild(actionCell);

        body.appendChild(row);

        const card = createElement("article", "assignment-card");
        card.appendChild(createElement("h3", "", name));

        [
            ["Email", email],
            ["Status", status],
            ["Assigned", assignedAt],
            ["Active Countries", activeCount]
        ].forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.appendChild(createElement("span", "", label));
            paragraph.appendChild(createElement("strong", "", value));
            card.appendChild(paragraph);
        });

        card.appendChild(createRevokeButton(assignment));
        mobile.appendChild(card);
    });
}

function renderCandidates() {
    const container = $("candidateResults");
    container.replaceChildren();

    const eligibleCandidates = candidates.filter(
        candidate => candidate.eligible === true
    );

    $("candidateEmptyState").hidden =
        eligibleCandidates.length > 0 || candidates.length > 0;

    candidates.forEach(candidate => {
        const card = createElement("article", "candidate-card");
        const details = createElement("div", "candidate-details");

        details.appendChild(
            createElement(
                "strong",
                "",
                candidate.fullName || candidate.userName || "-"
            )
        );

        details.appendChild(
            createElement("span", "", candidate.email || "-")
        );

        const meta = createElement("div", "candidate-meta");

        meta.appendChild(
            createElement(
                "span",
                "",
                `${Number(candidate.activeCountryCount || 0)} active country assignment(s)`
            )
        );

        if (candidate.hasAdminRole) {
            meta.appendChild(
                createElement("span", "", "ADMIN role already exists")
            );
        }

        if (!candidate.eligible) {
            meta.appendChild(
                createElement("span", "", "Not eligible for this country")
            );
        }

        details.appendChild(meta);
        card.appendChild(details);

        const button = createElement(
            "button",
            "candidate-select-button",
            "Select"
        );

        button.type = "button";
        button.disabled = candidate.eligible !== true;

        button.addEventListener("click", () => {
            selectCandidate(candidate);
        });

        card.appendChild(button);
        container.appendChild(card);
    });

    $("candidateEmptyState").hidden = candidates.length > 0;
}

function selectCandidate(candidate) {
    if (!candidate || candidate.eligible !== true) return;

    selectedCandidate = candidate;

    $("selectedCandidateName").textContent =
        candidate.fullName || candidate.userName || "-";

    $("selectedCandidateEmail").textContent =
        candidate.email || "-";

    $("selectedCandidatePanel").hidden = false;
    $("assignmentForm").hidden = false;
    $("candidateResults").hidden = true;
}

function clearSelectedCandidate() {
    selectedCandidate = null;

    $("selectedCandidatePanel").hidden = true;
    $("assignmentForm").hidden = true;
    $("assignmentReason").value = "";
    $("candidateResults").hidden = false;
}

async function searchCandidates(event) {
    if (event) event.preventDefault();

    clearNotice();

    const countryId = selectedCountryId();

    if (!countryId) {
        showNotice("Please select a country first.", "error");
        return;
    }

    const country = countries.find(
        item => item.countryId === countryId
    );

    if (!country || country.countryStatus !== "ACTIVE") {
        showNotice(
            "Country Admin assignment is only available for active countries.",
            "error"
        );
        return;
    }

    const button = $("searchCandidatesButton");
    button.disabled = true;
    button.textContent = "Searching...";

    try {
        const params = new URLSearchParams({
            country: countryId,
            search: $("candidateSearch").value.trim()
        });

        const result = await apiRequest(
            `/super-admin/country-admins/candidates?${params.toString()}`,
            null,
            getToken()
        );

        candidates = Array.isArray(result.candidates)
            ? result.candidates
            : [];

        clearSelectedCandidate();
        renderCandidates();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to search users: ${error.message}`,
                "error"
            );
        }
    } finally {
        button.disabled = false;
        button.textContent = "Search";
    }
}

async function assignCountryAdmin(event) {
    event.preventDefault();
    clearNotice();

    const countryId = selectedCountryId();
    const reason = $("assignmentReason").value.trim();

    if (!selectedCandidate) {
        showNotice("Please select an eligible user.", "error");
        return;
    }

    if (reason.length < 10 || reason.length > 1000) {
        showNotice(
            "Reason must contain between 10 and 1000 characters.",
            "error"
        );
        $("assignmentReason").focus();
        return;
    }

    const button = $("assignButton");
    button.disabled = true;
    button.textContent = "Processing...";

    try {
        const result = await apiRequest(
            "/super-admin/country-admins",
            {
                userId: selectedCandidate.userId,
                countryId,
                reason
            },
            getToken()
        );

        clearSelectedCandidate();
        $("candidateResults").replaceChildren();
        $("candidateSearch").value = "";
        $("assignmentReason").value = "";

        showNotice(
            result.message || "Country Admin assigned successfully."
        );

        await Promise.all([
            loadAssignments(),
            loadCountries()
        ]);
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to assign Country Admin: ${error.message}`,
                "error"
            );
        }
    } finally {
        button.disabled = false;
        button.textContent = "Confirm Country Admin Appointment";
    }
}

async function revokeAssignment(assignment, button) {
    if (assignment.assignmentStatus !== "ACTIVE") return;

    const reason = window.prompt(
        "Enter the reason for revoking this Country Admin assignment:"
    );

    if (reason === null) return;

    const cleanReason = reason.trim();

    if (cleanReason.length < 10 || cleanReason.length > 1000) {
        showNotice(
            "Revocation reason must contain between 10 and 1000 characters.",
            "error"
        );
        return;
    }

    const confirmed = window.confirm(
        `Confirm revocation of Country Admin assignment for ${assignment.fullName || assignment.email || "this user"}?`
    );

    if (!confirmed) return;

    button.disabled = true;

    try {
        const result = await apiRequest(
            `/super-admin/country-admins/${encodeURIComponent(assignment.assignmentId)}/revoke`,
            {
                reason: cleanReason
            },
            getToken()
        );

        showNotice(
            result.message || "Country Admin assignment revoked successfully."
        );

        await Promise.all([
            loadAssignments(),
            loadCountries()
        ]);
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to revoke assignment: ${error.message}`,
                "error"
            );
        }
    } finally {
        button.disabled = false;
    }
}

async function refreshPage() {
    clearNotice();

    const button = $("refreshButton");
    button.disabled = true;

    try {
        await loadCountries();
        await loadAssignments();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to refresh Country Admin data: ${error.message}`,
                "error"
            );
        }
    } finally {
        button.disabled = false;
    }
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

$("countrySelect").addEventListener("change", async () => {
    clearNotice();
    updateSelectedCountryInfo();
    candidates = [];
    clearSelectedCandidate();
    $("candidateResults").replaceChildren();

    try {
        await loadAssignments();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to load assignments: ${error.message}`,
                "error"
            );
        }
    }
});

$("statusFilter").addEventListener("change", async () => {
    try {
        await loadAssignments();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to load assignments: ${error.message}`,
                "error"
            );
        }
    }
});

$("candidateSearchForm").addEventListener("submit", searchCandidates);
$("assignmentForm").addEventListener("submit", assignCountryAdmin);
$("clearCandidateButton").addEventListener("click", clearSelectedCandidate);
$("refreshButton").addEventListener("click", refreshPage);
$("logoutButton").addEventListener("click", logout);

async function initializePage() {
    if (!getToken()) {
        redirectToLogin();
        return;
    }

    try {
        await loadCountries();
        await loadAssignments();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to initialize Country Admin Management: ${error.message}`,
                "error"
            );
        }
    }
}

initializePage();
