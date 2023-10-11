/**
 * @packageDocumentation
 * @module _worm
 * @description This module contains the functions for prompting a LLM and generating content.
 * @beta
 */

import {
	ActivityResponse,
	Event,
	EventResponse,
	Feedback,
	Recommendation,
} from "./types.ts";
import { z } from "https://deno.land/x/zod/mod.ts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
	map_event_responses,
	get_context_events,
	get_events,
	save_events,
embed_events,
} from "./events.ts";
import { ChainValues } from "https://esm.sh/v127/langchain@0.0.100/dist/schema/index.js";
import { supabase } from "./supabase-client.ts";
import { HumanChatMessage } from "https://esm.sh/v127/langchain@0.0.100/dist/schema/index.js";
import { SystemChatMessage } from "https://esm.sh/v127/langchain@0.0.100/dist/schema/index.js";

const MAX_EVENT_VALUE = 5;

export const activityResponseSchema: z.ZodType<ActivityResponse> = z.object({
	activities: z
		.array(
			z.object({
				title: z.string().describe("title of the event"),
				description: z
					.string()
					.describe("brief and specific description of the event"),
			})
		)
		.max(MAX_EVENT_VALUE)
		.describe("list of activities"),
});

const parser = StructuredOutputParser.fromZodSchema(activityResponseSchema);

const format_instructions = parser.getFormatInstructions();

const model = new ChatOpenAI({
	modelName: "gpt-3.5-turbo",
	maxTokens: 500,
	openAIApiKey: Deno.env.get("OPENAI_API_KEY") as string,
});

const prompt = create_prompt();

const llm_chain = new LLMChain({
	prompt: prompt,
	llm: model,
});

const embedding_model = new OpenAIEmbeddings({
	modelName: "text-embedding-ada-002",
	openAIApiKey: Deno.env.get("OPENAI_API_KEY") as string,
});

/**
 * Logic for generating initial event recommendations for a user.
 *
 * @param user_id The user ID of the user to generate recommendations for.
 * @returns A list of events and a boolean indicating whether the recommendations are default.
 *
 * @beta
 */
export async function generate_events(
	user_id: string
): Promise<[Event[], boolean]> {
	let [events, is_default] = get_context_events(user_id);

	if (!is_default) {
		const events_list = await create_init_events_list(user_id, events);

		// create events from events_list
		events = map_event_responses(events_list);

		// save events to database
		save_events(events);
	}

	return [events, is_default];
}

function generate_feedback_context(
	liked_events_text: string,
	disliked_events_text: string,
	neutral_events_text: string
): string {
	return (
		"User likes the following events:\n\n" +
		liked_events_text +
		"\n\nUser dislikes the following events:\n\n" +
		disliked_events_text +
		"\n\nUser is neutral about the following events:\n\n" +
		neutral_events_text
	);
}

function generate_question(num_activities: number): string {
	return (
		"Using the following information about the user's preferences, create a list of " +
		num_activities +
		" new activities that the user would enjoy as well."
	);
}

async function call_llm_chain(question: string, context: string) : Promise<ChainValues> {
	return await llm_chain.call({
		question: question,
		context: context,
	});
}

function create_prompt(): PromptTemplate {
	const template = `Question: {question}

    Context: {context}

    {format_instructions}

    Answer: Here is the list of activities:
    `;

	return new PromptTemplate({
		template: template,
		inputVariables: ["question", "context"],
		partialVariables: { format_instructions: format_instructions },
	});
}

export async function create_new_events_list(
	liked_events_text: string,
	disliked_events_text: string,
	neutral_events_text: string
): Promise<EventResponse[]> {
	const context = generate_feedback_context(
		liked_events_text,
		disliked_events_text,
		neutral_events_text
	);
	const question = generate_question(MAX_EVENT_VALUE);

	const output = await call_llm_chain(question, context);

	const parsed_output = await parser.parse(output.text);

	return parsed_output.activities as EventResponse[];
}

function generate_inital_prompt(
	events: Event[]
): [ string, string] {
	const question = generate_question(MAX_EVENT_VALUE);

	const context = events
		.map(
			(event, index) =>
				`${index + 1}. ${event.title}: ${event.description}`
		)
		.join("\n\n");

	return [question, context];
}

/**
 * Utilize Langchain to create a list of events
 *
 * @param user_id
 * @param events
 * @returns
 * @beta
 *
 * @todo use user context from event likes in initial event generation
 */
export async function create_init_events_list(
	user_id: string,
	events: Event[]
): Promise<EventResponse[]> {
	const [question, context] = generate_inital_prompt(events);

	const output = await call_llm_chain(question, context);

	const parsed_output = await parser.parse(output);

	return parsed_output.activities as EventResponse[];
}

export async function get_embeddings(texts: string[]): Promise<number[][]> {
	const embeddings = await embedding_model.embedDocuments(texts);
	return embeddings;
}

export async function get_event_embeddings(
	events: Event[]
): Promise<number[][]> {
	const event_texts = events.map((event) => event.title + event.description);
	const event_embeddings = await get_embeddings(event_texts);
	return event_embeddings;
}

export async function generate_final_event(
	recommendation: Recommendation
): Promise<EventResponse> {
	const liked_ids = recommendation.events;
	const liked_events = await get_events(liked_ids);

	const liked_events_text = liked_events
		.map(
			(event, index) =>
				`${index + 1}. ${event.title}: ${event.description}`
		)
		.join("\n\n");

	const context = "User likes the following events:\n\n" + liked_events_text;

	const question =
		"Using the following list of events that the user enjoys, can you create a detailed description of a new activity that the user would enjoy?";

	const template = `Question: {question}

    Context: {context}

    {format_instructions}

    Answer: Here is the activity:
    `;

	const prompt = new PromptTemplate({
		template: template,
		inputVariables: ["question", "context"],
		partialVariables: { format_instructions: format_instructions },
	});

	const llm_chain = new LLMChain({
		prompt: prompt,
		llm: model,
	});

	const output = await llm_chain.call({
		question: question,
		context: context,
	});

	const parsed_output = await parser.parse(output.text);
	const final_event = parsed_output.activities[0] as EventResponse;

	return final_event;
}

/**
 * RAG
 */
async function getLikedEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
        .from('event_likes')
        .select('event_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching liked events:', error.message);
        return [];
    }

    return data.map(item => item.event_id);
}

export async function embedLikedEvents(userId: string): Promise<void> {
    const likedEvents = await getLikedEvents(userId);
    const eventEmbeddings = await embed_events(likedEvents);

    // Store the embeddings in the events table
    for (let i = 0; i < likedEvents.length; i++) {
        const { error } = await supabase
            .from('events')
            .upsert({ id: likedEvents[i], embedding: eventEmbeddings[i] });

        if (error) {
            console.error('Error storing event embedding:', error.message);
        }
    }
}

export async function getSimilarEvents(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .rpc('match_documents', { query_embedding: userId, match_threshold: 0.5, match_count: 5 });

    if (error) {
        console.error('Error fetching similar events:', error.message);
        return [];
    }

    return data.map(event => event.id);
}

export async function generateMoreEvents(similarEvents: string[]): Promise<string> {
    const output = await model.call([
        new SystemChatMessage('Based on the events above, generate more events that both the user and their friend would enjoy doing together'),
        new HumanChatMessage(similarEvents.join('\n')),
	]);
    return output.text;
}