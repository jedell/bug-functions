import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { config } from "https://deno.land/x/dotenv/mod.ts";


const supabaseUrl = Deno.env.get("MY_SUPABASE_URL")
const supabaseKey = Deno.env.get("MY_SUPABASE_KEY");
// const supabaseUrl = config({ path: ".env" }).MY_SUPABASE_URL;
// const supabaseKey = config({ path: ".env" }).MY_SUPABASE_KEY;
console.log(supabaseUrl)
/**
 * The Supabase client.
 */
export const supabase = createClient(supabaseUrl!, supabaseKey!);
