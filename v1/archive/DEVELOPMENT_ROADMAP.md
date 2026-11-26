# JuhudManager Development Roadmap

**Document:** Development Roadmap & Decision Log
**Branch:** `develop`
**Status:** Working document
**Last Updated:** 16 November 2026

> This document tracks the development direction, current implementation position, agreed decisions and outstanding design questions for JuhudManager. It complements [README.md](README.md), which describes the broader workflow requirements.

## 1. Purpose of This Document

Use this document as the continuity reference when development resumes after a break. It should answer:

- What has already been implemented?
- What are we currently working on?
- What direction have we agreed to follow?
- Which ideas are still proposals rather than confirmed requirements?
- What should be developed next?

Update this document whenever an important workflow, policy or development priority is agreed. Do not treat a proposal as an approved requirement.

### Decision labels

| Label | Meaning |
|---|---|
| **AGREED** | Confirmed direction or rule. |
| **PROPOSED** | Suggested design that still needs discussion or approval. |
| **PENDING** | An open question or decision. |
| **IMPLEMENTED** | Verified as present in the current codebase. |

## 2. Overall Development Direction

JuhudManager is being developed incrementally. The intention is to establish the business workflow before introducing complex database structures or implementing dependent modules.

The system should connect these main areas:

1. Takaza / Project definition and requirements.
2. Activities and participant activity records.
3. Eligibility assessment against common and Takaza-specific criteria.
4. Human review and final eligibility decision.
5. Project Member confirmation and subsequent participation management.

The system should reduce reliance on informal manual checking, help prevent overlooked or inconsistent assessments, and preserve the reasons behind important decisions.

## 3. Current Development Position

The following is a working snapshot based on the code reviewed on 16 November 2026. It is not a claim that every workflow is complete or production-ready.

| Area | Current position | Notes |
|---|---|---|
| Takaza Categories | **IMPLEMENTED** | Category management exists; further workflow refinement may be required. |
| Takaza Registration | **IN PROGRESS** | Registration/listing, search/filtering, pagination and record actions have been worked on. Current registration flow is still at the draft stage. |
| Takaza Endorsement | **NOT IMPLEMENTED** | Submission, endorsement, return, rejection and cancellation workflow still needs to be designed and implemented. |
| Activity Types | **IMPLEMENTED** | Admin can maintain activity types. Frequency options and validation should be reconciled. |
| Activity Assignment | **BACKEND EXISTS** | Assignment API exists; complete user-facing workflow needs review. |
| Activity Submission | **IMPLEMENTED** | Users can submit activity records with date/time, description and progress information. |
| Activity Review | **IMPLEMENTED / NEEDS REVIEW** | Review API and UI code exist; the active review interface and any duplicate/unused implementation should be clarified. |
| Eligibility Assessment Engine | **PROPOSED** | New design direction discussed on 16 November 2026. Not yet implemented. |
| Project Member Management | **NOT YET ESTABLISHED** | Membership confirmation should follow eligibility assessment and authorised final decision. |
| Project / Task / Group Workflows | **REQUIREMENTS DRAFTED** | Refer to README.md; workflows and detailed rules remain subject to refinement. |

## 4. Takaza, Activities and Project Membership

### 4.1 Intended relationship

**AGREED — workflow direction**

Activities are not merely a standalone activity log. Activity records can provide evidence when assessing whether a person is suitable to become a member of a particular Takaza.

The intended high-level flow is:

```text
Takaza is prepared / opened
        |
Candidate is identified
        |
Check common eligibility criteria
        |
Check Takaza-specific criteria
        |
Eligibility assessment report
        |
Authorised human review and final decision
        |
If approved: confirm Project Member
        |
Manage participation and project progress
```

A candidate should not automatically become a Project Member merely because they have submitted Activities. The relevant criteria and final decision must be considered.

### 4.2 Common and Takaza-specific criteria

**AGREED — criteria structure**

The assessment should support two layers:

- **Common criteria:** baseline requirements that apply across Takazas.
- **Takaza-specific criteria:** additional requirements that depend on the nature or category of an individual Takaza.

Examples for discussion only:

| Takaza focus | Possible specific evidence |
|---|---|
| Education | Teaching, training or education-related Activities. |
| Welfare | Volunteer or welfare-related Activities. |
| Health | Health or community health-related Activities. |
| Community | Community engagement or local development Activities. |

The examples above are illustrative. Actual criteria must be configured and approved for each Takaza.

## 5. Eligibility & Assessment Engine

**PROPOSED — new system component**

The proposed Eligibility & Assessment Engine should help make assessments consistent and reduce manual oversight.

It should not be a rigid pass/fail gate. It should produce a transparent assessment report and recommendation for an authorised human decision-maker.

### 5.1 Assessment stages

1. Load the candidate's available profile and relevant records.
2. Evaluate common criteria.
3. Evaluate the selected Takaza's specific criteria.
4. Identify satisfied, unmet, unverifiable and missing-information criteria.
5. Calculate or summarise the assessment outcome using approved rules.
6. Generate an assessment report and recommendation.
7. Allow an authorised reviewer to record the final decision and justification.
8. Preserve both the system assessment and human decision in the history.

### 5.2 Proposed criterion types

