// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { supabase } from '../_shared/supabase-client.ts';

serve(async (req) => {
  const { user_id, event_id, feedback } = await req.json();

  // Record the user's feedback in the event_likes table
  const { error } = await supabase
    .from('event_likes')
    .upsert({ user_id, event_id, feedback });

  if (error) {
    console.error('Error recording feedback:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ message: 'Feedback recorded successfully' }),
    { headers: { "Content-Type": "application/json" } },
  );
})

