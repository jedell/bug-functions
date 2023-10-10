import { supabase } from "./supabase-client.ts";

// Function to compute colony
async function computeColony(userId: string) {
    try {
      // Get events liked by the user
      const { data: userLikesData, error: userLikesError } = await supabase
        .from('event_likes')
        .select('event_id')
        .eq('user_id', userId);
  
      if (userLikesError) throw userLikesError;
  
      const userLikedEvents = userLikesData.map(like => like.event_id);
  
      // Find other users who have liked the same events and count common likes
      const { data: commonLikesData, error: commonLikesError } = await supabase
        .from('event_likes')
        .select('user_id, event_id')
        .in('event_id', userLikedEvents);
  
      if (commonLikesError) throw commonLikesError;
  
      // Process the results to find common likes and form colonies
      const commonLikesMap: { [key: string]: { [key: string]: number } } = {};
  
      for (const like of commonLikesData) {
        if (like.user_id === userId) continue;  // Skip the current user
        commonLikesMap[like.user_id] = commonLikesMap[like.user_id] || {};
        commonLikesMap[like.user_id][like.event_id] = (commonLikesMap[like.user_id][like.event_id] || 0) + 1;
      }
  
      const colonies = [];
  
      for (const [otherUserId, commonLikes] of Object.entries(commonLikesMap)) {
        const commonLikesCount = Object.keys(commonLikes).length;
        if (commonLikesCount >= 3) {  // Assuming a threshold of 3 for simplicity
          colonies.push({ userId: otherUserId, commonLikes, commonLikesCount });
        }
      }
  
      return colonies;
    } catch (error) {
      console.error('Error computing colony:', error.message);
    }
  }
  
// Usage
let userId = 'your-user-id';
computeColony(userId)
.then(colony => {
    console.log('Colony computed:', colony);
});


// Assume a function to call the LLM
async function callLLM(input: string): Promise<string> {
  // Implement the logic to call the LLM (e.g., GPT-3.5) with the input text
  // and return the output text.
}


// Function to define colony attributes
async function defineColonyAttributes(userId: string) {
  try {
    // Assume computeColony is a function that computes the user's colony
    const colony = await computeColony(userId);

    // Collect textual data from events in the colony
    const eventIds = colony.flatMap(member => Object.keys(member.commonLikes));
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('title, description, metadata')
      .in('id', eventIds);

    if (eventError) throw eventError;

    // Prepare data for LLM
    const textInput = eventData.map(event => `${event.title}. ${event.description}`).join('\n');

    // Process data with LLM
    const llmOutput = await callLLM(textInput);

    // Interpret LLM output to define colony attributes
    // This step will depend on the specifics of your LLM and the output it provides
    const colonyAttributes = {
      summary: llmOutput,
      // ... other attributes derived from the LLM output
    };

    return colonyAttributes;
  } catch (error) {
    console.error('Error defining colony attributes:', error.message);
  }
}

// Usage
userId = 'your-user-id';
defineColonyAttributes(userId)
  .then(attributes => {
    console.log('Colony attributes:', attributes);
  });

/*
    CREATE OR REPLACE FUNCTION compute_colony(user_id UUID)
RETURNS TABLE (
    colony_id SERIAL,
    member_id UUID,
    event_id UUID,
    common_likes INT
) AS $$
WITH user_likes AS (
    SELECT event_id
    FROM public.event_likes
    WHERE user_id = compute_colony.user_id
),
common_likes AS (
    SELECT el.user_id, el.event_id, COUNT(*) AS common_likes
    FROM public.event_likes el
    JOIN user_likes ul ON el.event_id = ul.event_id
    WHERE el.user_id <> compute_colony.user_id
    GROUP BY el.user_id, el.event_id
    HAVING COUNT(*) >= some_threshold  -- Define a threshold for "commonality"
),
colony_members AS (
    SELECT DISTINCT user_id
    FROM common_likes
)
SELECT ROW_NUMBER() OVER () AS colony_id, cm.user_id AS member_id, cl.event_id, cl.common_likes
FROM colony_members cm
JOIN common_likes cl ON cm.user_id = cl.user_id;
$$ LANGUAGE sql;
*/
    