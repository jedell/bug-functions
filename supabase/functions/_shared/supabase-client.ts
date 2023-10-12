import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const supabaseUrl = Deno.env.get("MY_SUPABASE_URL");
const supabaseKey = Deno.env.get("MY_SUPABASE_KEY");
console.log(supabaseUrl, supabaseKey)
/**
 * The Supabase client.
 */
export const supabase = createClient(supabaseUrl!, supabaseKey!);
