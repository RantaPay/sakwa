export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string;
          is_active: boolean;
          primary_role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email: string;
          is_active?: boolean;
          primary_role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["warehouses"]["Insert"]>;
      };
      warehouse_staff: {
        Row: {
          id: string;
          warehouse_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["warehouse_staff"]["Insert"]>;
      };
      agent_cash_advances: {
        Row: {
          id: string;
          agent_id: string;
          amount_kobo: number;
          advanced_on: string;
          notes: string | null;
          recorded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          agent_id: string;
          amount_kobo: number;
          advanced_on: string;
          notes?: string | null;
          recorded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_cash_advances"]["Insert"]>;
      };
      agent_deliveries: {
        Row: {
          id: string;
          agent_id: string;
          warehouse_id: string;
          bag_count: number;
          kg_per_bag: string;
          amount_spent_kobo: number;
          delivered_on: string;
          notes: string | null;
          status: string;
          rejection_reason: string | null;
          confirmed_by: string | null;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          agent_id: string;
          warehouse_id: string;
          bag_count: number;
          kg_per_bag: string;
          amount_spent_kobo: number;
          delivered_on: string;
          notes?: string | null;
          status?: string;
          rejection_reason?: string | null;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_deliveries"]["Insert"]>;
      };
      stock_movements: {
        Row: {
          id: string;
          warehouse_id: string;
          direction: string;
          bag_count: number;
          total_kg: string;
          delivery_id: string | null;
          order_id: string | null;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id: string;
          warehouse_id: string;
          direction: string;
          bag_count: number;
          total_kg: string;
          delivery_id?: string | null;
          order_id?: string | null;
          recorded_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          warehouse_id: string | null;
          bag_count: number;
          kg_per_bag: string;
          price_per_bag_kobo: number;
          status: string;
          delivery_details: string;
          notes: string | null;
          dispatched_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          customer_id: string;
          warehouse_id?: string | null;
          bag_count: number;
          kg_per_bag: string;
          price_per_bag_kobo: number;
          status?: string;
          delivery_details: string;
          notes?: string | null;
          dispatched_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      customer_payments: {
        Row: {
          id: string;
          order_id: string;
          amount_kobo: number;
          recorded_by: string;
          confirmed_by: string | null;
          confirmed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          order_id: string;
          amount_kobo: number;
          recorded_by: string;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customer_payments"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          direction: string;
          amount_kobo: number;
          occurred_on: string;
          category: string;
          description: string;
          recorded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          direction: string;
          amount_kobo: number;
          occurred_on: string;
          category: string;
          description: string;
          recorded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      investments: {
        Row: {
          id: string;
          investor_id: string;
          amount_kobo: number;
          invested_on: string;
          notes: string | null;
          recorded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          investor_id: string;
          amount_kobo: number;
          invested_on: string;
          notes?: string | null;
          recorded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["investments"]["Insert"]>;
      };
      investor_returns: {
        Row: {
          id: string;
          investor_id: string;
          cycle_start: string;
          cycle_end: string;
          amount_kobo: number;
          formula_kind: string;
          created_at: string;
        };
        Insert: {
          id: string;
          investor_id: string;
          cycle_start: string;
          cycle_end: string;
          amount_kobo: number;
          formula_kind: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["investor_returns"]["Insert"]>;
      };
      withdrawal_requests: {
        Row: {
          id: string;
          investor_id: string;
          amount_kobo: number;
          cycle_start: string;
          status: string;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          paid_by: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          investor_id: string;
          amount_kobo: number;
          cycle_start: string;
          status?: string;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          paid_by?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["withdrawal_requests"]["Insert"]>;
      };
      investor_enquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          intended_amount_naira: string | null;
          message: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          intended_amount_naira?: string | null;
          message: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["investor_enquiries"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          kind: string;
          entity_table: string | null;
          entity_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          kind: string;
          entity_table?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      enquiry_rate_limits: {
        Row: {
          id: string;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_hash: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiry_rate_limits"]["Insert"]>;
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string;
          row_id: string;
          action: string;
          actor_id: string | null;
          before_value: Json | null;
          after_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          row_id: string;
          action: string;
          actor_id?: string | null;
          before_value?: Json | null;
          after_value?: Json | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      agent_balances: {
        Row: {
          agent_id: string;
          advanced_kobo: number;
          spent_kobo: number;
          balance_kobo: number;
        };
      };
      warehouse_stock: {
        Row: {
          warehouse_id: string;
          bags_in: number;
          bags_out: number;
          bags_on_hand: number;
          kg_in: string;
          kg_out: string;
          kg_on_hand: string;
        };
      };
      investor_positions: {
        Row: {
          investor_id: string;
          capital_kobo: number;
          returns_kobo: number;
          withdrawn_or_pending_kobo: number;
          withdrawable_kobo: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
