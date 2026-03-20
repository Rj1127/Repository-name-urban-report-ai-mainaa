export type UserRole = 'citizen' | 'admin' | 'resolver';

export type ComplaintStatus = 'new' | 'assigned' | 'in_progress' | 'resolved';

export type IssueType = 'pothole' | 'garbage' | 'blocked_drain' | 'road_damage' | 'waterlogging' | 'other';

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
}

export interface Complaint {
  id: string;
  user_id: string;
  issue_type: IssueType;
  description: string;
  image_url: string | null;
  resolution_image_url: string | null;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  created_at: string;
  profiles?: Profile;
}

export interface Assignment {
  id: string;
  complaint_id: string;
  resolver_id: string;
  assigned_at: string;
  status: string;
  complaints?: Complaint;
}

export interface AiDetection {
  id: string;
  complaint_id: string;
  detected_issue: IssueType;
  confidence_score: number;
}
