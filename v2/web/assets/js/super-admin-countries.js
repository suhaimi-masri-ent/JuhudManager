import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let countries = [];

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
    const notice = $("countryNotice");

    notice.textContent = message;
    notice.className = type === "error"
        ? "notice error"
        : "notice";
    notice.hidden = false;
}

function clearNotice() {
    const notice = $("countryNotice");
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

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = String(text);
    }

    return element;
}

function formatCount(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
}

function createStatusBadge(status) {
    const active = status === "ACTIVE";

    return createElement(
        "span",
        `country-status ${active ? "active" : "inactive"}`,
        status || "UNKNOWN"
    );
}

function createActionButton(country) {
    const active = country.countryStatus === "ACTIVE";

    const button = createElement(
        "button",
        `country-action ${active ? "deactivate" : "activate"}`,
        active ? "Deactivate" : "Activate"
    );

    button.type = "button";
    button.dataset.countryCode = country.countryCode;
    button.dataset.nextStatus = active ? "INACTIVE" : "ACTIVE";

    button.addEventListener("click", () => {
        changeCountryStatus(
            country.countryCode,
            button.dataset.nextStatus,
            button
        );
    });

    return button;
}

function renderDesktopTable() {
    const body = $("countryTableBody");
    body.replaceChildren();

    countries.forEach(country => {
        const row = document.createElement("tr");

        const nameCell = createElement(
            "td",
            "",
            country.countryName
        );

        const codeCell = createElement(
            "td",
            "",
            country.countryCode
        );

        const statusCell = document.createElement("td");
        statusCell.appendChild(
            createStatusBadge(country.countryStatus)
        );

        const adminCell = createElement(
            "td",
            "",
            formatCount(country.activeAdminCount)
        );

        const jemaahCell = createElement(
            "td",
            "",
            formatCount(country.activeJemaahCount)
        );

        const actionCell = document.createElement("td");
        actionCell.appendChild(createActionButton(country));

        row.append(
            nameCell,
            codeCell,
            statusCell,
            adminCell,
            jemaahCell,
            actionCell
        );

        body.appendChild(row);
    });
}

function renderMobileCards() {
    const container = $("countryList");
    container.replaceChildren();

    countries.forEach(country => {
        const card = createElement("article", "country-card");

        card.appendChild(
            createElement("h3", "", country.countryName)
        );

        const details = [
            ["Country Code", country.countryCode],
            ["Status", country.countryStatus],
            ["Active Country Admins", formatCount(country.activeAdminCount)],
            ["Active Jemaah", formatCount(country.activeJemaahCount)]
        ];

        details.forEach(([label, value]) => {
            const paragraph = document.createElement("p");

            paragraph.appendChild(
                createElement("span", "", label)
            );

            paragraph.appendChild(
                createElement("strong", "", value)
            );

            card.appendChild(paragraph);
        });

        card.appendChild(createActionButton(country));
        container.appendChild(card);
    });
}

function renderCountries() {
    const hasCountries = countries.length > 0;

    $("emptyState").hidden = hasCountries;
    $("countryTableWrap").hidden = !hasCountries;

    renderDesktopTable();
    renderMobileCards();
}

async function loadCountries() {
    const token = getToken();

    if (!token) {
        redirectToLogin();
        return;
    }

    const refreshButton = $("refreshCountriesButton");
    refreshButton.disabled = true;

    try {
        const result = await apiRequest(
            "/super-admin/countries",
            null,
            token
        );

        countries = Array.isArray(result.countries)
            ? result.countries
            : [];

        $("accountAccessLabel").textContent = "Super Admin Area";

        renderCountries();
        clearNotice();
    } catch (error) {
        if (handleSessionError(error)) {
            return;
        }

        showNotice(
            `Unable to load countries: ${error.message}`,
            "error"
        );
    } finally {
        refreshButton.disabled = false;
    }
}

async function addCountry(event) {
    event.preventDefault();
    clearNotice();

    const button = $("addCountryButton");
    const codeInput = $("countryCode");
    const nameInput = $("countryName");

    const countryCode = codeInput.value.trim().toUpperCase();
    const countryName = nameInput.value.trim();

    if (!/^[A-Z]{2}$/.test(countryCode)) {
        showNotice(
            "Country code must contain exactly two letters.",
            "error"
        );
        codeInput.focus();
        return;
    }

    if (countryName.length < 2 || countryName.length > 100) {
        showNotice(
            "Country name must contain between 2 and 100 characters.",
            "error"
        );
        nameInput.focus();
        return;
    }

    button.disabled = true;
    button.textContent = "Adding...";

    try {
        const result = await apiRequest(
            "/super-admin/countries",
            {
                countryCode,
                countryName
            },
            getToken()
        );

        $("addCountryForm").reset();

        showNotice(
            result.message || "Country created successfully."
        );

        await loadCountries();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to add country: ${error.message}`,
                "error"
            );
        }
    } finally {
        button.disabled = false;
        button.textContent = "Add Country";
    }
}

async function changeCountryStatus(countryCode, countryStatus, button) {
    const action = countryStatus === "ACTIVE"
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} ${countryCode}?`
    );

    if (!confirmed) {
        return;
    }

    clearNotice();
    button.disabled = true;

    try {
        const result = await apiRequest(
            `/super-admin/countries/${encodeURIComponent(countryCode)}/status`,
            { countryStatus },
            getToken()
        );

        showNotice(
            result.message || "Country status updated successfully."
        );

        await loadCountries();
    } catch (error) {
        if (!handleSessionError(error)) {
            showNotice(
                `Unable to update country status: ${error.message}`,
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

$("addCountryForm").addEventListener("submit", addCountry);
$("refreshCountriesButton").addEventListener("click", loadCountries);
$("logoutButton").addEventListener("click", logout);

loadCountries();
