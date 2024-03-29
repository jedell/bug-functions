import { upsert } from "./database.ts";
import { supabase } from "./supabase-client.ts";
import { Recommendation, Feedback, Like } from "./types.ts";

export async function update_likes_graph(
    recommendation: Recommendation, 
    feedback_data: Feedback,
    from_user_id = ""
    ): Promise<void> {
    
    const liked = feedback_data.liked

    const likes: Like[] = []

    for (const event_id of liked) {
        for (const other_user_id of recommendation.other_user_ids?.concat([recommendation.user_id]) ?? []) {
            likes.push({
                id: crypto.randomUUID(),
                from_user: from_user_id ?? recommendation.user_id,
                to_user: other_user_id,
                event_id: event_id,
            } as Like)
        }
    }

    await upsert("likes", likes)
}

export async function update_event_likes(user_id: string, event_id: string): Promise<void> {
    const { error } = await supabase
        .from('event_likes')
        .upsert([
            { user_id, event_id }
        ]);

    if (error) {
        console.error('Error updating event likes:', error.message);
    }
}

export async function update_event_likes_list(user_id: string, event_ids: string[]) {
    const { error } = await supabase
        .from('event_likes')
        .upsert(
            event_ids.map((event_id: string) => {
                return { user_id, event_id }
            })
        );

    if (error) {
        console.error('Error updating event likes:', error.message);
    }
}

