// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { create_and_save_recommendation } from "../_shared/recommendations.ts"
import { generate_events } from "../_shared/worm.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { user_id } = await req.json()

  const [events, is_default] = await generate_events(user_id)

  const recommendation = create_and_save_recommendation(user_id, events, is_default)

  const data = {
    ...recommendation,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  )
})
