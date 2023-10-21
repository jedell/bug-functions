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

export async function process_feedback(
	events_feedback: Feedback
): Promise<[Event[], EventResponse[]]> {
	const liked_ids = events_feedback.liked;
	const disliked_ids = events_feedback.disliked;
	const neutral_ids = events_feedback.neutral;

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

	const new_events = await create_new_events_list(
        liked_events_text,
        disliked_events_text,
        neutral_events_text
    );

	return [liked_events, new_events];
}

export async function process_self_feedback(
	recommendation_id: string,
	feedback_data: Feedback
): Promise<{ unique_events: Event[]; recommendation: Recommendation }> {
	const recommendation = await get_recommendation(recommendation_id);

	update_likes_graph(recommendation, feedback_data);
	// register likes for user
	update_event_likes_list(recommendation.user_id, feedback_data.liked);

	// check if feedback is complete (all events are liked, none are disliked or neutral)
	const feedback_complete =
		feedback_data.liked.length === recommendation.events.length;

	if (feedback_complete) {
		return await process_complete_feedback(recommendation);
	} else {
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
	recommendation.events = [final_event.id];

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