| Type | Intended behaviour |
|---|---|
| **Mandatory** | A required condition. A failure may prevent approval unless an explicitly authorised exception policy exists. |
| **Evaluative** | Contributes to an overall assessment and may be balanced against other evidence. |
| **Potential / Readiness** | Allows the reviewer to consider the candidate's likely contribution and ability to help complete the project. |

The exact scoring, weighting and override rules are **PENDING**. The system must not silently waive mandatory requirements.

### 5.3 Proposed assessment outcomes

| Outcome | Meaning |
|---|---|
| `QUALIFIED` | The defined qualifying requirements are met. |
| `CONDITIONALLY_QUALIFIED` | Some gaps remain, but the candidate may be considered with recorded conditions. |
| `NOT_QUALIFIED` | The candidate does not currently meet the required standard. |
| `INSUFFICIENT_DATA` | There is not enough reliable information to make an assessment. |

These are proposed assessment outcomes, not final membership decisions.

### 5.4 Separate system recommendation from human decision

**AGREED — design principle**

The engine's result and the authorised person's final decision must be stored separately.

Example:

- System recommendation: `CONDITIONALLY_QUALIFIED`
- Human decision: `APPROVED`
- Justification: candidate has relevant experience and strong potential to contribute to successful project completion.
- Conditions: complete two additional approved Activities by the agreed date.

This makes it possible to understand why a candidate was accepted despite having gaps in some evaluative criteria.

The reviewer must provide a reason when the final decision differs from the system recommendation or when conditions / exceptions are applied.

### 5.5 Assessment transparency and audit

The assessment history should retain, as applicable:

- Criteria and criteria version used.
- Evidence and Activity records considered.
- Result for each criterion.
- Missing information and identified gaps.
- Overall system recommendation.
- Reviewer and final decision.
- Decision reason and any conditions.
- Date/time of assessment and decision.

The system should make clear which findings are based on verified records and which require human verification.

## 6. Decisions and Requirements Register

### AGREED

1. Development should proceed incrementally; avoid polishing one module indefinitely while dependent workflows remain untouched.
2. Activities provide evidence for assessing a candidate's eligibility for a Takaza.
3. Eligibility assessment must consider both common criteria and criteria specific to the relevant Takaza.
4. The assessment engine should assist decision-making rather than replace authorised human judgement.
5. System assessment/recommendation and final human decision must be separate records.
6. A candidate may be approved despite some gaps where the overall case and potential contribution justify it, provided the decision and rationale are recorded and mandatory rules are respected.
7. Important decisions and membership changes should retain an audit history.

### PROPOSED

1. Introduce a dedicated Eligibility & Assessment Engine.
2. Support Mandatory, Evaluative and Potential / Readiness criterion types.
3. Use the four proposed assessment outcomes listed in Section 5.3.
4. Support conditional approval with explicit conditions and deadlines.
5. Maintain versioned criteria so historical assessments can be understood against the rules that were in force at the time.

### PENDING

1. Should criteria support a minimum number of approved Activities, a defined time period, or both? Example: at least five approved Activities within the previous six months.
2. Which criteria are mandatory and which are evaluative for each Takaza?
3. Should the engine use numeric scores/weights, rule-based recommendations, or a combination?
4. Who may perform the final eligibility decision and who may override a recommendation?
5. What conditions may be attached to conditional approval, and who monitors completion?
6. What is the complete Takaza lifecycle from draft through submission, endorsement and activation?
7. What are the detailed Project Member confirmation, suspension, withdrawal and removal workflows?

## 7. Suggested Development Sequence

The sequence below is a proposed direction and may be adjusted when dependencies become clearer.

| Step | Work item | Purpose |
|---|---|---|
| 1 | Complete essential Takaza Registration work | Keep the current module usable without excessive polishing. |
| 2 | Review and consolidate Activities workflow | Confirm Activity Types, assignment, submission and review work together correctly. |
| 3 | Define common Activity criteria | Establish reusable baseline criteria and evidence rules. |
| 4 | Define Takaza-specific criteria | Allow each Takaza to add its own requirements. |
| 5 | Design assessment data model and rules | Agree criterion types, evidence, assessment outcomes and audit requirements. |
| 6 | Implement Eligibility Assessment Engine | Generate transparent criterion-level results and recommendations. |
| 7 | Implement human review and final decision | Record approval, conditional approval or rejection with reasons. |
| 8 | Implement Project Member confirmation | Add candidates to the relevant Takaza only through the agreed decision workflow. |
| 9 | Extend member participation management | Manage membership status, progress and historical records. |

**Immediate development focus:** review and progress the Activities workflow while keeping the Takaza registration work limited to essential completion. Do not start building the assessment engine until its outstanding rules and data requirements have been agreed.

## 8. Working Rules for Future Development Sessions

- Start by checking this roadmap and the current `develop` branch.
- Confirm the actual code state before describing a feature as implemented.
- Work in small, testable increments.
- Preserve existing working functionality.
- Do not introduce database changes based only on an unapproved proposal.
- Update this roadmap when a significant decision is made or implementation status changes.
- Keep README.md as the broader workflow requirements document; use this file for development progress, decisions and next steps.

---

**Last reviewed:** 16 November 2026
**Next review:** When the Activities workflow is resumed or a pending assessment decision is resolved.
