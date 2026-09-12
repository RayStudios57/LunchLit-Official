import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyProfile } from '@/data/presentationDummyData';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  school_name: string | null;
  school_id: string | null;
  grade_level: string | null;
  calendar_sync_enabled: boolean | null;
  last_grade_progression: string | null;
  is_graduated: boolean | null;
  is_public: boolean | null;
  allow_friend_requests: boolean | null;
  custom_status: string | null;
  showcase_badge: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isPresentationMode } = usePresentationMode();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No profile yet
        throw error;
      }
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profile updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    },
  });

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Not authenticated');
    
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExt = allowed.includes(rawExt) 
      ? rawExt 
      : (file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg');
    
    const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });
    
    if (uploadError) {
      console.error('Avatar upload error details:', {
        message: uploadError.message,
        error: uploadError,
        fileName,
        fileSize: file.size,
        fileType: file.type,
      });
      // Provide a user-friendly message based on the error type
      const msg = uploadError.message?.includes('row-level security') || uploadError.message?.includes('policy')
        ? 'Storage permissions not configured. Please contact support.'
        : uploadError.message?.includes('Bucket not found')
        ? 'Avatar storage not set up yet. Please contact support.'
        : uploadError.message || 'Upload failed. Please try again.';
      throw new Error(msg);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    await updateProfile.mutateAsync({ avatar_url: publicUrl });
    
    return publicUrl;
  };


  return { 
    profile: isPresentationMode ? (dummyProfile as Profile) : profile, 
    isLoading: isPresentationMode ? false : isLoading, 
    updateProfile, 
    uploadAvatar 
  };
}
