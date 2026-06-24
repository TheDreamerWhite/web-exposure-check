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
      scan_reports: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          customer_name: string | null;
          internal_note: string | null;
          locale: string;
          score: number;
          risk_level: string;
          scan_result: Json;
          generated_report: Json;
          finding_statuses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          customer_name?: string | null;
          internal_note?: string | null;
          locale?: string;
          score: number;
          risk_level: string;
          scan_result: Json;
          generated_report: Json;
          finding_statuses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain?: string;
          customer_name?: string | null;
          internal_note?: string | null;
          locale?: string;
          score?: number;
          risk_level?: string;
          scan_result?: Json;
          generated_report?: Json;
          finding_statuses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agency_profiles: {
        Row: {
          id: string;
          user_id: string;
          agency_name: string | null;
          agency_email: string | null;
          agency_website: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agency_name?: string | null;
          agency_email?: string | null;
          agency_website?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agency_name?: string | null;
          agency_email?: string | null;
          agency_website?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
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
export type ScanReport = Database["public"]["Tables"]["scan_reports"]["Row"];
export type AgencyProfile =
  Database["public"]["Tables"]["agency_profiles"]["Row"];
