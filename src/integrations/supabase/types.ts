export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          updated_at: string
          plan_type: 'free' | 'pro'
          subscription_id: string | null
          is_admin: boolean
          total_projects_created: number
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          updated_at?: string
          plan_type?: 'free' | 'pro'
          subscription_id?: string | null
          is_admin?: boolean
          total_projects_created?: number
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          updated_at?: string
          plan_type?: 'free' | 'pro'
          subscription_id?: string | null
          is_admin?: boolean
          total_projects_created?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      file_comments: {
        Row: {
          author_name: string | null
          comment: string
          created_at: string
          file_id: string
          id: string
          is_client: boolean | null
          is_resolved: boolean | null
          timestamp_seconds: number | null
        }
        Insert: {
          author_name?: string | null
          comment: string
          created_at?: string
          file_id: string
          id?: string
          is_client?: boolean | null
          is_resolved?: boolean | null
          timestamp_seconds?: number | null
        }
        Update: {
          author_name?: string | null
          comment?: string
          created_at?: string
          file_id?: string
          id?: string
          is_client?: boolean | null
          is_resolved?: boolean | null
          timestamp_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "file_comments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          drive_file_id: string | null
          drive_url: string
          file_type: string
          filename: string
          id: string
          project_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          drive_file_id?: string | null
          drive_url?: string
          file_type?: string
          filename?: string
          id?: string
          project_id?: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          drive_file_id?: string | null
          drive_url?: string
          file_type?: string
          filename?: string
          id?: string
          project_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          created_at: string
          description: string | null
          drive_folder_url: string | null
          id: string
          name: string
          share_token: string
          updated_at: string
          work_type: string | null
          user_id: string | null
          expires_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          drive_folder_url?: string | null
          id?: string
          name: string
          share_token?: string
          updated_at?: string
          work_type?: string | null
          user_id?: string | null
          expires_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          drive_folder_url?: string | null
          id?: string
          name?: string
          share_token?: string
          updated_at?: string
          work_type?: string | null
          user_id?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          dodo_subscription_id: string | null
          status: string | null
          next_billing_date: string | null
          customer_email: string | null
          manual_expiry: string | null
        }
        Insert: {
          id?: string
          user_id: string
          dodo_subscription_id?: string | null
          status?: string | null
          next_billing_date?: string | null
          customer_email?: string | null
          manual_expiry?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          dodo_subscription_id?: string | null
          status?: string | null
          next_billing_date?: string | null
          customer_email?: string | null
          manual_expiry?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          id: string
          user_id: string
          type: string
          subject: string
          message: string
          status: string
          admin_reply: string | null
          created_at: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          subject: string
          message: string
          status?: string
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          subject?: string
          message?: string
          status?: string
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row']