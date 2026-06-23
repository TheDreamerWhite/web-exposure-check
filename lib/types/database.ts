export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MonitoringFrequency = "manual" | "weekly" | "monthly";
export type DomainStatus = "active" | "paused";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      domains: {
        Row: {
          id: string;
          organization_id: string;
          domain: string;
          monitoring_frequency: MonitoringFrequency;
          authorization_confirmed: boolean;
          status: DomainStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          domain: string;
          monitoring_frequency?: MonitoringFrequency;
          authorization_confirmed?: boolean;
          status?: DomainStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          domain?: string;
          monitoring_frequency?: MonitoringFrequency;
          authorization_confirmed?: boolean;
          status?: DomainStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scan_results: {
        Row: {
          id: string;
          domain_id: string;
          organization_id: string;
          domain: string;
          score: number;
          risk_level: string;
          checks: Json;
          scanned_at: string;
        };
        Insert: {
          id?: string;
          domain_id: string;
          organization_id: string;
          domain: string;
          score: number;
          risk_level: string;
          checks: Json;
          scanned_at?: string;
        };
        Update: {
          id?: string;
          domain_id?: string;
          organization_id?: string;
          domain?: string;
          score?: number;
          risk_level?: string;
          checks?: Json;
          scanned_at?: string;
        };
        Relationships: [];
      };
      findings: {
        Row: {
          id: string;
          scan_result_id: string;
          domain_id: string;
          organization_id: string;
          check_key: string;
          status: string;
          severity: string;
          title: string;
          description: string | null;
          suggested_fix: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_result_id: string;
          domain_id: string;
          organization_id: string;
          check_key: string;
          status: string;
          severity?: string;
          title: string;
          description?: string | null;
          suggested_fix?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_result_id?: string;
          domain_id?: string;
          organization_id?: string;
          check_key?: string;
          status?: string;
          severity?: string;
          title?: string;
          description?: string | null;
          suggested_fix?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];
export type Domain = Database["public"]["Tables"]["domains"]["Row"];
export type ScanResult = Database["public"]["Tables"]["scan_results"]["Row"];
export type Finding = Database["public"]["Tables"]["findings"]["Row"];
