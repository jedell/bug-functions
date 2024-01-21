/**
 * @packageDocumentation
 * @module recommendations
 * @description This module contains the functions for generating recommendations.
 * @beta
 */

import { Event, Recommendation, RecommendationStatus, RecommendationType } from "../_shared/types.ts";
import { insert, fetch, upsert } from "./database.ts";
import { save_events } from "./events.ts";

export function create_recommendation(
    user_id: string, 
    events: Event[],
    other_user_ids?: string[],
    type: RecommendationType = RecommendationType.SELF,
    status: RecommendationStatus = RecommendationStatus.FEEDBACK
    ): Recommendation {

    const recommendation: Recommendation = {
        id: crypto.randomUUID(),
        user_id: user_id,
        events: events,
        other_user_ids: other_user_ids,
        type: type,
        status: status,
        date: new Date()
    }

    return recommendation
}

export function update_recommendation_status(recommendation: Recommendation, status: RecommendationStatus): Recommendation {
    console.log(`Updating recommendation status for recommendation ID: ${recommendation.id}`);
    recommendation.status = status

    upsert("recommendations", recommendation).then(() => {
        console.log(`Updated recommendation status for recommendation ID: ${recommendation.id} to ${status}`);
    });
    return recommendation
}

export function save_recommendation(recommendation: Recommendation): void {
    console.log(`Saving recommendation with ID: ${recommendation.id}`);
    const to_insert = {...recommendation, events: recommendation.events.map(event => event.id)};
    insert("recommendations", to_insert).then(() => {
        console.log(`Saved recommendation with ID: ${recommendation.id}`)
    });
}

export async function get_recommendation(recommendation_id: string): Promise<Recommendation> {
    console.log(`Fetching recommendation with ID: ${recommendation_id}`);
    const response = await fetch("recommendations", recommendation_id)
    console.log(`Fetched recommendation with ID: ${recommendation_id}`);

    return response as Recommendation
}


export function update_recommendation_events(recommendation: Recommendation, events: Event[]): Recommendation {
    console.log(`Updating events for recommendation ID: ${recommendation.id}`);
    recommendation.events = events
    const to_insert = {...recommendation, events: events.map((event) => event.id)}

    upsert("recommendations", to_insert).then(() => {
        console.log(`Updated events for recommendation ID: ${recommendation.id}`);
    });

    return recommendation
}

/**
 * Saves a recommendation and any associated events to the database
 * 
 * @param user_id 
 * @param events 
 * @param is_default 
 * @returns 
 */
export function create_and_save_recommendation(user_id: string, events: Event[], is_default: boolean): Recommendation {

    if (!is_default) {
        save_events(events)
    }

    const recommendation: Recommendation = create_recommendation(user_id, events)

    save_recommendation(recommendation)

    return recommendation
}