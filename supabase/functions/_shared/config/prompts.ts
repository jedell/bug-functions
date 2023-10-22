const activityListTemplate = `Question: {question}

    Context: {context}

    {format_instructions}

    Answer: Here is the list of activities:
    `;

const finalActivityTemplate = `Question: {question}

    Context: {context}

    {format_instructions}

    Answer: Here is the activity:
    `;

const generateEventsPrompt = `Using the following information about the user's preferences, create a list of {number} new activities that the user would enjoy as well.`

const finalEventPrompt = "Using the following list of events that the user enjoys, can you create a detailed description of a new activity that the user would enjoy?";

const friendGeneratePrompt = 'Based on the events above, generate more events that both the user and their friend would enjoy doing together'

export {
    activityListTemplate,
    finalActivityTemplate,
    generateEventsPrompt,
    finalEventPrompt,
    friendGeneratePrompt
}
