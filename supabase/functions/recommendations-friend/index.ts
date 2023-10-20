// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { embed_liked_events, get_similar_events, generate_friend_events, get_liked_events } from '../_shared/worm.ts';

serve(async (req) => {
  const { user_id, friend_id } = await req.json();

  const userLikedEvents = await get_liked_events(user_id);
  const friendLikedEvents = await get_liked_events(friend_id);

  const userSampleEvent = userLikedEvents[Math.floor(Math.random() * userLikedEvents.length)];
  const friendSampleEvent = friendLikedEvents[Math.floor(Math.random() * friendLikedEvents.length)];

  const userSimilarEventsSample = await get_similar_events(userSampleEvent);
  const friendSimilarEventsSample = await get_similar_events(friendSampleEvent);

  const moreEvents = await generate_friend_events([...userSimilarEventsSample, ...friendSimilarEventsSample]);

  return new Response(
    JSON.stringify({ events: moreEvents }),
    { headers: { "Content-Type": "application/json" } },
  );
})
