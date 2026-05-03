import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, User, Clock } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  file_id: string;
  comment: string;
  author_name: string | null;
  is_client: boolean;
  is_resolved: boolean;
  created_at: string;
}

interface CommentSectionProps {
  projectId: string;
  fileId?: string;
}

export function CommentSection({ projectId, fileId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [projectId, fileId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('file_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (fileId) {
        query = query.eq('file_id', fileId);
      } else {
        const { data: files } = await supabase
          .from('project_files')
          .select('id')
          .eq('project_id', projectId);
        
        if (files && files.length > 0) {
          const fileIds = files.map(f => f.id);
          query = query.in('file_id', fileIds);
        } else {
          setComments([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments((data || []) as Comment[]);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      let targetFileId = fileId;
      
      if (!targetFileId) {
        const { data: files } = await supabase
          .from('project_files')
          .select('id')
          .eq('project_id', projectId)
          .limit(1);
        
        if (files && files.length > 0) {
          targetFileId = files[0].id;
        } else {
          toast({
            title: "Error",
            description: "No files found to attach comment to.",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('file_comments')
        .insert({
          file_id: targetFileId,
          comment: newComment,
          author_name: authorName || "Anonymous",
          is_client: true,
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast({
        title: "Comment added",
        description: "Your feedback has been submitted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Comments & Feedback</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Comment</label>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your feedback here..."
            className="min-h-[100px]"
          />
        </div>
        <Button type="submit" className="w-full gap-2">
          <Send className="w-4 h-4" />
          Post Comment
        </Button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            No comments yet. Be the first to leave feedback!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card p-4 rounded-lg border shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{comment.author_name || "Anonymous"}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
                {comment.is_client && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium uppercase">
                    Client
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap pl-10">
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}