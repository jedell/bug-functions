// deno-test.ts

// Import required libraries and modules
import {
	assertEquals,
} from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { callFunction } from "./utils/test_utils.ts";
import { supabase } from "../functions/_shared/supabase-client.ts";

// Set up the configuration for the Supabase client
const supabaseUrl = config({ path: ".env.test" }).MY_SUPABASE_URL;
const supabaseKey = config({ path: ".env.test" }).MY_SUPABASE_KEY;

const options = {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
};

// Test the 'recommendations-self' function
const testRecommendationsSelf = async () => {

	const body = { user_id: "8557cd37-3039-4445-b4a8-623d4f0d9105" };

	// Invoke the 'recommendations-self' function with a parameter
  const { data: func_data, status: func_status } = await callFunction("recommendations-self", {
    body: body,
  });

  // Check for errors from the function invocation
  

	// Check for errors from the function invocation
	if (func_status != 200) {
		throw new Error("Invalid response: " + func_status.message + "\n" + func_data);
	}

	// Log the response from the function
	console.log(JSON.stringify(func_data, null, 2));

	// Assert that the function returned the expected result
	assertEquals(func_data.type, "self");
};

// Register and run the tests
Deno.test("Recommendations-self Function Test", testRecommendationsSelf);
