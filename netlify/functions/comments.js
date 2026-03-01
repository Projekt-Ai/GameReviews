import { ZodError } from "zod";
import { createComment, listCommentsByThread } from "../../src/server/comments-api.js";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getErrorMessage(error) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || "Request validation failed.";
  }
  return error?.message || "Unexpected error.";
}

export async function handler(event) {
  try {
    if (event.httpMethod === "GET") {
      const thread = event.queryStringParameters?.thread;
      const payload = await listCommentsByThread(thread);
      return json(200, payload);
    }

    if (event.httpMethod === "POST") {
      let body = {};

      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return json(400, { error: "Request body must be valid JSON." });
      }

      const comment = await createComment(body);
      return json(201, {
        message: "Comment submitted.",
        comment,
      });
    }

    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          Allow: "GET, POST, OPTIONS",
        },
      };
    }

    return json(405, { error: "Method not allowed." });
  } catch (error) {
    const statusCode =
      error instanceof ZodError ? 400 : Number(error?.statusCode) || 500;

    return json(statusCode, {
      error: getErrorMessage(error),
    });
  }
}
