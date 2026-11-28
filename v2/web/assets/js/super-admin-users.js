import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";
const PAGE_SIZE = 50;
const ACTIVITY_PAGE_SIZE = 50;

let currentUserId = null;
let users = [];
let currentUser = null;
let currentPage = 0;
let activityPage = 0;
let selectedUserId = null;
let hasNextPage = false;
let hasNextActivityPage = false;

let listRequestSequence = 0;
let detailRequestSequence = 0;
let activityRequestSequence = 0;

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

function formatStatus(value) {
    if (!value || typeof value !== "string") {
        return "—";
    }

    return value
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
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

function showDetailNotice(message, type = "success") {
    const notice = $("detailNotice");

    notice.textContent = message;
    notice.className = type === "error"
        ? "notice error"
        : "notice";

    notice.hidden = false;
}

function clearDetailNotice() {
    const notice = $("detailNotice");

    notice.textContent = "";
    notice.hidden = true;
    notice.className = "notice";
}

function getFilterValues() {
    return {
        search: $("searchInput").value.trim(),
        role: $("roleFilter").value,
        accountStatus: $("accountStatusFilter").value,
        registrationStatus: $("registrationStatusFilter").value
    };
}

function setLoadingState(loading) {
    $("loadingState").hidden = !loading;
    $("userTableWrap").hidden = loading;
    $("emptyState").hidden = true;
    $("userMobileList").replaceChildren();
}

function createBadge(value, type) {
    const normalized = String(value || "").toUpperCase();

    let className = "status-neutral";

    if (type === "role") {
        if (normalized === "SUPER_ADMIN") {
            className = "role-super-admin";
        } else if (normalized === "ADMIN") {
            className = "role-admin";
        } else if (normalized === "AHBAB") {
            className = "role-ahbab";
        } else {
            className = "role-none";
        }

        return createElement(
            "span",
            `role-badge ${className}`,
            formatStatus(normalized)
        );
    }

    if (normalized === "ACTIVE" || normalized === "APPROVED") {
        className = "status-active";
    } else if (normalized === "DISABLED") {
        className = "status-disabled";
    } else if (
        normalized === "SUSPENDED" ||
        normalized === "REJECTED" ||
        normalized === "CANCELLED"
    ) {
        className = "status-suspended";
    } else if (
        normalized === "PENDING_REVIEW" ||
        normalized === "AWAITING_EMAIL_VERIFICATION"
    ) {
        className = "status-pending";
    }

    return createElement(
        "span",
        `status-badge ${className}`,
        formatStatus(normalized)
    );
}

function createActionButton(label, callback) {
    const button = createElement("button", "action-button", label);

    button.type = "button";
    button.addEventListener("click", callback);

    return button;
}

function renderUserRoles(container, roles) {
    container.replaceChildren();

    if (!Array.isArray(roles) || roles.length === 0) {
        container.appendChild(createBadge("NO_ROLE", "role"));
        return;
    }

    roles.forEach(role => {
        const roleCode = typeof role === "string"
            ? role
            : role?.role_code || role?.roleCode;

        if (roleCode) {
            container.appendChild(createBadge(roleCode, "role"));
        }
    });
}

function renderUserList() {
    const body = $("userTableBody");
    const mobile = $("userMobileList");

    body.replaceChildren();
    mobile.replaceChildren();

    $("loadingState").hidden = true;

    const hasUsers = users.length > 0;

    $("emptyState").hidden = hasUsers;
    $("userTableWrap").hidden = !hasUsers;

    $("userCount").textContent =
        `${users.length} record${users.length === 1 ? "" : "s"} on this page`;

    users.forEach(user => {
        const row = document.createElement("tr");
        const userCell = document.createElement("td");

        userCell.appendChild(
            createElement("span", "user-name", user.fullName || "Unnamed User")
        );

        userCell.appendChild(
            createElement("span", "user-email", user.email || "No email")
        );

        userCell.appendChild(
            createElement("span", "user-id-short", user.userId || "")
        );

        row.appendChild(userCell);

        const roleCell = document.createElement("td");
        renderUserRoles(roleCell, user.roles);
        row.appendChild(roleCell);

        const statusCell = document.createElement("td");

        statusCell.appendChild(
            createBadge(user.accountStatus, "status")
        );

        if (user.isArchived) {
            statusCell.appendChild(
                createElement("span", "status-badge status-suspended", "Archived")
            );
        }

        row.appendChild(statusCell);

        const registrationCell = document.createElement("td");
        registrationCell.textContent = formatStatus(user.registrationStatus);
        row.appendChild(registrationCell);

        row.appendChild(
            createElement("td", "", Number(user.activeCountryCount || 0))
        );

        row.appendChild(
            createElement("td", "", formatDate(user.createdAt))
        );

        const actionCell = document.createElement("td");
        const actions = createElement("div", "action-buttons");

        actions.appendChild(
            createActionButton("Profile", () => {
                openUserDetail(user.userId);
            })
        );

        actions.appendChild(
            createActionButton("Activity", () => {
                openActivity(user.userId, user.fullName);
            })
        );

        actionCell.appendChild(actions);
        row.appendChild(actionCell);

        body.appendChild(row);
        renderMobileUser(user, mobile);
    });

    renderPagination();
}

function renderMobileUser(user, container) {
    const card = createElement("article", "user-card");

    card.appendChild(
        createElement("h3", "", user.fullName || "Unnamed User")
    );

    card.appendChild(
        createElement("p", "", user.email || "No email")
    );

    card.appendChild(
        createElement("p", "", `User ID: ${user.userId}`)
    );

    const roles = createElement("div");
    renderUserRoles(roles, user.roles);
    card.appendChild(roles);

    card.appendChild(
        createElement(
            "p",
            "",
            `Account: ${formatStatus(user.accountStatus)}${user.isArchived ? " (Archived)" : ""}`
        )
    );

    card.appendChild(
        createElement(
            "p",
            "",
            `Registration: ${formatStatus(user.registrationStatus)}`
        )
    );

    card.appendChild(
        createElement(
            "p",
            "",
            `Active country assignments: ${Number(user.activeCountryCount || 0)}`
        )
    );

    card.appendChild(
        createElement("p", "", `Created: ${formatDate(user.createdAt)}`)
    );

    const actions = createElement("div", "action-buttons");

    actions.appendChild(
        createActionButton("Profile", () => {
            openUserDetail(user.userId);
        })
    );

    actions.appendChild(
        createActionButton("Activity", () => {
            openActivity(user.userId, user.fullName);
        })
    );

    card.appendChild(actions);
    container.appendChild(card);
}

function renderPagination() {
    $("pagination").hidden = false;

    $("pageInformation").textContent =
        `Page ${currentPage + 1}`;

    $("previousPageButton").disabled = currentPage === 0;
    $("nextPageButton").disabled = !hasNextPage;
}

async function loadUsers() {
    const requestSequence = ++listRequestSequence;

    clearNotice();
    setLoadingState(true);

    const filters = getFilterValues();

    const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        accountStatus: filters.accountStatus,
        registrationStatus: filters.registrationStatus,
        limit: String(PAGE_SIZE),
        offset: String(currentPage * PAGE_SIZE)
    });

    try {
        const result = await apiRequest(
            `/super-admin/users?${params.toString()}`,
            null,
            getToken()
        );

        if (requestSequence !== listRequestSequence) return;

        users = Array.isArray(result.users)
            ? result.users
            : [];

        hasNextPage = users.length === PAGE_SIZE;

        renderUserList();
    } catch (error) {
        if (requestSequence !== listRequestSequence) return;
        if (handleSessionError(error)) return;

        setLoadingState(false);
        $("userTableWrap").hidden = true;
        $("emptyState").hidden = true;
        $("pagination").hidden = true;

        showNotice(
            `Unable to load user accounts: ${error.message}`,
            "error"
        );
    }
}

