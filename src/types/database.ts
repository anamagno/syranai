/**
 * Database types for supabase-js, generated from the schema export.
 * Replace with the official output when you can:  npm run gen:types
 * (same shape, so the rest of the code keeps working).
 * Enums marked "open" accept any string until real values are generated.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      app_versions: {
        Row: {
          legacy_id: string | null;
          id: string;
          version: string;
          title: string | null;
          notes: string | null;
          released_by_id: string | null;
          released_at: string;
          is_current: boolean;
          target_roles: Database["public"]["Enums"]["user_role"][] | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          version: string;
          title?: string | null;
          notes?: string | null;
          released_by_id?: string | null;
          released_at?: string;
          is_current?: boolean;
          target_roles?: Database["public"]["Enums"]["user_role"][] | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          version?: string;
          title?: string | null;
          notes?: string | null;
          released_by_id?: string | null;
          released_at?: string;
          is_current?: boolean;
          target_roles?: Database["public"]["Enums"]["user_role"][] | null;
        };
        Relationships: [
        ];
      };
      app_settings: {
        Row: {
          legacy_id: string | null;
          id: string;
          created_at: string;
          current_version: string | null;
          occurrences: string[];
          languages: string[];
          satisfaction_form_url: string | null;
          google_review_url: string | null;
          singleton: boolean;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          created_at?: string;
          current_version?: string | null;
          occurrences?: string[];
          languages?: string[];
          satisfaction_form_url?: string | null;
          google_review_url?: string | null;
          singleton?: boolean;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          created_at?: string;
          current_version?: string | null;
          occurrences?: string[];
          languages?: string[];
          satisfaction_form_url?: string | null;
          google_review_url?: string | null;
          singleton?: boolean;
        };
        Relationships: [
        ];
      };
      legal_documents: {
        Row: {
          legacy_id: string | null;
          id: string;
          document_type: string;
          url: string;
          created_by_id: string | null;
          is_active: boolean;
          created_at: string;
          version: string;
          lang: Database["public"]["Enums"]["system_language"];
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          document_type: string;
          url: string;
          created_by_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          version?: string;
          lang: Database["public"]["Enums"]["system_language"];
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          document_type?: string;
          url?: string;
          created_by_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          version?: string;
          lang?: Database["public"]["Enums"]["system_language"];
        };
        Relationships: [
          { foreignKeyName: "legal_documents_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      calendar_events: {
        Row: {
          legacy_id: string | null;
          created_by_id: string | null;
          id: string;
          date: string;
          description: string | null;
          user_id: string | null;
          created_at: string;
          type: Database["public"]["Enums"]["calendar_event_type"];
        };
        Insert: {
          legacy_id?: string | null;
          created_by_id?: string | null;
          id?: string;
          date: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          type: Database["public"]["Enums"]["calendar_event_type"];
        };
        Update: {
          legacy_id?: string | null;
          created_by_id?: string | null;
          id?: string;
          date?: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          type?: Database["public"]["Enums"]["calendar_event_type"];
        };
        Relationships: [
          { foreignKeyName: "calendar_events_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      invites: {
        Row: {
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["invite_status"];
          legacy_id: string | null;
          id: string;
          email: string;
          invited_by_id: string;
          name: string | null;
          phone: string | null;
          country: string | null;
          doctor_code: string | null;
          clinic_name: string | null;
          company_name: string | null;
          special_request: string | null;
          distributor_id: string | null;
          is_old_user: boolean;
          created_at: string;
        };
        Insert: {
          role: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          legacy_id?: string | null;
          id?: string;
          email: string;
          invited_by_id?: string;
          name?: string | null;
          phone?: string | null;
          country?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          company_name?: string | null;
          special_request?: string | null;
          distributor_id?: string | null;
          is_old_user?: boolean;
          created_at?: string;
        };
        Update: {
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          legacy_id?: string | null;
          id?: string;
          email?: string;
          invited_by_id?: string;
          name?: string | null;
          phone?: string | null;
          country?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          company_name?: string | null;
          special_request?: string | null;
          distributor_id?: string | null;
          is_old_user?: boolean;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "invites_distributor_id_fkey"; columns: ["distributor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "invites_invited_by_id_fkey"; columns: ["invited_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      machines: {
        Row: {
          legacy_id: string | null;
          id: string;
          name: string;
          model: string;
          serial_number: string | null;
          station: string | null;
          operator_id: string | null;
          duration_hours: number | null;
          is_supervised: boolean;
          process_parameters: Json | null;
          created_at: string;
          description: string | null;
          is_active: boolean;
          created_by_id: string | null;
          status: Database["public"]["Enums"]["machine_status"] | null;
          updated_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          name: string;
          model: string;
          serial_number?: string | null;
          station?: string | null;
          operator_id?: string | null;
          duration_hours?: number | null;
          is_supervised?: boolean;
          process_parameters?: Json | null;
          created_at?: string;
          description?: string | null;
          is_active?: boolean;
          created_by_id?: string | null;
          status?: Database["public"]["Enums"]["machine_status"] | null;
          updated_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          name?: string;
          model?: string;
          serial_number?: string | null;
          station?: string | null;
          operator_id?: string | null;
          duration_hours?: number | null;
          is_supervised?: boolean;
          process_parameters?: Json | null;
          created_at?: string;
          description?: string | null;
          is_active?: boolean;
          created_by_id?: string | null;
          status?: Database["public"]["Enums"]["machine_status"] | null;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "machines_operator_id_fkey"; columns: ["operator_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "machines_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      machines_history: {
        Row: {
          legacy_id: string | null;
          id: string;
          machine_id: string;
          event_type: Database["public"]["Enums"]["machine_events"];
          record: string | null;
          running_orders: string[] | null;
          running_tasks: string[] | null;
          parameters: Json | null;
          duration_hours: number | null;
          recorded_by_id: string | null;
          created_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          machine_id: string;
          event_type: Database["public"]["Enums"]["machine_events"];
          record?: string | null;
          running_orders?: string[] | null;
          running_tasks?: string[] | null;
          parameters?: Json | null;
          duration_hours?: number | null;
          recorded_by_id?: string | null;
          created_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          machine_id?: string;
          event_type?: Database["public"]["Enums"]["machine_events"];
          record?: string | null;
          running_orders?: string[] | null;
          running_tasks?: string[] | null;
          parameters?: Json | null;
          duration_hours?: number | null;
          recorded_by_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "machines_history_machine_id_fkey"; columns: ["machine_id"]; isOneToOne: false; referencedRelation: "machines"; referencedColumns: ["id"] },
        ];
      };
      messages: {
        Row: {
          is_pinned: boolean;
          legacy_id: string | null;
          is_read: boolean;
          to_user_id: string | null;
          id: string;
          type: Database["public"]["Enums"]["message_type"];
          order_id: string | null;
          task_id: string | null;
          from_department: string;
          from_user_id: string | null;
          tagged_department: string | null;
          reply_to_message_id: string | null;
          subject: string | null;
          body: string;
          is_deleted: boolean;
          sent_at: string;
        };
        Insert: {
          is_pinned?: boolean;
          legacy_id?: string | null;
          is_read?: boolean;
          to_user_id?: string | null;
          id?: string;
          type: Database["public"]["Enums"]["message_type"];
          order_id?: string | null;
          task_id?: string | null;
          from_department: string;
          from_user_id?: string | null;
          tagged_department?: string | null;
          reply_to_message_id?: string | null;
          subject?: string | null;
          body: string;
          is_deleted?: boolean;
          sent_at?: string;
        };
        Update: {
          is_pinned?: boolean;
          legacy_id?: string | null;
          is_read?: boolean;
          to_user_id?: string | null;
          id?: string;
          type?: Database["public"]["Enums"]["message_type"];
          order_id?: string | null;
          task_id?: string | null;
          from_department?: string;
          from_user_id?: string | null;
          tagged_department?: string | null;
          reply_to_message_id?: string | null;
          subject?: string | null;
          body?: string;
          is_deleted?: boolean;
          sent_at?: string;
        };
        Relationships: [
          { foreignKeyName: "messages_to_user_id_fkey"; columns: ["to_user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_reply_to_message_id_fkey"; columns: ["reply_to_message_id"]; isOneToOne: false; referencedRelation: "messages"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "order_tasks"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_from_user_id_fkey"; columns: ["from_user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      notifications: {
        Row: {
          event: Database["public"]["Enums"]["notification_event"];
          is_read: boolean;
          legacy_id: string | null;
          to_user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          order_id: string | null;
          task_id: string | null;
          subject: string | null;
          body: string;
          id: string;
          is_deleted: boolean;
          sent_at: string;
          from_user_id: string | null;
        };
        Insert: {
          event: Database["public"]["Enums"]["notification_event"];
          is_read?: boolean;
          legacy_id?: string | null;
          to_user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          order_id?: string | null;
          task_id?: string | null;
          subject?: string | null;
          body: string;
          id?: string;
          is_deleted?: boolean;
          sent_at?: string;
          from_user_id?: string | null;
        };
        Update: {
          event?: Database["public"]["Enums"]["notification_event"];
          is_read?: boolean;
          legacy_id?: string | null;
          to_user_id?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          order_id?: string | null;
          task_id?: string | null;
          subject?: string | null;
          body?: string;
          id?: string;
          is_deleted?: boolean;
          sent_at?: string;
          from_user_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "notifications_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "order_tasks"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_to_user_id_fkey"; columns: ["to_user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      files: {
        Row: {
          legacy_id: string | null;
          original_name: string;
          id: string;
          display_name: string | null;
          url: string;
          order_id: string;
          task_id: string | null;
          uploaded_by_id: string | null;
          is_visible_to_doctor: boolean;
          created_at: string;
          type: Database["public"]["Enums"]["file_type"];
        };
        Insert: {
          legacy_id?: string | null;
          original_name: string;
          id?: string;
          display_name?: string | null;
          url: string;
          order_id: string;
          task_id?: string | null;
          uploaded_by_id?: string | null;
          is_visible_to_doctor?: boolean;
          created_at?: string;
          type: Database["public"]["Enums"]["file_type"];
        };
        Update: {
          legacy_id?: string | null;
          original_name?: string;
          id?: string;
          display_name?: string | null;
          url?: string;
          order_id?: string;
          task_id?: string | null;
          uploaded_by_id?: string | null;
          is_visible_to_doctor?: boolean;
          created_at?: string;
          type?: Database["public"]["Enums"]["file_type"];
        };
        Relationships: [
          { foreignKeyName: "files_uploaded_by_id_fkey"; columns: ["uploaded_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "files_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "files_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "order_tasks"; referencedColumns: ["id"] },
        ];
      };
      order_requests: {
        Row: {
          legacy_id: string | null;
          id: string;
          description: string;
          order_id: string;
          created_by_id: string | null;
          created_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          description: string;
          order_id: string;
          created_by_id?: string | null;
          created_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          description?: string;
          order_id?: string;
          created_by_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "order_requests_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "order_requests_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
        ];
      };
      preregistered_orders: {
        Row: {
          payment: Database["public"]["Enums"]["payment"] | null;
          lote: string;
          id: string;
          number: string;
          product_name: string;
          doctor_email: string;
          patient_name: string | null;
          billing_name: string | null;
          billing_vat: string | null;
          billing_address: string | null;
          shipping_name: string | null;
          shipping_address: string | null;
          restoration_area: string | null;
          legacy_id: string | null;
          created_at: string;
          notes: string | null;
          created_date: string | null;
          surgery_date: string | null;
          end_date: string | null;
          is_integrated: boolean;
          status: Database["public"]["Enums"]["order_status"] | null;
          priority: Database["public"]["Enums"]["priority"] | null;
        };
        Insert: {
          payment?: Database["public"]["Enums"]["payment"] | null;
          lote: string;
          id?: string;
          number: string;
          product_name: string;
          doctor_email: string;
          patient_name?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          shipping_name?: string | null;
          shipping_address?: string | null;
          restoration_area?: string | null;
          legacy_id?: string | null;
          created_at?: string;
          notes?: string | null;
          created_date?: string | null;
          surgery_date?: string | null;
          end_date?: string | null;
          is_integrated?: boolean;
          status?: Database["public"]["Enums"]["order_status"] | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
        };
        Update: {
          payment?: Database["public"]["Enums"]["payment"] | null;
          lote?: string;
          id?: string;
          number?: string;
          product_name?: string;
          doctor_email?: string;
          patient_name?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          shipping_name?: string | null;
          shipping_address?: string | null;
          restoration_area?: string | null;
          legacy_id?: string | null;
          created_at?: string;
          notes?: string | null;
          created_date?: string | null;
          surgery_date?: string | null;
          end_date?: string | null;
          is_integrated?: boolean;
          status?: Database["public"]["Enums"]["order_status"] | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
        };
        Relationships: [
        ];
      };
      preregistered_users: {
        Row: {
          legacy_id: string | null;
          id: string;
          name: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          phone: string | null;
          doctor_code: string | null;
          clinic_name: string | null;
          address: string | null;
          zip_code: string | null;
          city: string | null;
          tax_number: string | null;
          country: string | null;
          company_name: string | null;
          special_request: string | null;
          is_invited: boolean;
          created_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          name: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          phone?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          address?: string | null;
          zip_code?: string | null;
          city?: string | null;
          tax_number?: string | null;
          country?: string | null;
          company_name?: string | null;
          special_request?: string | null;
          is_invited?: boolean;
          created_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          name?: string;
          email?: string;
          role?: Database["public"]["Enums"]["user_role"];
          phone?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          address?: string | null;
          zip_code?: string | null;
          city?: string | null;
          tax_number?: string | null;
          country?: string | null;
          company_name?: string | null;
          special_request?: string | null;
          is_invited?: boolean;
          created_at?: string;
        };
        Relationships: [
        ];
      };
      orders: {
        Row: {
          legacy_id: string | null;
          association_id: string | null;
          delivered_at: string | null;
          client_company_name: string | null;
          restoration_area: Json | null;
          jaw: Database["public"]["Enums"]["jaw"] | null;
          id: string;
          ordered_by_id: string | null;
          lote: string;
          number: number;
          product_id: string;
          product_version: string | null;
          accessibility: Database["public"]["Enums"]["accessibility"];
          patient_name: string | null;
          doctor_id: string | null;
          unregistered_doctor_name: string | null;
          unregistered_doctor_code: string | null;
          client_doctor_name: string | null;
          distributor_id: string | null;
          billing_name: string | null;
          billing_vat: string | null;
          billing_address: string | null;
          shipping_name: string | null;
          shipping_address: string | null;
          porosity: number | null;
          breaking_line: boolean | null;
          cancelled_at: string | null;
          notes: string | null;
          payment: Database["public"]["Enums"]["payment"] | null;
          delivery: Database["public"]["Enums"]["delivery"] | null;
          surgery_date: string | null;
          expected_completion_date: string | null;
          end_date: string | null;
          cancelled_by_id: string | null;
          expected_completion_confirmed: boolean;
          material: string[] | null;
          status: Database["public"]["Enums"]["order_status"];
          priority: Database["public"]["Enums"]["priority"];
          created_at: string;
          request_cancel: boolean;
          is_old_order: boolean;
          is_integrated: boolean;
          is_test: boolean;
          paid_at: string | null;
          updated_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          association_id?: string | null;
          delivered_at?: string | null;
          client_company_name?: string | null;
          restoration_area?: Json | null;
          jaw?: Database["public"]["Enums"]["jaw"] | null;
          id?: string;
          ordered_by_id?: string | null;
          lote: string;
          number: number;
          product_id: string;
          product_version?: string | null;
          accessibility: Database["public"]["Enums"]["accessibility"];
          patient_name?: string | null;
          doctor_id?: string | null;
          unregistered_doctor_name?: string | null;
          unregistered_doctor_code?: string | null;
          client_doctor_name?: string | null;
          distributor_id?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          shipping_name?: string | null;
          shipping_address?: string | null;
          porosity?: number | null;
          breaking_line?: boolean | null;
          cancelled_at?: string | null;
          notes?: string | null;
          payment?: Database["public"]["Enums"]["payment"] | null;
          delivery?: Database["public"]["Enums"]["delivery"] | null;
          surgery_date?: string | null;
          expected_completion_date?: string | null;
          end_date?: string | null;
          cancelled_by_id?: string | null;
          expected_completion_confirmed?: boolean;
          material?: string[] | null;
          status?: Database["public"]["Enums"]["order_status"];
          priority?: Database["public"]["Enums"]["priority"];
          created_at?: string;
          request_cancel?: boolean;
          is_old_order?: boolean;
          is_integrated?: boolean;
          is_test?: boolean;
          paid_at?: string | null;
          updated_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          association_id?: string | null;
          delivered_at?: string | null;
          client_company_name?: string | null;
          restoration_area?: Json | null;
          jaw?: Database["public"]["Enums"]["jaw"] | null;
          id?: string;
          ordered_by_id?: string | null;
          lote?: string;
          number?: number;
          product_id?: string;
          product_version?: string | null;
          accessibility?: Database["public"]["Enums"]["accessibility"];
          patient_name?: string | null;
          doctor_id?: string | null;
          unregistered_doctor_name?: string | null;
          unregistered_doctor_code?: string | null;
          client_doctor_name?: string | null;
          distributor_id?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          shipping_name?: string | null;
          shipping_address?: string | null;
          porosity?: number | null;
          breaking_line?: boolean | null;
          cancelled_at?: string | null;
          notes?: string | null;
          payment?: Database["public"]["Enums"]["payment"] | null;
          delivery?: Database["public"]["Enums"]["delivery"] | null;
          surgery_date?: string | null;
          expected_completion_date?: string | null;
          end_date?: string | null;
          cancelled_by_id?: string | null;
          expected_completion_confirmed?: boolean;
          material?: string[] | null;
          status?: Database["public"]["Enums"]["order_status"];
          priority?: Database["public"]["Enums"]["priority"];
          created_at?: string;
          request_cancel?: boolean;
          is_old_order?: boolean;
          is_integrated?: boolean;
          is_test?: boolean;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "orders_doctor_id_fkey"; columns: ["doctor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_distributor_id_fkey"; columns: ["distributor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_association_id_fkey"; columns: ["association_id"]; isOneToOne: false; referencedRelation: "order_associations"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_ordered_by_id_fkey"; columns: ["ordered_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      products: {
        Row: {
          legacy_id: string | null;
          id: string;
          name: string;
          lote_indicator: string | null;
          accessibility: Database["public"]["Enums"]["accessibility"];
          image_url: string | null;
          description_pt: string | null;
          description_en: string | null;
          udi_di: string | null;
          created_by_id: string | null;
          sterilization_label_template_url: string | null;
          production_label_fields: string[] | null;
          surgical_protocols: Json | null;
          ifu_docs: Json | null;
          is_active: boolean;
          created_at: string;
          restoration_area: Database["public"]["Enums"]["restoration_area"] | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          name: string;
          lote_indicator?: string | null;
          accessibility: Database["public"]["Enums"]["accessibility"];
          image_url?: string | null;
          description_pt?: string | null;
          description_en?: string | null;
          udi_di?: string | null;
          created_by_id?: string | null;
          sterilization_label_template_url?: string | null;
          production_label_fields?: string[] | null;
          surgical_protocols?: Json | null;
          ifu_docs?: Json | null;
          is_active?: boolean;
          created_at?: string;
          restoration_area?: Database["public"]["Enums"]["restoration_area"] | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          name?: string;
          lote_indicator?: string | null;
          accessibility?: Database["public"]["Enums"]["accessibility"];
          image_url?: string | null;
          description_pt?: string | null;
          description_en?: string | null;
          udi_di?: string | null;
          created_by_id?: string | null;
          sterilization_label_template_url?: string | null;
          production_label_fields?: string[] | null;
          surgical_protocols?: Json | null;
          ifu_docs?: Json | null;
          is_active?: boolean;
          created_at?: string;
          restoration_area?: Database["public"]["Enums"]["restoration_area"] | null;
        };
        Relationships: [
        ];
      };
      task_templates: {
        Row: {
          id: string;
          created_at: string;
          phase: Database["public"]["Enums"]["order_phase"];
          duration_hours: number;
          title_pt: string;
          title_en: string;
          department: string;
          station: string | null;
          employee_id: string | null;
          machine_model: string | null;
          machine_duration_hours: number | null;
          created_by_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          phase: Database["public"]["Enums"]["order_phase"];
          duration_hours: number;
          title_pt: string;
          title_en: string;
          department: string;
          station?: string | null;
          employee_id?: string | null;
          machine_model?: string | null;
          machine_duration_hours?: number | null;
          created_by_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          phase?: Database["public"]["Enums"]["order_phase"];
          duration_hours?: number;
          title_pt?: string;
          title_en?: string;
          department?: string;
          station?: string | null;
          employee_id?: string | null;
          machine_model?: string | null;
          machine_duration_hours?: number | null;
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "task_templates_department_fkey"; columns: ["department"]; isOneToOne: false; referencedRelation: "departments"; referencedColumns: ["name"] },
        ];
      };
      product_workflows: {
        Row: {
          releases_task_ids: string[] | null;
          id: string;
          product_id: string;
          task_template_id: string;
          sequence_order: number;
          depends_on_task_ids: string[] | null;
          is_check_point: boolean | null;
          created_at: string;
          created_by_id: string | null;
        };
        Insert: {
          releases_task_ids?: string[] | null;
          id?: string;
          product_id: string;
          task_template_id: string;
          sequence_order: number;
          depends_on_task_ids?: string[] | null;
          is_check_point?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Update: {
          releases_task_ids?: string[] | null;
          id?: string;
          product_id?: string;
          task_template_id?: string;
          sequence_order?: number;
          depends_on_task_ids?: string[] | null;
          is_check_point?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "product_workflows_task_template_id_fkey"; columns: ["task_template_id"]; isOneToOne: false; referencedRelation: "task_templates"; referencedColumns: ["id"] },
          { foreignKeyName: "product_workflows_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      subtask_templates: {
        Row: {
          id: string;
          task_template_id: string;
          title_pt: string;
          title_en: string;
          has_input: boolean;
          sequence_order: number;
          input_label: string | null;
          is_input_required: boolean | null;
          created_at: string;
          created_by_id: string | null;
        };
        Insert: {
          id?: string;
          task_template_id: string;
          title_pt: string;
          title_en: string;
          has_input?: boolean;
          sequence_order?: number;
          input_label?: string | null;
          is_input_required?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Update: {
          id?: string;
          task_template_id?: string;
          title_pt?: string;
          title_en?: string;
          has_input?: boolean;
          sequence_order?: number;
          input_label?: string | null;
          is_input_required?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "subtask_templates_task_template_id_fkey"; columns: ["task_template_id"]; isOneToOne: false; referencedRelation: "task_templates"; referencedColumns: ["id"] },
        ];
      };
      support_tickets: {
        Row: {
          legacy_id: string | null;
          id: string;
          title: string | null;
          description: string;
          location: string | null;
          notes: string | null;
          resolved_at: string | null;
          priority: Database["public"]["Enums"]["priority"] | null;
          created_at: string;
          type: Database["public"]["Enums"]["ticket_type"];
          status: Database["public"]["Enums"]["ticket_status"];
          created_by_id: string | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          title?: string | null;
          description: string;
          location?: string | null;
          notes?: string | null;
          resolved_at?: string | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
          created_at?: string;
          type?: Database["public"]["Enums"]["ticket_type"];
          status?: Database["public"]["Enums"]["ticket_status"];
          created_by_id?: string | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          title?: string | null;
          description?: string;
          location?: string | null;
          notes?: string | null;
          resolved_at?: string | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
          created_at?: string;
          type?: Database["public"]["Enums"]["ticket_type"];
          status?: Database["public"]["Enums"]["ticket_status"];
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "support_tickets_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      product_histories: {
        Row: {
          legacy_id: string | null;
          id: string;
          product_id: string;
          is_current: boolean;
          type: Database["public"]["Enums"]["history_event"];
          change_count: number | null;
          changed_fields: string[] | null;
          snapshot: Json | null;
          notes: string | null;
          created_at: string;
          created_by_id: string | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          product_id: string;
          is_current?: boolean;
          type?: Database["public"]["Enums"]["history_event"];
          change_count?: number | null;
          changed_fields?: string[] | null;
          snapshot?: Json | null;
          notes?: string | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          product_id?: string;
          is_current?: boolean;
          type?: Database["public"]["Enums"]["history_event"];
          change_count?: number | null;
          changed_fields?: string[] | null;
          snapshot?: Json | null;
          notes?: string | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "product_histories_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      timp_app_versions: {
        Row: {
          legacy_id: string | null;
          name: string | null;
          version: string;
          state: Database["public"]["Enums"]["timp_state"] | null;
          description: string | null;
          released_date: string;
          installer_url: string;
          created_by_id: string | null;
          created_at: string;
          operative_system: Database["public"]["Enums"]["operative_system"] | null;
          id: string;
        };
        Insert: {
          legacy_id?: string | null;
          name?: string | null;
          version: string;
          state?: Database["public"]["Enums"]["timp_state"] | null;
          description?: string | null;
          released_date: string;
          installer_url: string;
          created_by_id?: string | null;
          created_at?: string;
          operative_system?: Database["public"]["Enums"]["operative_system"] | null;
          id?: string;
        };
        Update: {
          legacy_id?: string | null;
          name?: string | null;
          version?: string;
          state?: Database["public"]["Enums"]["timp_state"] | null;
          description?: string | null;
          released_date?: string;
          installer_url?: string;
          created_by_id?: string | null;
          created_at?: string;
          operative_system?: Database["public"]["Enums"]["operative_system"] | null;
          id?: string;
        };
        Relationships: [
        ];
      };
      order_tasks: {
        Row: {
          id: string;
          order_id: string;
          task_template_id: string | null;
          title_pt: string | null;
          title_en: string | null;
          phase: Database["public"]["Enums"]["order_phase"] | null;
          department: string | null;
          station: string | null;
          status: Database["public"]["Enums"]["task_status"];
          sequence_order: number;
          duration_hours: number;
          due_date: string | null;
          pending_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          machine_history_record: string | null;
          employee_id: string | null;
          employee_completed_at: string | null;
          machine_model: string | null;
          machine_id: string | null;
          legacy_id: string | null;
          priority: Database["public"]["Enums"]["priority"] | null;
          depends_on: string[] | null;
          depends_on_completed: string[] | null;
          workflow_started: boolean;
          pauses: Json | null;
          releases: string[] | null;
          machine_duration_hours: number | null;
          machine_started_at: string | null;
          machine_status: Database["public"]["Enums"]["task_machine_status"] | null;
          is_check_point: boolean;
          repetition_count: number;
          non_conforming: string | null;
          created_at: string;
          updated_at: string;
          occurrence_id: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          task_template_id?: string | null;
          title_pt?: string | null;
          title_en?: string | null;
          phase?: Database["public"]["Enums"]["order_phase"] | null;
          department?: string | null;
          station?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          sequence_order: number;
          duration_hours: number;
          due_date?: string | null;
          pending_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          machine_history_record?: string | null;
          employee_id?: string | null;
          employee_completed_at?: string | null;
          machine_model?: string | null;
          machine_id?: string | null;
          legacy_id?: string | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
          depends_on?: string[] | null;
          depends_on_completed?: string[] | null;
          workflow_started?: boolean;
          pauses?: Json | null;
          releases?: string[] | null;
          machine_duration_hours?: number | null;
          machine_started_at?: string | null;
          machine_status?: Database["public"]["Enums"]["task_machine_status"] | null;
          is_check_point?: boolean;
          repetition_count?: number;
          non_conforming?: string | null;
          created_at?: string;
          updated_at?: string;
          occurrence_id?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          task_template_id?: string | null;
          title_pt?: string | null;
          title_en?: string | null;
          phase?: Database["public"]["Enums"]["order_phase"] | null;
          department?: string | null;
          station?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          sequence_order?: number;
          duration_hours?: number;
          due_date?: string | null;
          pending_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          machine_history_record?: string | null;
          employee_id?: string | null;
          employee_completed_at?: string | null;
          machine_model?: string | null;
          machine_id?: string | null;
          legacy_id?: string | null;
          priority?: Database["public"]["Enums"]["priority"] | null;
          depends_on?: string[] | null;
          depends_on_completed?: string[] | null;
          workflow_started?: boolean;
          pauses?: Json | null;
          releases?: string[] | null;
          machine_duration_hours?: number | null;
          machine_started_at?: string | null;
          machine_status?: Database["public"]["Enums"]["task_machine_status"] | null;
          is_check_point?: boolean;
          repetition_count?: number;
          non_conforming?: string | null;
          created_at?: string;
          updated_at?: string;
          occurrence_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "order_tasks_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_tasks_task_template_id_fkey"; columns: ["task_template_id"]; isOneToOne: false; referencedRelation: "task_templates"; referencedColumns: ["id"] },
          { foreignKeyName: "order_tasks_employee_id_fkey"; columns: ["employee_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "order_tasks_machine_history_record_fkey"; columns: ["machine_history_record"]; isOneToOne: false; referencedRelation: "machines_history"; referencedColumns: ["id"] },
          { foreignKeyName: "order_tasks_machine_id_fkey"; columns: ["machine_id"]; isOneToOne: false; referencedRelation: "machines"; referencedColumns: ["id"] },
          { foreignKeyName: "order_tasks_occurrence_id_fkey"; columns: ["occurrence_id"]; isOneToOne: false; referencedRelation: "order_occurrences"; referencedColumns: ["id"] },
        ];
      };
      order_task_subtasks: {
        Row: {
          legacy_id: string | null;
          id: string;
          employee_id: string | null;
          created_at: string;
          subtask_template_id: string | null;
          title_pt: string;
          title_en: string;
          sequence_order: number | null;
          task_id: string;
          is_checked: boolean;
          completed_at: string | null;
          input_label: string | null;
          input_value: string | null;
          input_required: boolean | null;
          has_input: boolean;
          is_auto_generated: boolean | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          employee_id?: string | null;
          created_at?: string;
          subtask_template_id?: string | null;
          title_pt: string;
          title_en: string;
          sequence_order?: number | null;
          task_id: string;
          is_checked?: boolean;
          completed_at?: string | null;
          input_label?: string | null;
          input_value?: string | null;
          input_required?: boolean | null;
          has_input?: boolean;
          is_auto_generated?: boolean | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          employee_id?: string | null;
          created_at?: string;
          subtask_template_id?: string | null;
          title_pt?: string;
          title_en?: string;
          sequence_order?: number | null;
          task_id?: string;
          is_checked?: boolean;
          completed_at?: string | null;
          input_label?: string | null;
          input_value?: string | null;
          input_required?: boolean | null;
          has_input?: boolean;
          is_auto_generated?: boolean | null;
        };
        Relationships: [
          { foreignKeyName: "order_task_subtasks_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "order_tasks"; referencedColumns: ["id"] },
          { foreignKeyName: "order_task_subtasks_employee_id_fkey"; columns: ["employee_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "order_task_subtasks_subtask_template_id_fkey"; columns: ["subtask_template_id"]; isOneToOne: false; referencedRelation: "subtask_templates"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          legacy_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
          name: string | null;
          phone: string | null;
          department: string | null;
          billing_name: string | null;
          billing_vat: string | null;
          billing_address: string | null;
          doctor_code: string | null;
          clinic_name: string | null;
          request: string | null;
          distributor_id: string | null;
          company_name: string | null;
          country: string | null;
          created_at: string;
          preferred_language: Database["public"]["Enums"]["system_language"] | null;
          is_old_user: boolean;
          is_integrated: boolean;
          system_language: Database["public"]["Enums"]["system_language"];
          status: Database["public"]["Enums"]["user_status"];
          is_admin: boolean;
          id: string;
          email: string;
          updated_at: string;
          commercial_condition: Database["public"]["Enums"]["commercial_condition"] | null;
        };
        Insert: {
          legacy_id?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          name?: string | null;
          phone?: string | null;
          department?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          request?: string | null;
          distributor_id?: string | null;
          company_name?: string | null;
          country?: string | null;
          created_at?: string;
          preferred_language?: Database["public"]["Enums"]["system_language"] | null;
          is_old_user?: boolean;
          is_integrated?: boolean;
          system_language?: Database["public"]["Enums"]["system_language"];
          status?: Database["public"]["Enums"]["user_status"];
          is_admin?: boolean;
          id: string;
          email: string;
          updated_at?: string;
          commercial_condition?: Database["public"]["Enums"]["commercial_condition"] | null;
        };
        Update: {
          legacy_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          name?: string | null;
          phone?: string | null;
          department?: string | null;
          billing_name?: string | null;
          billing_vat?: string | null;
          billing_address?: string | null;
          doctor_code?: string | null;
          clinic_name?: string | null;
          request?: string | null;
          distributor_id?: string | null;
          company_name?: string | null;
          country?: string | null;
          created_at?: string;
          preferred_language?: Database["public"]["Enums"]["system_language"] | null;
          is_old_user?: boolean;
          is_integrated?: boolean;
          system_language?: Database["public"]["Enums"]["system_language"];
          status?: Database["public"]["Enums"]["user_status"];
          is_admin?: boolean;
          id?: string;
          email?: string;
          updated_at?: string;
          commercial_condition?: Database["public"]["Enums"]["commercial_condition"] | null;
        };
        Relationships: [
          { foreignKeyName: "profiles_distributor_id_fkey"; columns: ["distributor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      order_associations: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
        Relationships: [
        ];
      };
      product_prices: {
        Row: {
          legacy_id: string | null;
          id: string;
          created_at: string;
          product_id: string;
          variant: string | null;
          commercial_condition: Database["public"]["Enums"]["commercial_condition"] | null;
          price: number | null;
        };
        Insert: {
          legacy_id?: string | null;
          id?: string;
          created_at?: string;
          product_id: string;
          variant?: string | null;
          commercial_condition?: Database["public"]["Enums"]["commercial_condition"] | null;
          price?: number | null;
        };
        Update: {
          legacy_id?: string | null;
          id?: string;
          created_at?: string;
          product_id?: string;
          variant?: string | null;
          commercial_condition?: Database["public"]["Enums"]["commercial_condition"] | null;
          price?: number | null;
        };
        Relationships: [
          { foreignKeyName: "product_prices_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      order_occurrences: {
        Row: {
          id: string;
          repetition_motive: string | null;
          type: Database["public"]["Enums"]["order_occurrences_type"];
          created_at: string;
          created_by_id: string;
          order_id: string | null;
        };
        Insert: {
          id?: string;
          repetition_motive?: string | null;
          type?: Database["public"]["Enums"]["order_occurrences_type"];
          created_at?: string;
          created_by_id?: string;
          order_id?: string | null;
        };
        Update: {
          id?: string;
          repetition_motive?: string | null;
          type?: Database["public"]["Enums"]["order_occurrences_type"];
          created_at?: string;
          created_by_id?: string;
          order_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "order_occurences_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "order_occurrences_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
        ];
      };
      order_receipts: {
        Row: {
          legacy_id: string | null;
          order_id: string;
          id: string;
          currency: string;
          subtotal: number;
          tax_total: number;
          total: number | null;
          created_at: string;
          updated_at: string;
          updated_by_id: string | null;
          commercial_condition: Database["public"]["Enums"]["commercial_condition"];
        };
        Insert: {
          legacy_id?: string | null;
          order_id: string;
          id?: string;
          currency?: string;
          subtotal?: number;
          tax_total?: number;
          total?: number | null;
          created_at?: string;
          updated_at?: string;
          updated_by_id?: string | null;
          commercial_condition: Database["public"]["Enums"]["commercial_condition"];
        };
        Update: {
          legacy_id?: string | null;
          order_id?: string;
          id?: string;
          currency?: string;
          subtotal?: number;
          tax_total?: number;
          total?: number | null;
          created_at?: string;
          updated_at?: string;
          updated_by_id?: string | null;
          commercial_condition?: Database["public"]["Enums"]["commercial_condition"];
        };
        Relationships: [
          { foreignKeyName: "order_receipts_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_receipts_updated_by_id_fkey"; columns: ["updated_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      order_receipt_items: {
        Row: {
          legacy_id: string | null;
          receipt_id: string;
          product_id: string | null;
          variant: string;
          description: string;
          unit_price: number;
          id: string;
          quantity: number;
          line_total: number | null;
          line_number: number;
          created_at: string;
        };
        Insert: {
          legacy_id?: string | null;
          receipt_id: string;
          product_id?: string | null;
          variant: string;
          description: string;
          unit_price: number;
          id?: string;
          quantity?: number;
          line_total?: number | null;
          line_number?: number;
          created_at?: string;
        };
        Update: {
          legacy_id?: string | null;
          receipt_id?: string;
          product_id?: string | null;
          variant?: string;
          description?: string;
          unit_price?: number;
          id?: string;
          quantity?: number;
          line_total?: number | null;
          line_number?: number;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "order_receipt_items_receipt_id_fkey"; columns: ["receipt_id"]; isOneToOne: false; referencedRelation: "order_receipts"; referencedColumns: ["id"] },
          { foreignKeyName: "order_receipt_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      product_complements: {
        Row: {
          id: string;
          product_id: string | null;
          complementary_product_id: string | null;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          complementary_product_id?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          complementary_product_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "product_complements_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "product_complements_complementary_product_id_fkey"; columns: ["complementary_product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      departments: {
        Row: {
          name: string;
          id: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          id?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
        ];
      };
      stations: {
        Row: {
          id: string;
          name: string;
          phase: Database["public"]["Enums"]["order_phase"] | null;
          sequence_order: number;
          is_active: boolean | null;
          created_at: string;
          created_by_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          phase?: Database["public"]["Enums"]["order_phase"] | null;
          sequence_order?: number;
          is_active?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          phase?: Database["public"]["Enums"]["order_phase"] | null;
          sequence_order?: number;
          is_active?: boolean | null;
          created_at?: string;
          created_by_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "stations_created_by_id_fkey"; columns: ["created_by_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      rename_department: { Args: { p_old: string; p_new: string }; Returns: undefined };
      rename_station: { Args: { p_old: string; p_new: string }; Returns: undefined };
      release_app_version: {
        Args: { p_version: string; p_title: string; p_notes: string; p_target_roles: Database["public"]["Enums"]["user_role"][]; p_released_by: string };
        Returns: string;
      };
      system_languages: { Args: Record<string, never>; Returns: string[] };
    };
    Enums: {
      user_role: "supervisor" | "employee" | "doctor" | "distributor";
      order_status: "awaiting_terms" | "processing" | "finished" | "cancelled";
      order_phase: "ordering" | "designing" | "production" | "delivery" | "closing";
      task_status: "none" | "pending" | "in_progress" | "paused" | "completed";
      task_machine_status: "undefined" | "running" | "done";
      priority: "low" | "medium" | "high" | "urgent" | "critical";
      payment: "to_pay" | "paid";
      delivery: "none" | "waiting" | "sent" | "received";
      accessibility: "external" | "complementary" | "private" | "internal";
      jaw: "upper" | "lower";
      restoration_area: "odontogram" | "facial" | "none";
      machine_events: "started" | "joined" | "interrupted" | "finished" | "updated" | "error" | "maintenance";
      order_occurrences_type: "repetition" | "duplicate" | "skipped";
      system_language: "en" | "pt";
      user_status: string; // open: values not known yet
      invite_status: string; // open: values not known yet
      ticket_type: string; // open: values not known yet
      ticket_status: string; // open: values not known yet
      history_event: string; // open: values not known yet
      commercial_condition: string; // open: values not known yet
      language: string; // open: values not known yet
      event_type: string; // open: values not known yet
      message_type: string; // open: values not known yet
      notification_event: string; // open: values not known yet
      notification_type: string; // open: values not known yet
      file_type: string; // open: values not known yet
      machine_status: string; // open: values not known yet
      timp_state: string; // open: values not known yet
      operative_system: string; // open: values not known yet
      calendar_event_type: string; // open: values not known yet
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
