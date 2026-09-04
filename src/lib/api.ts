import type {
  Application,
  ApplicationStats,
  AuthResponse,
  Job,
  JobSearchParams,
  Paginated,
  Profile,
  SavedSearch,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'wellfound-clone.token';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    // Private-mode browsers can throw on access rather than returning null.
    return null;
  }
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable - the session simply will not persist a reload */
  }
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    // Nest returns { message: string | string[] }; flatten it into one line so
    // the UI can render whatever came back without special-casing.
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      /* non-JSON error body; keep the status text */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Serialises search params, dropping empties so the URL stays readable. */
function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (input: {
    email: string;
    password: string;
    name: string;
    headline?: string;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  me: () => request<Profile['user']>('/auth/me'),

  // --- Profile -------------------------------------------------------------

  getProfile: () => request<Profile>('/profile'),

  updateProfile: (patch: Record<string, unknown>) =>
    request<Profile>('/profile', { method: 'PATCH', body: JSON.stringify(patch) }),

  updatePreferences: (patch: Record<string, unknown>) =>
    request<Profile>('/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  updateCulture: (patch: Record<string, unknown>) =>
    request<Profile>('/profile/culture', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  setSkills: (skills: { name: string; yearsOfExperience?: number }[]) =>
    request<Profile>('/profile/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    }),

  addExperience: (input: Record<string, unknown>) =>
    request<Profile>('/profile/experiences', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateExperience: (id: string, input: Record<string, unknown>) =>
    request<Profile>(`/profile/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteExperience: (id: string) =>
    request<Profile>(`/profile/experiences/${id}`, { method: 'DELETE' }),

  addEducation: (input: Record<string, unknown>) =>
    request<Profile>('/profile/educations', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateEducation: (id: string, input: Record<string, unknown>) =>
    request<Profile>(`/profile/educations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteEducation: (id: string) =>
    request<Profile>(`/profile/educations/${id}`, { method: 'DELETE' }),

  // --- Jobs ----------------------------------------------------------------

  searchJobs: (params: JobSearchParams) =>
    request<Paginated<Job>>(`/jobs${toQuery(params as Record<string, unknown>)}`),

  getJob: (idOrSlug: string) => request<Job>(`/jobs/${idOrSlug}`),

  savedJobs: (page = 1, limit = 20) =>
    request<Paginated<Job>>(`/jobs/saved${toQuery({ page, limit })}`),

  hiddenJobs: (page = 1, limit = 20) =>
    request<Paginated<Job>>(`/jobs/hidden${toQuery({ page, limit })}`),

  saveJob: (id: string) => request<Job>(`/jobs/${id}/save`, { method: 'POST' }),
  unsaveJob: (id: string) => request<Job>(`/jobs/${id}/save`, { method: 'DELETE' }),
  hideJob: (id: string) => request<Job>(`/jobs/${id}/hide`, { method: 'POST' }),
  unhideJob: (id: string) => request<Job>(`/jobs/${id}/hide`, { method: 'DELETE' }),

  // --- Applications --------------------------------------------------------

  apply: (input: { jobId: string; coverLetter?: string }) =>
    request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  applications: (params: { statuses?: string[]; page?: number; limit?: number }) =>
    request<Paginated<Application>>(`/applications${toQuery(params)}`),

  applicationStats: () => request<ApplicationStats>('/applications/stats'),

  getApplication: (id: string) => request<Application>(`/applications/${id}`),

  withdraw: (id: string, reason?: string) =>
    request<Application>(`/applications/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // --- Saved searches ------------------------------------------------------

  savedSearches: () => request<SavedSearch[]>('/saved-searches'),

  createSavedSearch: (input: {
    name: string;
    filters: JobSearchParams;
    alertEnabled?: boolean;
  }) =>
    request<SavedSearch>('/saved-searches', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteSavedSearch: (id: string) =>
    request<{ id: string }>(`/saved-searches/${id}`, { method: 'DELETE' }),
};
