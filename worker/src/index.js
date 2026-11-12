import {
  jsonResponse,
  corsHeaders,
  addCors
} from "./core/response.js";

// AUTH HANDLERS
import {
  loginHandler,
  meHandler,
  logoutHandler
} from "./handlers/auth.js";

// PROFILE HANDLER
import {
  profileHandler
} from "./handlers/profile.js";

// ADMIN USER HANDLERS
import {
  adminUsersHandler,
  adminUserProfileHandler,
  createUserHandler
} from "./handlers/admin-users.js";

// ACTIVITY HANDLERS
import {
  adminActivityTypesHandler
} from "./handlers/activity-types.js";

import {
  activitiesHandler
} from "./handlers/activities.js";

// SUBMISSION HANDLERS
import {
  adminSubmissionsHandler,
  adminReviewSubmissionHandler
} from "./handlers/submissions.js";

// AUDIT LOG HANDLER
import {
  adminAuditLogsHandler
} from "./handlers/audit-logs.js";

// ADMIN ASSIGNMENT HANDLER
import {
  adminAssignmentsHandler
} from "./handlers/assignments.js";

export default {
  async fetch(request, env) {
    const headers = corsHeaders(env);

    // CORS PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    let response;

    try {

      // =========================
      // HEALTH CHECK
      // =========================

      if (
        path === "/health" &&
        method === "GET"
      ) {
        const result = await env.DB.prepare(`
          SELECT COUNT(*) AS total
          FROM sqlite_master
          WHERE type = 'table'
        `).first();

        response = jsonResponse({
          status: "ok",
          service: "juhudmanager-api",
          database: "connected",
          tables: result.total
        });

      }

      // =========================
      // AUTHENTICATION
      // =========================

      else if (
        path === "/api/auth/login" &&
        method === "POST"
      ) {
        response = await loginHandler(request, env);
      }

      else if (
        path === "/api/auth/me" &&
        method === "GET"
      ) {
        response = await meHandler(request, env);
      }

      else if (
        path === "/api/auth/logout" &&
        method === "POST"
      ) {
        response = await logoutHandler(request, env);
      }

      // =========================
      // USER PROFILE
      // =========================

      else if (
        path === "/api/profile" &&
        ["GET", "PUT"].includes(method)
      ) {
        response = await profileHandler(request, env);
      }

      // =========================
      // ADMIN USER PROFILE
      // =========================

      else if (
        /^\/api\/admin\/users\/[^/]+\/profile$/.test(path) &&
        ["GET", "PUT"].includes(method)
      ) {
        const userId = decodeURIComponent(
          path.split("/")[4]
        );

        response = await adminUserProfileHandler(
          request,
          env,
          userId
        );
      }

      // =========================
      // ADMIN USERS
      // =========================

      else if (
        path === "/api/admin/users" &&
        method === "GET"
      ) {
        response = await adminUsersHandler(request, env);
      }

      else if (
        path === "/api/admin/users" &&
        method === "POST"
      ) {
        response = await createUserHandler(request, env);
      }

      // =========================
      // ADMIN ACTIVITY TYPES
      // =========================

      else if (
        path === "/api/admin/activity-types" &&
        ["GET", "POST"].includes(method)
      ) {
        response = await adminActivityTypesHandler(
          request,
          env
        );
      }


      // =========================
      // ADMIN ASSIGNMENTS
      // =========================
      
      else if (
        path === "/api/admin/assignments" &&
        ["GET", "POST"].includes(method)
      ) {
        response = await adminAssignmentsHandler(
          request,
          env
        );
      }        
        
      // =========================
      // USER ACTIVITIES
      // =========================

      else if (
        path === "/api/activities" &&
        ["GET", "POST"].includes(method)
      ) {
        response = await activitiesHandler(
          request,
          env
        );
      }

      // =========================
      // ADMIN SUBMISSIONS
      // =========================

      else if (
        path === "/api/admin/submissions" &&
        method === "GET"
      ) {
        response = await adminSubmissionsHandler(
          request,
          env
        );
      }

      // =========================
      // REVIEW SUBMISSION
      // =========================

      else if (
        /^\/api\/admin\/submissions\/[^/]+$/.test(path) &&
        method === "PATCH"
      ) {
        const recordId = decodeURIComponent(
          path.split("/").pop()
        );

        response = await adminReviewSubmissionHandler(
          request,
          env,
          recordId
        );
      }

      // =========================
      // ADMIN AUDIT LOGS
      // =========================

      else if (
        path === "/api/admin/audit-logs" &&
        method === "GET"
      ) {
        response = await adminAuditLogsHandler(
          request,
          env
        );
      }

      // =========================
      // NOT FOUND
      // =========================

      else {
        response = jsonResponse({
          error: "Not Found",
          path,
          method,
          service: "juhudmanager-api"
        }, 404);
      }

    } catch (error) {
      console.error(
        "API error:",
        error?.message || String(error)
      );

      response = jsonResponse({
        error: "Internal server error"
      }, 500);
    }

    return addCors(response, headers);
  }
};
