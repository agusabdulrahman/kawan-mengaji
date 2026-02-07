import { Bookmark, Lesson, UserProgress } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserState {
  progress: UserProgress;
  bookmarks: Bookmark[];
  lessons: Lesson[];
}

const TABLE_NAME = 'user_state';

export async function fetchUserState(client: SupabaseClient, userId: string): Promise<UserState | null> {
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('progress, bookmarks, lessons')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch user state', error);
    return null;
  }

  if (!data) return null;

  return {
    progress: data.progress as UserProgress,
    bookmarks: (data.bookmarks || []) as Bookmark[],
    lessons: (data.lessons || []) as Lesson[],
  };
}

export async function saveUserState(
  client: SupabaseClient,
  userId: string,
  state: UserState
): Promise<void> {
  const { error } = await client.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      progress: state.progress,
      bookmarks: state.bookmarks,
      lessons: state.lessons,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to save user state', error);
  }
}
