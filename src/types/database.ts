// ============================================================
// Supabase 数据库类型定义
// 占位类型 —— 后续可通过 supabase gen types typescript 自动生成替换
// 命令：npx supabase gen types typescript --linked > src/types/database.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** 评论实体 */
export interface Comment {
  id: string;
  post_id: string | null;
  parent_id: string | null;
  user_name: string;
  user_email: string | null;
  user_avatar: string | null;
  content: string;
  is_approved: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

/** 创建评论的输入 */
export interface CreateCommentInput {
  post_id?: string | null;
  parent_id?: string | null;
  user_name: string;
  user_email?: string | null;
  content: string;
}

/** 评论查询参数 */
export interface CommentQuery {
  post_id?: string;
  page?: number;
  pageSize?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          github_id: string | null;
          github_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_id?: string | null;
          github_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_id?: string | null;
          github_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image: string | null;
          status: "draft" | "published" | "archived";
          featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          author_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          excerpt?: string | null;
          cover_image?: string | null;
          status?: "draft" | "published" | "archived";
          featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          author_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image?: string | null;
          status?: "draft" | "published" | "archived";
          featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          author_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      post_categories: {
        Row: {
          post_id: string;
          category_id: string;
        };
        Insert: {
          post_id: string;
          category_id: string;
        };
        Update: {
          post_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_categories_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_categories_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string | null;
          parent_id: string | null;
          user_name: string;
          user_email: string | null;
          user_avatar: string | null;
          content: string;
          is_approved: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id?: string | null;
          parent_id?: string | null;
          user_name: string;
          user_email?: string | null;
          user_avatar?: string | null;
          content: string;
          is_approved?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string | null;
          parent_id?: string | null;
          user_name?: string;
          user_email?: string | null;
          user_avatar?: string | null;
          content?: string;
          is_approved?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      post_status: "draft" | "published" | "archived";
    };
  };
}