function setText(id, value) {
    $(id).textContent =
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);
}

function renderHistory(containerId, items, emptyMessage, renderer) {
    const container = $(containerId);
    container.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
        container.appendChild(
            createElement("p", "card-note", emptyMessage)
        );
        return;
    }

    items.forEach(item => {
        const card = createElement("article", "history-item");
        renderer(card, item);
        container.appendChild(card);
    });
}

function appendHistoryLine(container, label, value) {
    container.appendChild(
        createElement(
            "p",
            "",
            `${label}: ${value === null || value === undefined || value === "" ? "—" : value}`
        )
    );
}

function renderRoleHistory(items) {
    renderHistory(
        "roleHistory",
        items,
        "No role assignments recorded.",
        (card, item) => {
            card.appendChild(
                createElement(
                    "strong",
                    "",
                    formatStatus(item.role_code || item.role_name)
                )
            );

            appendHistoryLine(card, "Role name", item.role_name);
            appendHistoryLine(card, "Assigned by", item.assigned_by_name || item.assigned_by);
            appendHistoryLine(card, "Assigned at", formatDate(item.assigned_at));
        }
    );
}

function renderCountryHistory(items) {
    renderHistory(
        "countryAssignmentHistory",
        items,
        "No country assignments recorded.",
        (card, item) => {
            card.appendChild(
                createElement(
                    "strong",
                    "",
                    `${item.country_name || "Unknown country"} (${item.country_id || "—"})`
                )
            );

            appendHistoryLine(card, "Role", item.assignment_role_code);
            appendHistoryLine(card, "Status", formatStatus(item.assignment_status));
            appendHistoryLine(card, "Assigned by", item.assigned_by_name || item.assigned_by);
            appendHistoryLine(card, "Assigned at", formatDate(item.assigned_at));

            if (item.revoked_at) {
                appendHistoryLine(card, "Revoked by", item.revoked_by_name || item.revoked_by);
                appendHistoryLine(card, "Revoked at", formatDate(item.revoked_at));
                appendHistoryLine(card, "Revocation reason", item.revocation_reason);
            }
        }
    );
}

