
import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";

let selectedUserId = null;
let requestSequence = 0;

function getToken() {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function setStatus(message, isError = false) {
    const status = $("registrationCancellationStatus");

    status.textContent = message;
    status.className = isError
        ? "notice error"
        : "notice";

    status.hidden = false;
}

function resetPanel() {
    $("registrationCancellationPanel").hidden = true;
    $("registrationCancellationEligibility").textContent = "";
    $("registrationCancellationForm").reset();
    $("submitRegistrationCancellation").disabled = true;
    selectedUserId = null;
}

function currentProfileId() {
    return $("detailUserId").textContent.trim();
}

async function loadEligibility() {
    const userId = currentProfileId();
    const registrationStatus =
        $("detailRegistrationStatus").textContent.trim();

    const isAwaitingVerification =
        registrationStatus.toUpperCase() ===
        "AWAITING EMAIL VERIFICATION";

    if (!userId || userId === "—" || !isAwaitingVerification) {
        resetPanel();
        return;
    }

    const sequence = ++requestSequence;

    selectedUserId = userId;
    $("registrationCancellationPanel").hidden = false;
    $("submitRegistrationCancellation").disabled = true;

    $("registrationCancellationEligibility").textContent =
        "Checking cancellation eligibility…";

    try {
        const result = await apiRequest(
            `/admin/registrations/${encodeURIComponent(userId)}/cancellation-eligibility`,
            null,
            getToken()
        );

        if (
            sequence !== requestSequence ||
            selectedUserId !== userId
        ) {
            return;
        }

        const eligibility = result.cancellation;

        if (!eligibility) {
            throw new Error("Eligibility information was not returned.");
        }

        if (!eligibility.eligible) {
            $("registrationCancellationEligibility").textContent =
                "Cancellation is not permitted:\n" +
                (eligibility.blockers || []).join("\n");

            return;
        }

        $("registrationCancellationEligibility").textContent =
            "Eligible for cancellation.\n\n" +
            `Unverified identity records to revoke: ${eligibility.identitiesToRevoke}\n` +
            `Pending authentication identities to revoke: ${eligibility.pendingAuthIdentitiesToRevoke}\n` +
            `Active OTP requests to invalidate: ${eligibility.activeOtpRequestsToInvalidate}\n\n` +
            `Account: ${eligibility.fullName}\n` +
            `User ID: ${eligibility.userId}`;

        $("submitRegistrationCancellation").disabled = false;
    } catch (error) {
        if (sequence !== requestSequence) return;

        $("registrationCancellationEligibility").textContent =
            `Unable to check eligibility: ${error.message}`;

        $("submitRegistrationCancellation").disabled = true;
    }
}

async function submitCancellation(event) {
    event.preventDefault();

    if (!selectedUserId) return;

    const reason = $("registrationCancellationReason")
        .value.trim();

    if (reason.length < 10 || reason.length > 1000) {
        setStatus(
            "Reason must contain between 10 and 1000 characters.",
            true
        );
        return;
    }

    if (!$("confirmRegistrationCancellation").checked) {
        setStatus(
            "Please confirm the cancellation.",
            true
        );
        return;
    }

    const userId = selectedUserId;
    const userName = $("detailUserName").textContent.trim();

    const confirmed = window.confirm(
        "FINAL CONFIRMATION\n\n" +
        "Cancel this incomplete registration?\n\n" +
        `Name: ${userName}\n` +
        `User ID: ${userId}\n\n` +
        "This is cancellation, NOT permanent deletion.\n" +
        "The action will be recorded in the audit history."
    );

    if (!confirmed) return;

    const button = $("submitRegistrationCancellation");
    button.disabled = true;
    button.textContent = "Cancelling…";

    try {
        const result = await apiRequest(
            `/admin/registrations/${encodeURIComponent(userId)}/cancel`,
            { reason },
            getToken()
        );

        setStatus(
            result.message ||
            "Registration cancelled successfully."
        );

        $("registrationCancellationForm").hidden = true;

        window.alert(
            "Registration cancellation completed.\n\n" +
            `User ID: ${userId}\n` +
            "The audit record has been created."
        );

        window.location.reload();
    } catch (error) {
        setStatus(error.message, true);
        button.disabled = false;
        button.textContent = "Cancel Registration";
    }
}

$("registrationCancellationForm").addEventListener(
    "submit",
    submitCancellation
);

const profileObserver = new MutationObserver(() => {
    loadEligibility();
});

profileObserver.observe($("detailUserId"), {
    childList: true,
    characterData: true,
    subtree: true
});

profileObserver.observe($("detailRegistrationStatus"), {
    childList: true,
    characterData: true,
    subtree: true
});

resetPanel();
