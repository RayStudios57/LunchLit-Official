import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyClassSchedule } from '@/data/presentationDummyData';

export type BlockType = 'academic' | 'lunch' | 'free' | 'club';

export interface ClassSchedule {
  id: string;
  user_id: string;
  class_name: string;
  teacher_name: string | null;
  room_number: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  is_club?: boolean | null;
  show_every_day?: boolean | null;
  rotation_day?: 'all' | 'A' | 'B' | 'Gold' | 'Blue' | 'Anchor' | string;
  block_type?: BlockType | string | null;
  period_number?: string | null;
  created_at: string;
  updated_at: string;
}

export function useClassSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isPresentationMode } = usePresentationMode();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['class_schedules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!user,
  });

  const addClass = useMutation({
    mutationFn: async (classData: Omit<ClassSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      let res = await supabase
        .from('class_schedules')
        .insert({ ...classData, user_id: user.id } as any)
        .select()
        .single();
      
      if (res.error && (res.error.message?.includes('column') || res.error.message?.includes('schema'))) {
        const { block_type, period_number, ...fallbackData } = classData as any;
        res = await supabase
          .from('class_schedules')
          .insert({ ...fallbackData, user_id: user.id } as any)
          .select()
          .single();
      }

      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
      toast({ title: 'Class added!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding class', description: error.message, variant: 'destructive' });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('class_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating class', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('class_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
      toast({ title: 'Class deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting class', description: error.message, variant: 'destructive' });
    },
  });

  const activeClasses = isPresentationMode ? (dummyClassSchedule as ClassSchedule[]) : classes;

  return { classes: activeClasses, isLoading: isPresentationMode ? false : isLoading, addClass, updateClass, deleteClass };
}
