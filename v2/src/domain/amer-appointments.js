export const APPOINTMENT_ERRORS = Object.freeze({
  NOT_ADMIN: "Only an Admin can appoint or replace an Amer Jemaah.",
  TAKAZA_NOT_FOUND: "Takaza was not found.",
  TAKAZA_STARTED: "An initial Amer Jemaah must be appointed before the Takaza start date.",
  NOT_PARTICIPANT: "The appointee must be an active participant of this Takaza.",
  NOT_ELIGIBLE: "The appointee does not have confirmed eligibility.",
  MISSING_ELIGIBILITY_REFERENCE: "An eligibility reference is required.",
  REASON_REQUIRED: "A reason is required when replacing an Amer Jemaah."
});

export function validateAmerAppointment(input) {
  const errors = [];
  if (!input?.actorIsAdmin) errors.push(APPOINTMENT_ERRORS.NOT_ADMIN);
  if (!input?.takazaExists) errors.push(APPOINTMENT_ERRORS.TAKAZA_NOT_FOUND);
  if (!input?.isActiveParticipant) errors.push(APPOINTMENT_ERRORS.NOT_PARTICIPANT);
  if (input?.eligibilityStatus !== "ELIGIBLE") errors.push(APPOINTMENT_ERRORS.NOT_ELIGIBLE);
  if (!String(input?.eligibilityReference ?? "").trim()) {
    errors.push(APPOINTMENT_ERRORS.MISSING_ELIGIBILITY_REFERENCE);
  }

  const hasCurrentAppointment = Boolean(input?.hasCurrentAppointment);
  if (!hasCurrentAppointment && input?.officialStartDate) {
    const effectiveAt = input?.effectiveAt ? new Date(input.effectiveAt) : null;
    const startDate = new Date(input.officialStartDate + "T00:00:00Z");
    if (!effectiveAt || Number.isNaN(effectiveAt.getTime()) || effectiveAt >= startDate) {
      errors.push(APPOINTMENT_ERRORS.TAKAZA_STARTED);
    }
  }

  if (hasCurrentAppointment && !String(input?.changeReason ?? "").trim()) {
    errors.push(APPOINTMENT_ERRORS.REASON_REQUIRED);
  }
  return { valid: errors.length === 0, errors };
}

export function formerAmerAccess(policy, adminDecision) {
  if (adminDecision === "READ_ONLY") return "READ_ONLY";
  if (adminDecision === "NO_ACCESS") return "NO_ACCESS";
  if (policy === "READ_ONLY" || policy === "NO_ACCESS") return policy;
  return "ADMIN_CONTROLLED";
}
