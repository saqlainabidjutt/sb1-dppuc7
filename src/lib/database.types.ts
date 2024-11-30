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
      sales: {
        Row: {
          id: number
          user_id: number
          company_id: number
          date: string
          platform: string
          card_payments: string
          cash_payments: string
          total_sale: string
          notes: string | null
          last_modified_by: number
          last_modified_by_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          company_id: number
          date: string
          platform: string
          card_payments: string
          cash_payments: string
          total_sale: string
          notes?: string | null
          last_modified_by: number
          last_modified_by_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          company_id?: number
          date?: string
          platform?: string
          card_payments?: string
          cash_payments?: string
          total_sale?: string
          notes?: string | null
          last_modified_by?: number
          last_modified_by_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Other tables remain the same...
    }
    // Rest of the interface remains the same...
  }
}