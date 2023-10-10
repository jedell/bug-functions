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
        events: events.map((event) => event.id),
        other_user_ids: other_user_ids,
        type: type,
        status: status,
        date: new Date()
    }

    return recommendation
}

export function update_recommendation_status(recommendation: Recommendation, status: RecommendationStatus): Recommendation {
    recommendation.status = status

    upsert("recommendations", recommendation)

    return recommendation
}

export function save_recommendation(recommendation: Recommendation): void {
    insert("recommendations", recommendation)
}

export async function get_recommendation(recommendation_id: string): Promise<Recommendation> {
    const response = await fetch("recommendations", recommendation_id)

    return response as Recommendation
}

export function update_recommendation_events(recommendation: Recommendation, events: Event[]): Recommendation {
    recommendation.events = events.map((event) => event.id)

    upsert("recommendations", recommendation)

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