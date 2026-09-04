/**
 * Response shapes returned by wellfound-clone-api.
 *
 * Kept hand-written rather than generated so the two repos can move
 * independently; a breaking API change should show up here as a type error.
 */

export type RoleType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'COFOUNDER';

export type LocationType = 'REMOTE' | 'ONSITE' | 'HYBRID';

export type SearchStatus = 'READY_TO_INTERVIEW' | 'OPEN_TO_OFFERS' | 'CLOSED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'INTERVIEWING'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type WorkEnvironment = 'OFFICE' | 'REMOTE' | 'HYBRID' | 'NO_PREFERENCE';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  size: string | null;
  fundingStage: string | null;
  industry: string | null;
  foundedYear: number | null;
}

export interface JobLocation {
  city: string;
  country: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  yearsOfExperience?: number;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string[];
  roleType: RoleType;
  locationType: LocationType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  equityMin: number | null;
  equityMax: number | null;
  experienceMin: number;
  experienceMax: number;
  recruiterName: string | null;
  recruiterTitle: string | null;
  applicantCount: number;
  isActive: boolean;
  postedAt: string;
  company: Company;
  locations: JobLocation[];
  skills: Skill[];
  isSaved: boolean;
  hasApplied: boolean;
  applicationId: string | null;
  applicationStatus: ApplicationStatus | null;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface Education {
  id: string;
  school: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
}

export interface JobPreference {
  searchStatus: SearchStatus;
  desiredRoleTypes: RoleType[];
  desiredRoles: string[];
  desiredLocations: string[];
  desiredCompanySizes: string[];
  workAuthorization: string;
  openToRemote: boolean;
  willingToRelocate: boolean;
  desiredSalaryMin: number | null;
  currency: string;
}

export interface CultureProfile {
  lookingFor: string | null;
  workEnvironment: WorkEnvironment;
  importantFactors: string[];
  remotePolicyImportance: number;
  quietOfficeImportance: number;
  marketsInterested: string[];
  marketsExcluded: string[];
}

export interface CompletionStep {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  primaryRole: string | null;
  openToRoles: string[];
  achievements: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  resumeFileName: string | null;
  yearsOfExperience: number;
  user: AuthUser;
  experiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  preference: JobPreference | null;
  culture: CultureProfile | null;
  completion: {
    score: number;
    steps: CompletionStep[];
    missing: CompletionStep[];
  };
}

export interface ApplicationEvent {
  id: string;
  status: ApplicationStatus;
  note: string | null;
  createdAt: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeFileName: string | null;
  appliedAt: string;
  withdrawnAt: string | null;
  expiresAt: string | null;
  isArchived: boolean;
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;
  job: Job;
  events: ApplicationEvent[];
}

export interface ApplicationStats {
  total: number;
  active: number;
  archived: number;
  byStatus: Record<ApplicationStatus, number>;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: JobSearchParams;
  alertEnabled: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface JobSearchParams {
  q?: string;
  locations?: string[];
  roleTypes?: RoleType[];
  locationTypes?: LocationType[];
  companySizes?: string[];
  fundingStages?: string[];
  skills?: string[];
  salaryMin?: number;
  experience?: number;
  remoteOnly?: boolean;
  sort?: 'recommended' | 'recent' | 'salary';
  page?: number;
  limit?: number;
}
