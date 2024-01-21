// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import {
	update_recommendation_events,
	update_recommendation_status,
} from "../_shared/recommendations.ts";
import { RecommendationStatus } from "../_shared/types.ts";
import { process_self_feedback } from "../_shared/feedback.ts";
import { corsHeaders } from "../_shared/cors.ts";

/*
  TODO:
  - [ ] Process feedback from single user generating events for themselves.
  - [ ] Update the likes graph with the feedback
  - [ ] Update the recommendation events and potentially status
  - [ ] Return updated recommendation to the user and await feedback, or return final recommendation to all users
  - [ ] Handle case where feedback on events is all positive => generate a single final event based on the feedback
  */

serve(async (req) => {

	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	const { recommendation_id, liked, disliked, neutral } = await req.json();

	console.log(`Received feedback for recommended events. ID: ${recommendation_id}`)

	const response = await process_self_feedback(recommendation_id, {
		liked,
		disliked,
		neutral,
	});

	let recommendation = response.recommendation;

	if (response.unique_events.length === 1) {
		// update recommendation status to complete
		recommendation = update_recommendation_status(
			recommendation,
			RecommendationStatus.ACCEPTED
		);
	}

	recommendation = update_recommendation_events(
		recommendation,
		response.unique_events
	);

	const data = {
		...recommendation,
	};

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
});