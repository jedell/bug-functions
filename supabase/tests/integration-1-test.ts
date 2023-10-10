import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { callFunction, createDummyUsers } from "./utils/test_utils.ts";
import { fetch } from "../functions/_shared/database.ts";

Deno.test('Recommendation and Feedback Flow', async () => {
    // 1. Create a dummy user
    const userIds = await createDummyUsers(1);
    const user = await fetch('users', userIds[0]);

    // 2. Initiate a recommendation
    let response = await callFunction('recommendation-self', { user_id: user.id });
    assertEquals(response.status, 200);
    const recommendation = response.data;

    // 3. Respond with feedback
    const feedback = { liked: [recommendation.events[0]], disliked: [], neutral: [] };
    response = await callFunction('feedback-self', { recommendation_id: recommendation.id, feedback_data: feedback });
    assertEquals(response.status, 200);

    // 4. Confirm that the user's feedback has been recorded in the event_likes table
    const eventLike = await fetch('event_likes', { user_id: user.id, event_id: recommendation.events[0] });
    assertEquals(eventLike.user_id, user.id);
    assertEquals(eventLike.event_id, recommendation.events[0]);

    // 5. Confirm other table entries where required
    // Add your checks here...
});