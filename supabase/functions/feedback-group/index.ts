// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

console.log("Hello from Functions!")

/*
TODO:
- [ ] Process feedback from any user in a recommendation group (is this the best way to handle this?)
- [ ] Update the likes graph with the feedback
- [ ] Update the recommendation events and potentially status depending on if all users have accepted feedback
- [ ] Return updated recommendation to the user and await feedback, or return final recommendation to all users
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