function renderAuthenticationIdentityHistory(items) {
    renderHistory(
        "identityHistory",
        items,
        "No authentication identity history recorded.",
        (card, item) => {
            card.appendChild(
                createElement("strong", "", formatStatus(item.identity_type))
            );

            appendHistoryLine(card, "Verification", formatStatus(item.verification_status));
            appendHistoryLine(card, "Country code", item.country_code);
            appendHistoryLine(card, "Created", formatDate(item.created_at));
            appendHistoryLine(card, "Expires", formatDate(item.expires_at));
            appendHistoryLine(card, "Verified", formatDate(item.verified_at));
            appendHistoryLine(card, "Revoked", formatDate(item.revoked_at));
        }
    );
}

function renderRegistrationIdentityHistory(items) {
    renderHistory(
        "registrationIdentityHistory",
        items,
        "No registration identity history recorded.",
        (card, item) => {
            card.appendChild(
                createElement("strong", "", formatStatus(item.identity_type))
            );

            appendHistoryLine(card, "Status", formatStatus(item.identity_status));
            appendHistoryLine(card, "Country code", item.country_code);
            appendHistoryLine(card, "Created", formatDate(item.created_at));
            appendHistoryLine(card, "Last updated", formatDate(item.updated_at));
            appendHistoryLine(card, "Released at", formatDate(item.released_at));
            appendHistoryLine(card, "Released by", item.released_by);
            appendHistoryLine(card, "Release reason", item.release_reason);
        }
    );
}

function renderArchiveHistory(items) {
    renderHistory(
        "archiveHistory",
        items,
        "No archive history recorded.",
        (card, item) => {
            card.appendChild(
                createElement(
                    "strong",
                    "",
                    `Archive record ${item.archive_id || ""}`
                )
            );

            appendHistoryLine(card, "Previous account status", formatStatus(item.previous_account_status));
            appendHistoryLine(card, "Archived by", item.archived_by);
            appendHistoryLine(card, "Archived at", formatDate(item.archived_at));
            appendHistoryLine(card, "Archive reason", item.archive_reason);

            if (item.restored_at) {
                appendHistoryLine(card, "Restored by", item.restored_by);
                appendHistoryLine(card, "Restored at", formatDate(item.restored_at));
                appendHistoryLine(card, "Restore reason", item.restore_reason);
            } else {
                appendHistoryLine(card, "Archive state", "Currently archived");
            }
        }
    );
}

function isCurrentUser(userId) {
    return Boolean(currentUserId && currentUserId === userId);
}

function updateAccountActions(user) {
    $("archiveActionPanel").hidden = true;
    $("restoreActionPanel").hidden = true;

    $("archiveReason").value = "";
    $("restoreReason").value = "";

    if (!user) return;

    const roles = Array.isArray(user.roles)
        ? user.roles.map(item =>
            typeof item === "string"
                ? item
                : item?.role_code || item?.roleCode
        )
        : [];

    const isSuperAdmin = roles.includes("SUPER_ADMIN");

    const hasActiveCountryAssignment =
        Array.isArray(user.countryAssignments) &&
        user.countryAssignments.some(
            item => item.assignment_status === "ACTIVE"
        );

    const canArchive =
        !isSuperAdmin &&
        !isCurrentUser(user.userId) &&
        !hasActiveCountryAssignment &&
        ["ACTIVE", "DISABLED"].includes(user.accountStatus) &&
        !user.isArchived;

    if (user.isArchived && user.accountStatus === "SUSPENDED") {
        $("restoreActionPanel").hidden = false;
    } else if (canArchive) {
        $("archiveActionPanel").hidden = false;
    }
}

