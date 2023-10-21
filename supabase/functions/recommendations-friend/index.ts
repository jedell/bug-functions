// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { get_similar_events, generate_friend_events, get_liked_events } from '../_shared/worm.ts';

serve(async (req) => {
  const { user_id, friend_id } = await req.json();

  const userLikedEvents = await get_liked_events(user_id);
  const friendLikedEvents = await get_liked_events(friend_id);

  const userSimilarEvents = (await Promise.all(userLikedEvents.map(event => get_similar_events(event)))).flat();
  const friendSimilarEvents = (await Promise.all(friendLikedEvents.map(event => get_similar_events(event)))).flat();

  const moreEvents = await generate_friend_events([...userSimilarEvents, ...friendSimilarEvents]);

  return new Response(
    JSON.stringify({ events: moreEvents }),
    { headers: { "Content-Type": "application/json" } },
  );
})
