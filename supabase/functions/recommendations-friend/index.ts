// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { embedLikedEvents, getSimilarEvents, generateMoreEvents } from '../_shared/worm.ts';

serve(async (req) => {
  const { user_id, friend_id } = await req.json();

  await embedLikedEvents(user_id);
  await embedLikedEvents(friend_id);

  const userSimilarEvents = await getSimilarEvents(user_id);
  const friendSimilarEvents = await getSimilarEvents(friend_id);

  const moreEvents = await generateMoreEvents([...userSimilarEvents, ...friendSimilarEvents]);

  return new Response(
    JSON.stringify({ events: moreEvents }),
    { headers: { "Content-Type": "application/json" } },
  );
})
