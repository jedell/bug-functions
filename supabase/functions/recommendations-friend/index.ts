// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { embed_liked_events, get_similar_events, generate_friend_events } from '../_shared/worm.ts';

serve(async (req) => {
  const { user_id, friend_id } = await req.json();

  await embed_liked_events(user_id);
  await embed_liked_events(friend_id);

  const userSimilarEvents = await get_similar_events(user_id);
  const friendSimilarEvents = await get_similar_events(friend_id);

  const moreEvents = await generate_friend_events([...userSimilarEvents, ...friendSimilarEvents]);

  return new Response(
    JSON.stringify({ events: moreEvents }),
    { headers: { "Content-Type": "application/json" } },
  );
})
