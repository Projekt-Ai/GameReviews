import { z } from "zod";
import { requestSupabase } from "./supabase.js";

// Matches the current table shape. If you rename the column to `thread_id`,
// update this constant and the rest of the module keeps working.
const THREAD_COLUMN = "thread";
const COMMENT_COLUMNS = ["id", "parent_id", THREAD_COLUMN, "name", "body", "created_at"];

const threadSchema = z.string().trim().min(1).max(160);

const createCommentSchema = z.object({
  thread: threadSchema,
  name: z.string().trim().min(1).max(50),
  body: z.string().trim().min(1).max(1200),
  parentId: z.string().uuid().nullable().optional(),
});

function normalizeComment(row) {
  return {
    id: row.id,
    parentId: row.parent_id ?? null,
    thread: row[THREAD_COLUMN],
    name: row.name,
    body: row.body,
    createdAt: row.created_at,
    replies: [],
  };
}

function buildCommentTree(rows) {
  const byId = new Map();
  const roots = [];

  for (const row of rows) {
    const comment = normalizeComment(row);
    byId.set(comment.id, comment);

    if (!comment.parentId) {
      roots.push(comment);
      continue;
    }

    const parent = byId.get(comment.parentId);
    if (parent) {
      parent.replies.push(comment);
      continue;
    }

    // If a parent row is missing, fail open and keep the orphaned comment visible.
    roots.push(comment);
  }

  return roots;
}

export async function listCommentsByThread(rawThread) {
  const thread = threadSchema.parse(rawThread);
  const params = new URLSearchParams({
    [THREAD_COLUMN]: `eq.${thread}`,
    is_approved: "eq.true",
    select: COMMENT_COLUMNS.join(","),
    order: "created_at.asc",
  });

  const rows = await requestSupabase(`comments?${params.toString()}`);
  const comments = buildCommentTree(Array.isArray(rows) ? rows : []);

  return {
    comments,
    totalCount: Array.isArray(rows) ? rows.length : 0,
  };
}

export async function createComment(rawInput) {
  const parsed = createCommentSchema.parse(rawInput);
  const insertRow = {
    [THREAD_COLUMN]: parsed.thread,
    name: parsed.name,
    body: parsed.body,
    parent_id: parsed.parentId ?? null,
    is_approved: false,
  };

  const params = new URLSearchParams({
    select: COMMENT_COLUMNS.join(","),
  });

  const rows = await requestSupabase(`comments?${params.toString()}`, {
    method: "POST",
    body: insertRow,
  });

  const createdRow = Array.isArray(rows) ? rows[0] : null;
  if (!createdRow) {
    throw new Error("Supabase did not return the created comment row.");
  }

  return normalizeComment(createdRow);
}
