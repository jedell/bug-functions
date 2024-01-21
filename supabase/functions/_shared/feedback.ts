import {
	Event,
	EventResponse,
	Feedback,
	Recommendation,
} from "./types.ts";
import { get_events, map_event_response, map_event_responses, save_events } from "./events.ts";
import { get_recommendation } from "./recommendations.ts";
import { update_event_likes, update_event_likes_list, update_likes_graph } from "./likes.ts";
import { generate_final_event, create_new_events_list } from "./worm.ts";
import { MAX_EVENT_NUMBER } from "./config/prompts.ts";

export async function process_feedback(
	events_feedback: Feedback
): Promise<[Event[], EventResponse[]]> {
	console.log("Processing feedback...");
	const liked_ids = events_feedback.liked;
	const disliked_ids = events_feedback.disliked;
	const neutral_ids = events_feedback.neutral;

	console.log("Fetching events...");
	const all_events = await get_events([
		...liked_ids,
		...disliked_ids,
		...neutral_ids,
	]);

	const liked_events = all_events.filter((event) =>
		liked_ids.includes(event.id)
	);
	const disliked_events = all_events.filter((event) =>
		disliked_ids.includes(event.id)
	);
	const neutral_events = all_events.filter((event) =>
		neutral_ids.includes(event.id)
	);

	console.log("Generating event texts...");
	const liked_events_text = liked_events
		.map(
			(event, index) =>
				`${index + 1}. ${event.title}: ${event.description}`
		)
		.join("\n\n");
	const disliked_events_text = disliked_events
		.map(
			(event, index) =>
				`${index + 1}. ${event.title}: ${event.description}`
		)
		.join("\n\n");
	const neutral_events_text = neutral_events
		.map(
			(event, index) =>
				`${index + 1}. ${event.title}: ${event.description}`
		)
		.join("\n\n");

	console.log("Creating new events list...");
	const num_to_generate = MAX_EVENT_NUMBER - liked_events.length;

	let new_events = await create_new_events_list(
		liked_events_text,
		disliked_events_text,
		neutral_events_text,
		num_to_generate
	);

	// Ensure that there are only {num_to_generate} new events
	if (new_events.length > num_to_generate) {
		new_events = new_events.slice(0, num_to_generate);
	}

	console.log("Feedback processing complete.");
	return [liked_events, new_events];
}

export async function process_self_feedback(
	recommendation_id: string,
	feedback_data: Feedback
): Promise<{ unique_events: Event[]; recommendation: Recommendation }> {
	console.log(`Processing self feedback for recommendation ID: ${recommendation_id}`);
	const recommendation = await get_recommendation(recommendation_id);

	console.log(`Updating likes graph for recommendation ID: ${recommendation_id}`);
	update_likes_graph(recommendation, feedback_data);
	
	// register likes for user
	console.log(`Updating event likes list for user ID: ${recommendation.user_id}`);
	update_event_likes_list(recommendation.user_id, feedback_data.liked);

	// check if feedback is complete (all events are liked, none are disliked or neutral)
	const feedback_complete =
		feedback_data.liked.length === recommendation.events.length;

	console.log(`Feedback complete status for recommendation ID: ${recommendation_id} is ${feedback_complete}`);
	if (feedback_complete) {
		console.log(`Processing complete feedback for recommendation ID: ${recommendation_id}`);
		return await process_complete_feedback(recommendation);
	} else {
		console.log(`Processing incomplete feedback for recommendation ID: ${recommendation_id}`);
		return await process_incomplete_feedback(recommendation, feedback_data);
	}
}


export async function process_friend_feedback(
	recommendation_id: string,
	from_user_id: string,
	feedback_data: Feedback
): Promise<{ unique_events: Event[]; recommendation: Recommendation }> {
	const recommendation = await get_recommendation(recommendation_id);

	update_likes_graph(recommendation, feedback_data);
	update_event_likes_list(from_user_id, feedback_data.liked)

	const feedback_complete = 
		feedback_data.liked.length === recommendation.events.length;

	if (feedback_complete) {
		return await process_complete_feedback_friend(recommendation);
	} else {
		return await process_incomplete_feedback(recommendation, feedback_data);
	}
}


async function process_complete_feedback(recommendation: Recommendation): Promise<{ unique_events: Event[]; recommendation: Recommendation }> {

	// generate final event
	const final_event_response = await generate_final_event(recommendation);

	const final_event = map_event_response(final_event_response);

	// save final event
	save_events([final_event]);

	// update recommendation with final event
	recommendation.events = [final_event];

	return { unique_events: [final_event], recommendation };
}

async function process_incomplete_feedback(recommendation: Recommendation, feedback_data: Feedback): Promise<{ unique_events: Event[]; recommendation: Recommendation }> {
	const [liked_events, new_event_responses] = await process_feedback(
		feedback_data
	);

	const new_events = map_event_responses(new_event_responses);

	save_events(new_events);

	const updated_events = liked_events.concat(new_events);

	// remove events with duplicate id
	const unique_events = updated_events.filter(
		(event, index, self) =>
			index === self.findIndex((e) => e.id === event.id)
	);

	return { unique_events, recommendation };
}