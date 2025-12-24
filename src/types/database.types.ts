export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string
                    name: string
                    industry: string | null
                    tier: 'standard' | 'enterprise' | 'premium'
                    credits_purchased: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    industry?: string | null
                    tier?: 'standard' | 'enterprise' | 'premium'
                    credits_purchased?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    industry?: string | null
                    tier?: 'standard' | 'enterprise' | 'premium'
                    credits_purchased?: number
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    organization_id: string | null
                    email: string | null
                    full_name: string | null
                    role: 'admin' | 'editor' | 'viewer'
                    created_at: string
                }
                Insert: {
                    id: string
                    organization_id?: string | null
                    email?: string | null
                    full_name?: string | null
                    role?: 'admin' | 'editor' | 'viewer'
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string | null
                    email?: string | null
                    full_name?: string | null
                    role?: 'admin' | 'editor' | 'viewer'
                    created_at?: string
                }
            }
            compliance_checklist: {
                Row: {
                    id: string
                    organization_id: string
                    task: string
                    due_date: string
                    status: 'pending' | 'scheduled' | 'in_progress' | 'not_started' | 'completed'
                    priority: 'high' | 'medium' | 'low'
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    task: string
                    due_date: string
                    status?: 'pending' | 'scheduled' | 'in_progress' | 'not_started' | 'completed'
                    priority?: 'high' | 'medium' | 'low'
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    task?: string
                    due_date?: string
                    status?: 'pending' | 'scheduled' | 'in_progress' | 'not_started' | 'completed'
                    priority?: 'high' | 'medium' | 'low'
                    created_at?: string
                }
            }
            emissions_records: {
                Row: {
                    id: string
                    organization_id: string
                    source: string
                    type: 'Scope 1' | 'Scope 2' | 'Scope 3'
                    value: number
                    unit: string
                    status: 'verified' | 'pending' | 'rejected'
                    date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    source: string
                    type: 'Scope 1' | 'Scope 2' | 'Scope 3'
                    value: number
                    unit?: string
                    status?: 'verified' | 'pending' | 'rejected'
                    date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    source?: string
                    type?: 'Scope 1' | 'Scope 2' | 'Scope 3'
                    value?: number
                    unit?: string
                    status?: 'verified' | 'pending' | 'rejected'
                    date?: string
                    created_at?: string
                }
            }
            audits: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    date: string
                    auditor: string | null
                    type: 'Mandatory' | 'Voluntary' | 'Internal' | null
                    status: string | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    date: string
                    auditor?: string | null
                    type?: 'Mandatory' | 'Voluntary' | 'Internal' | null
                    status?: string | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    date?: string
                    auditor?: string | null
                    type?: 'Mandatory' | 'Voluntary' | 'Internal' | null
                    status?: string | null
                }
            }
            data_gaps: {
                Row: {
                    id: string
                    organization_id: string
                    source: string
                    last_update: string | null
                    severity: 'critical' | 'warning' | 'info' | null
                    resolved: boolean | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    source: string
                    last_update?: string | null
                    severity?: 'critical' | 'warning' | 'info' | null
                    resolved?: boolean | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    source?: string
                    last_update?: string | null
                    severity?: 'critical' | 'warning' | 'info' | null
                    resolved?: boolean | null
                }
            }
            anomaly_logs: {
                Row: {
                    id: string
                    organization_id: string
                    source: string
                    anomaly: string
                    timestamp: string | null
                    status: 'unresolved' | 'investigating' | 'resolved' | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    source: string
                    anomaly: string
                    timestamp?: string | null
                    status?: 'unresolved' | 'investigating' | 'resolved' | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    source?: string
                    anomaly?: string
                    timestamp?: string | null
                    status?: 'unresolved' | 'investigating' | 'resolved' | null
                }
            }
            live_feed: {
                Row: {
                    id: string
                    organization_id: string
                    message: string
                    type: 'update' | 'success' | 'warning' | 'error' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    message: string
                    type?: 'update' | 'success' | 'warning' | 'error' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    message?: string
                    type?: 'update' | 'success' | 'warning' | 'error' | null
                    created_at?: string | null
                }
            }
            forecasts: {
                Row: {
                    id: string
                    organization_id: string
                    month: string
                    actual: number | null
                    projected: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    month: string
                    actual?: number | null
                    projected: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    month?: string
                    actual?: number | null
                    projected?: number
                    created_at?: string
                }
            }
            trade_recommendations: {
                Row: {
                    id: string
                    organization_id: string
                    action: 'BUY' | 'SELL' | 'HOLD'
                    quantity: number
                    price_per_unit: number
                    confidence: number
                    rationale: string | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    action: 'BUY' | 'SELL' | 'HOLD'
                    quantity: number
                    price_per_unit: number
                    confidence: number
                    rationale?: string | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    action?: 'BUY' | 'SELL' | 'HOLD'
                    quantity?: number
                    price_per_unit?: number
                    confidence?: number
                    rationale?: string | null
                    status?: string | null
                    created_at?: string
                }
            }
            organization_impact: {
                Row: {
                    id: string
                    organization_id: string
                    trees_planted: number
                    co2_offset: number
                    water_saved: number
                    clean_energy: number
                    csr_rating: string | null
                    media_value: string | null
                    engagement_rate: string | null
                    certifications: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    trees_planted?: number
                    co2_offset?: number
                    water_saved?: number
                    clean_energy?: number
                    csr_rating?: string | null
                    media_value?: string | null
                    engagement_rate?: string | null
                    certifications?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    trees_planted?: number
                    co2_offset?: number
                    water_saved?: number
                    clean_energy?: number
                    csr_rating?: string | null
                    media_value?: string | null
                    engagement_rate?: string | null
                    certifications?: string[] | null
                    created_at?: string
                }
            }
            offset_history: {
                Row: {
                    id: string
                    organization_id: string
                    month: string
                    offset_value: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    month: string
                    offset_value: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    month?: string
                    offset_value?: number
                    created_at?: string
                }
            }
            project_verifications: {
                Row: {
                    id: string
                    organization_id: string
                    project_name: string
                    vintage: string
                    credits: number
                    status: 'verified' | 'pending' | 'in_review' | 'rejected'
                    auditor: string | null
                    last_audit: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    project_name: string
                    vintage: string
                    credits: number
                    status: 'verified' | 'pending' | 'in_review' | 'rejected'
                    auditor?: string | null
                    last_audit?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    project_name?: string
                    vintage?: string
                    credits?: number
                    status?: 'verified' | 'pending' | 'in_review' | 'rejected'
                    auditor?: string | null
                    last_audit?: string | null
                    created_at?: string
                }
            }
            registry_reconciliation: {
                Row: {
                    id: string
                    organization_id: string
                    registry_name: string
                    credits: number
                    status: 'synced' | 'pending' | 'error'
                    last_sync: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    registry_name: string
                    credits: number
                    status: 'synced' | 'pending' | 'error'
                    last_sync?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    registry_name?: string
                    credits?: number
                    status?: 'synced' | 'pending' | 'error'
                    last_sync?: string | null
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    organization_id: string
                    type: 'deposit' | 'withdraw'
                    amount: number
                    credits: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    type: 'deposit' | 'withdraw'
                    amount: number
                    credits: number
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    type?: 'deposit' | 'withdraw'
                    amount?: number
                    credits?: number
                    status?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_: string]: never
        }
        Functions: {
            [_: string]: never
        }
        Enums: {
            [_: string]: never
        }
    }
}
