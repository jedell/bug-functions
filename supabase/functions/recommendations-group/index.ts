// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

console.log("Hello from Functions!")

/*
TODO: 
- [ ] Generate a new recommendation for a group of users
- [ ] Get context for each user
- [ ] Create prompt to capture context and call LLM to generate a list of events that are relevant to the group
- [ ] Store recommendation and generated events in supabase Postgres
- [ ] Return recommendation to the user and await feedback

*/

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