async function openUserDetail(userId, options = {}) {
    const requestSequence = ++detailRequestSequence;
    const {
        scroll = true,
        clearNotice: shouldClearNotice = true
    } = options;

    if (shouldClearNotice) clearDetailNotice();

    selectedUserId = userId;
    currentUser = null;

    $("userDetailSection").hidden = false;
    $("userDetailSection").style.display = "";
    $("activitySection").hidden = true;
    $("activitySection").style.display = "none";
    
    $("detailUserName").textContent = "Loading user profile...";
    $("detailUserEmail").textContent = "";

    [
        "detailUserId",
        "detailAccountStatus",
        "detailRegistrationStatus",
        "detailCreatedAt",
        "detailUpdatedAt",
        "detailReviewedBy",
        "detailReviewedAt",
        "detailRejectionReason",
        "detailCancellationReason"
    ].forEach(id => setText(id, "—"));

    [
        "roleHistory",
        "countryAssignmentHistory",
        "identityHistory",
        "registrationIdentityHistory",
        "archiveHistory"
    ].forEach(id => $(id).replaceChildren());

    $("archiveActionPanel").hidden = true;
    $("restoreActionPanel").hidden = true;

    if (scroll) {
        $("userDetailSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    try {
        const result = await apiRequest(
            `/super-admin/users/${encodeURIComponent(userId)}`,
            null,
            getToken()
        );

        if (
            requestSequence !== detailRequestSequence ||
            selectedUserId !== userId
        ) {
            return false;
        }

        if (!result.user) {
            throw new Error("User profile was not returned.");
        }

        currentUser = result.user;
        renderUserDetail(currentUser);

        return true;
    } catch (error) {
        if (
            requestSequence !== detailRequestSequence ||
            selectedUserId !== userId
        ) {
            return false;
        }

        if (handleSessionError(error)) return false;

        showDetailNotice(
            `Unable to load user profile: ${error.message}`,
            "error"
        );

        return false;
    }
}

function renderUserDetail(user) {
    $("detailUserName").textContent =
        user.fullName || "Unnamed User";

    $("detailUserEmail").textContent =
        user.email || "No email address recorded";

    setText("detailUserId", user.userId);
    setText("detailAccountStatus", formatStatus(user.accountStatus));
    setText("detailRegistrationStatus", formatStatus(user.registrationStatus));
    setText("detailCreatedAt", formatDate(user.createdAt));
    setText("detailUpdatedAt", formatDate(user.updatedAt));

    setText("detailReviewedBy", user.reviewedByName || user.reviewedBy);
    setText("detailReviewedAt", formatDate(user.reviewedAt));
    setText("detailRejectionReason", user.rejectionReason);
    setText("detailCancellationReason", user.cancellationReason);

    renderRoleHistory(user.roles);
    renderCountryHistory(user.countryAssignments);
    renderAuthenticationIdentityHistory(user.authenticationIdentities);
    renderRegistrationIdentityHistory(user.registrationIdentityHistory);
    renderArchiveHistory(user.archiveHistory);

    updateAccountActions(user);
}

function renderActivities(items) {
    const container = $("activityList");
    container.replaceChildren();

    const hasActivities = Array.isArray(items) && items.length > 0;

    $("activityEmptyState").hidden = hasActivities;

    if (!hasActivities) return;

    items.forEach(activity => {
        const card = createElement("article", "activity-item");
        const header = createElement("div", "activity-item-header");
        const heading = document.createElement("div");

        heading.appendChild(
            createElement(
                "h3",
                "",
                formatStatus(activity.activityType)
            )
        );

        heading.appendChild(
            createElement(
                "p",
                "detail-subtitle",
                `${activity.source || "ACTIVITY"} · ${activity.entityType || "—"}`
            )
        );

        header.appendChild(heading);

        const time = document.createElement("time");
        time.textContent = formatDate(activity.createdAt);
        header.appendChild(time);

        card.appendChild(header);

        const meta = createElement("div", "activity-meta");

        meta.appendChild(
            createElement(
                "span",
                "",
                `Actor: ${activity.actorName || activity.actorUserId || "System"}`
            )
        );

        if (activity.entityId) {
            meta.appendChild(
                createElement(
                    "span",
                    "",
                    `Entity ID: ${activity.entityId}`
                )
            );
        }

        card.appendChild(meta);

        if (activity.reason) {
            card.appendChild(
                createElement(
                    "div",
                    "activity-reason",
                    `Reason: ${activity.reason}`
                )
            );
        }

        container.appendChild(card);
    });
}

async function openActivity(userId, userName) {
    selectedUserId = userId;
    activityPage = 0;

    $("userDetailSection").hidden = true;
    $("userDetailSection").style.display = "none";
    $("activitySection").hidden = false;
    $("activitySection").style.display = "";
    
    $("activityUserLabel").textContent =
        `Activity history for ${userName || userId}`;

    $("activitySection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    await loadActivity();
}

async function loadActivity() {
    if (!selectedUserId) return;

    const userId = selectedUserId;
    const requestSequence = ++activityRequestSequence;
    const requestedPage = activityPage;

    $("activityLoadingState").hidden = false;
    $("activityEmptyState").hidden = true;
    $("activityList").replaceChildren();
    $("activityPagination").hidden = true;

    const params = new URLSearchParams({
        limit: String(ACTIVITY_PAGE_SIZE),
        offset: String(activityPage * ACTIVITY_PAGE_SIZE)
    });

    try {
        const result = await apiRequest(
            `/super-admin/users/${encodeURIComponent(userId)}/activity?${params.toString()}`,
            null,
            getToken()
        );

        if (
            requestSequence !== activityRequestSequence ||
            selectedUserId !== userId ||
            activityPage !== requestedPage
        ) {
            return;
        }

        const activities = Array.isArray(result.activities)
            ? result.activities
            : [];

        hasNextActivityPage =
            activities.length === ACTIVITY_PAGE_SIZE;

        $("activityLoadingState").hidden = true;

        renderActivities(activities);

        $("activityPagination").hidden = false;

        $("activityPageInformation").textContent =
            `Page ${activityPage + 1}`;

        $("previousActivityButton").disabled =
            activityPage === 0;

        $("nextActivityButton").disabled =
            !hasNextActivityPage;
    } catch (error) {
        if (
            requestSequence !== activityRequestSequence ||
            selectedUserId !== userId
        ) {
            return;
        }

        if (handleSessionError(error)) return;

        $("activityLoadingState").hidden = true;
        $("activityEmptyState").hidden = false;

        $("activityEmptyState").querySelector("p").textContent =
            `Unable to load activity history: ${error.message}`;
    }
}

async function archiveSelectedUser() {
    if (!selectedUserId || !currentUser) return;

    const reason = $("archiveReason").value.trim();

    if (reason.length < 10 || reason.length > 1000) {
        showDetailNotice(
            "Archive reason must contain between 10 and 1000 characters.",
            "error"
        );
        return;
    }

    const userId = selectedUserId;

    const confirmed = window.confirm(
        `Archive ${currentUser.fullName || "this account"}?\n\nThe account will be suspended. Historical records will be preserved.`
    );

    if (!confirmed) return;

    const button = $("archiveButton");
    button.disabled = true;
    button.textContent = "Archiving...";

    try {
        await apiRequest(
            `/super-admin/users/${encodeURIComponent(userId)}/archive`,
            { reason },
            getToken()
        );

        window.location.assign(
            `${window.location.pathname}?refresh=${Date.now()}`
        );

    } catch (error) {
        if (handleSessionError(error)) return;

        showDetailNotice(
            `Unable to archive account: ${error.message}`,
            "error"
        );
    } finally {
        button.disabled = false;
        button.textContent = "Archive Account";
    }
}

async function restoreSelectedUser() {
    if (!selectedUserId || !currentUser) return;

    const reason = $("restoreReason").value.trim();

    if (reason.length < 10 || reason.length > 1000) {
        showDetailNotice(
            "Restore reason must contain between 10 and 1000 characters.",
            "error"
        );
        return;
    }

    const userId = selectedUserId;

    const confirmed = window.confirm(
        `Restore ${currentUser.fullName || "this account"}?\n\nThe account will return to its previous account status.`
    );

    if (!confirmed) return;

    const button = $("restoreButton");
    button.disabled = true;
    button.textContent = "Restoring...";

    try {
        await apiRequest(
            `/super-admin/users/${encodeURIComponent(userId)}/restore`,
            { reason },
            getToken()
        );

        window.location.assign(
            `${window.location.pathname}?refresh=${Date.now()}`
        );

    } catch (error) {
        if (handleSessionError(error)) return;

        showDetailNotice(
            `Unable to restore account: ${error.message}`,
            "error"
        );
    } finally {
        button.disabled = false;
        button.textContent = "Restore Account";
    }
}

async function loadCurrentSession() {
    const token = getToken();

    if (!token) {
        redirectToLogin();
        return false;
    }

    const result = await apiRequest(
        "/auth/me",
        null,
        token
    );

    if (!result.user || !result.session) {
        throw new Error("Valid session information was not returned.");
    }

    currentUserId = result.user.userId;

    const roles = Array.isArray(result.user.roles)
        ? result.user.roles.map(role => role.roleCode)
        : [];

    if (!roles.includes("SUPER_ADMIN")) {
        throw new Error("SUPER_ADMIN access is required.");
    }

    return true;
}

function closeUserDetail() {
    detailRequestSequence += 1;

    const section = $("userDetailSection");
    section.hidden = true;
    section.style.display = "none";

    currentUser = null;
    selectedUserId = null;
}

function closeActivity() {
    activityRequestSequence += 1;

    const section = $("activitySection");
    section.hidden = true;
    section.style.display = "none";

    selectedUserId = null;
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
        await apiRequest(
            "/auth/logout",
            {},
            token
        );

        clearLocalSession();
        redirectToLogin();
    } catch (error) {
        if (handleSessionError(error)) return;

        button.disabled = false;
        button.textContent = "Logout";

        showNotice(
            `Logout could not be completed: ${error.message}`,
            "error"
        );
    }
}

$("userFilterPanelToggle").addEventListener("click", () => {
    const button = $("userFilterPanelToggle");
    const panel = $("filterForm");
    const expanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;

    button.querySelector(".panel-toggle-label").textContent =
        expanded ? "Expand" : "Collapse";
});

$("filterForm").addEventListener("submit", event => {
    event.preventDefault();
    currentPage = 0;
    loadUsers();
});

$("resetFilterButton").addEventListener("click", () => {
    $("searchInput").value = "";
    $("roleFilter").value = "ALL";
    $("accountStatusFilter").value = "ALL";
    $("registrationStatusFilter").value = "ALL";

    currentPage = 0;
    loadUsers();
});

$("refreshButton").addEventListener("click", async () => {
    const button = $("refreshButton");
    const userId = selectedUserId;
    const detailIsOpen = !$("userDetailSection").hidden;
    const activityIsOpen = !$("activitySection").hidden;
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Refreshing...";

    try {
        const tasks = [loadUsers()];

        if (userId && detailIsOpen) {
            tasks.push(
                openUserDetail(userId, { scroll: false })
            );
        }

        if (userId && activityIsOpen) {
            tasks.push(loadActivity());
        }

        await Promise.all(tasks);
    } finally {
        button.disabled = false;
        button.textContent = originalText || "Refresh";
    }
});

$("previousPageButton").addEventListener("click", () => {
    if (currentPage <= 0) return;

    currentPage -= 1;
    loadUsers();
});

$("nextPageButton").addEventListener("click", () => {
    if (!hasNextPage) return;

    currentPage += 1;
    loadUsers();
});

$("closeDetailButton").addEventListener("click", closeUserDetail);
$("closeActivityButton").addEventListener("click", closeActivity);

$("previousActivityButton").addEventListener("click", () => {
    if (activityPage <= 0) return;

    activityPage -= 1;
    loadActivity();
});

$("nextActivityButton").addEventListener("click", () => {
    if (!hasNextActivityPage) return;

    activityPage += 1;
    loadActivity();
});

$("archiveButton").addEventListener("click", archiveSelectedUser);
$("restoreButton").addEventListener("click", restoreSelectedUser);
$("logoutButton").addEventListener("click", logout);

async function initializePage() {
    try {
        const validSession = await loadCurrentSession();

        if (!validSession) return;

        await loadUsers();
    } catch (error) {
        if (handleSessionError(error)) return;

        showNotice(
            `Unable to initialize User Management: ${error.message}`,
            "error"
        );
    }
}

initializePage();
