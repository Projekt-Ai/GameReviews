// Minimal server-side wrapper around Supabase's PostgREST API.
const REST_PREFIX = "rest/v1";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRestUrl(path) {
  const baseUrl = getRequiredEnv("SUPABASE_URL").replace(/\/+$/, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${baseUrl}/${REST_PREFIX}/${normalizedPath}`;
}

export async function requestSupabase(path, options = {}) {
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const method = options.method || "GET";
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (method !== "GET" && !headers.Prefer) {
    // Return inserted rows so endpoint handlers can respond with the created record.
    headers.Prefer = "return=representation";
  }

  const response = await fetch(getRestUrl(path), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    const message = data?.message || `Supabase request failed with status ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
