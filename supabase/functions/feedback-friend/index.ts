// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { supabase } from '../_shared/supabase-client.ts';
import { update_recommendation_status, update_recommendation_events } from "../_shared/recommendations.ts";
import { RecommendationStatus } from "../_shared/types.ts";

serve(async (req) => {
  const { recommendation_id, from_user_id, liked, disliked, neutral } = await req.json();

  // Record the user's feedback in the event_likes table
  const { error, data } = await supabase
    .from('event_likes')
    .upsert({ user_id, event_id, feedback });

  if (error) {
    console.error('Error recording feedback:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  let recommendation = data.recommendation;

  if (data.unique_events.length === 1) {
    // update recommendation status to complete
    recommendation = update_recommendation_status(
      recommendation,
      RecommendationStatus.ACCEPTED
    );
  }

  recommendation = update_recommendation_events(
    recommendation,
    data.unique_events
  );

  return new Response(
    JSON.stringify({ message: 'Feedback recorded successfully', recommendation }),
    { headers: { "Content-Type": "application/json" } },
  );
})
