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
          content: string
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
      support_messages: {
        Row: {
          id: string
          user_id: string
          type: 'bug' | 'feedback' | 'contact'
          subject: string
          message: string
          status: 'new' | 'replied' | 'viewed'
          admin_reply: string | null
          created_at: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'bug' | 'feedback' | 'contact'
          subject: string
          message: string
          status?: 'new' | 'replied' | 'viewed'
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'bug' | 'feedback' | 'contact'
          subject?: string
          message?: string
          status?: 'new' | 'replied' | 'viewed'
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
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
        }
        Relationships: []
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
        Relationships: []
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
          drive_url: string
          file_type: string
          filename: string
          id?: string
          project_id: string
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
        Relationships: []
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
        }
        Relationships: []
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