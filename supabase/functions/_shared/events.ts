/**
 * @packageDocumentation
 * @module _events
 * @description This module contains the functions for generating events and context.
 * @preferred
 * @beta
 */

import { Event, EventResponse } from "./types.ts";
import { get_embeddings } from "./worm.ts";
import { fetch, fetch_all_by_in, insert } from "./database.ts";

/**
 * Returns a list of context events for the user
 * 
 * @param user_id The user's id
 * @returns A list of context events for the user and a boolean indicating whether the context is default
 * 
 * @beta
 */
export async function get_context_events(user_id: string): Promise<[Event[], boolean]> {

    let is_default = true

    const { data: event_likes, error } = await supabase
        .from('event_likes')
        .select('event_id')
        .eq('user_id', user_id);

    if (error || event_likes.length === 0) {
        const context: Event[] = [
            {
                id: '6b31fd2f-5d11-401e-9cb0-abb4cd966182',
                title: 'Engage in creative expression',
                description: 'Explore your imagination and express yourself through various artistic outlets, allowing you to tap into your inner creativity',
            },
            {
                id: '43d1ff57-3921-4939-8639-e6428e3fad43',
                title: 'Practice relaxation and mindfulness',
                description: 'Take time to unwind, focus on the present moment, and cultivate a sense of calm and inner peace, promoting overall well-being',
            },
            {
                id: 'f208343e-893a-4ec4-b9a3-8d472420c6a2',
                title: 'Get physically active',
                description: 'Engage in activities that involve movement and exercise, promoting physical fitness, vitality, and an active lifestyle.',
            },
            {
                id: '469d9e70-dd86-4e94-a316-27f1f874076f',
                title: 'Learn and expand your knowledge',
                description: 'Pursue new information, skills, or areas of interest to foster personal growth, expand your understanding, and continuously learn.',
            },
            {
                id: '8dd4da25-9847-4c33-aad8-41761e7119c6',
                title: 'Enjoy leisure and entertainment',
                description: 'Engage in activities that bring pleasure and amusement, allowing you to relax, have fun, and enjoy moments of recreation and entertainment.',
            },
            {
                id: '2a480a8a-11d1-4b9e-90ef-ca6ef95368ab',
                title: 'Connect with others',
                description: 'Interact with others, build relationships, and foster a sense of belonging, promoting social connection and a support network.',
            },
        ]
        return [context, is_default]
    } else {
        is_default = false
        const event_ids = event_likes.map(like => like.event_id);
        const context = await get_events(event_ids)
        return [context, is_default]
    }
}

/**
 * Returns a list of events from a list of event IDs.
 * 
 * @param event_ids A list of event IDs.
 * @returns A list of events.
 *  
 * @beta
 */
export async function get_events(event_ids: string[]): Promise<Event[]> {
    
    const responses = await fetch_all_by_in("events", "id", event_ids)

    return responses as Event[]
}

/**
 * Creates a list of events from EventResponse objects.
 * 
 * @param event_responses A list of EventResponse objects.
 * @returns A list of events.
 * 
 * @beta
 */
export function map_event_responses(event_responses: EventResponse[]): Event[] {
    const events: Event[] = []

    for (const event_response of event_responses) {
        events.push({
            id: crypto.randomUUID(),
            title: event_response.title,
            description: event_response.description,
            location: undefined,
            url: undefined ,
            metadata: undefined,
        } as Event)
    }

    return events

}

export function map_event_response(event_response: EventResponse): Event {
    return {
        id: crypto.randomUUID(),
        title: event_response.title,
        description: event_response.description,
        location: undefined,
        url: undefined ,
        metadata: undefined,
    } as Event
}

export async function embed_events(events: Event[]): Promise<number[][]> {
    const texts = events.map((event) => {
        // if event title does not end with punctuation (., ?, !), add a period
        const title = event.title.endsWith(".") || event.title.endsWith("?") || event.title.endsWith("!") ? event.title : event.title + "."
        const description = event.description.endsWith(".") || event.description.endsWith("?") || event.description.endsWith("!") ? event.description : event.description + "."
        return title + " " + description
    })

    // embed texts
    const embeddings = await get_embeddings(texts)

    return embeddings
}



export async function save_events(events: Event[]): Promise<void> {
    // save events to database

    const embeddings = await embed_events(events)

    // save events + embeddings to database
    const events_with_embeddings = events.map((event, index) => {
        return {
            ...event,
            embedding: embeddings[index]
        }
    })

    insert("events", events_with_embeddings)
}
