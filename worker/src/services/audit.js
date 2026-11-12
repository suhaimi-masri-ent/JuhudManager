import { getRequestMetadata } from "./request-metadata.js";

export async function writeAudit(
  env,
  userId,
  action,
  details = {},
  targetId = userId,
  request = null
) {
  const client = request
    ? await getRequestMetadata(request)
    : null;

  const auditDetails = client
    ? {
        ...details,
        client
      }
    : details;

  await env.DB.prepare(`
    INSERT INTO audit_logs (
      audit_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      details_json
    )
    VALUES (?, ?, ?, 'USER', ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    action,
    targetId,
    JSON.stringify(auditDetails)
  ).run();
}
