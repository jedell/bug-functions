import { config } from "https://deno.land/x/dotenv/mod.ts";
import { insert } from "../../functions/_shared/database.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const supabaseUrl = config({ path: ".env.test" }).MY_SUPABASE_URL;
const supabaseKey = config({ path: ".env.test" }).MY_SUPABASE_KEY;

console.log(supabaseUrl, supabaseKey)

export const supabase_test_client = createClient(supabaseUrl!, supabaseKey!);

export async function createDummyUsers(count: number): Promise<string[]> {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const { error } = await insert('users', [
            { 
                id: id, 
                first_name: `Dummy${i}`, 
                last_name: `User${i}` 
            }
        ])

        if (error) {
            console.error('Error inserting dummy user:', error.message);
        } else {
            ids.push(id);
        }
    }
    return ids;
}

export async function getRandomUsers(count: number): Promise<any[]> {
    const { data, error } = await supabase_test_client
        .from('users')
        .select('*')
        .range(0, count - 1);

    if (error) {
        console.error('Error fetching random users:', error.message);
        return [];
    } else {
        return data;
    }
}


export async function callFunction(
	functionName: string,
	body: Record<string, unknown>
): Promise<any> {
	const url = "http://localhost:54321/functions/v1/" + functionName;
	const headers = new Headers();
	headers.set(
		"Authorization",
		"Bearer " + supabaseKey
	);
	headers.set("Content-Type", "application/json");

	const response = await fetch(url, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(body),
	});

	const data = await response.json();
  const status = response.status;
	return { data, status };
}
