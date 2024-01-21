import { useEffect, useState } from "https://esm.sh/preact@10.19.3/hooks";
import "../app.css";
// for demo purposes
const bearer = import.meta.env.VITE_BEARER;

function RecommendationsSelf() {
	const [recommendation, setRecommendation] = useState(null);
	const [feedback, setFeedback] = useState({
		liked: [],
		disliked: [],
		neutral: [],
	});

	const fetchRecommendation = async () => {
		const response = await fetch(
			"http://localhost:54321/functions/v1/recommendations-self",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${bearer}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: "8557cd37-3039-4445-b4a8-623d4f0d9105",
				}),
			}
		);

		if (!response.ok) {
			console.error(
				"Error fetching recommendation:",
				response.statusText
			);
			return;
		}

		const data = await response.json();
		setRecommendation(data);

		setFeedback((prevFeedback) => ({
			...prevFeedback,
			neutral: data.events.map((event) => event.id),
		}));
	};

	const sendFeedback = async () => {
		const response = await fetch(
			"http://localhost:54321/functions/v1/feedback-self",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${bearer}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					recommendation_id: recommendation.id,
					...feedback,
				}),
			}
		);

		if (!response.ok) {
			console.error("Error sending feedback:", response.statusText);
			return;
		}

		const data = await response.json();
		setRecommendation(data);
	};

	const handleFeedback = (eventId, liked) => {
		setFeedback((prevFeedback) => ({
			liked: liked
				? [...prevFeedback.liked, eventId]
				: prevFeedback.liked.filter((id) => id !== eventId),
			disliked: liked
				? prevFeedback.disliked.filter((id) => id !== eventId)
				: [...prevFeedback.disliked, eventId],
            neutral: prevFeedback.neutral.filter((id) => id !== eventId && !liked)
		}));
	};

	return (
		<div id="app">
			<button class="button" onClick={fetchRecommendation}>
				Fetch Recommendations
			</button>

			{recommendation ? (
				<>
                <div class="recommendation-metadata">
                    <pre>{JSON.stringify(recommendation, (key, value) => key === 'events' ? undefined : value, 2)}</pre>
                </div>
					<div class="card-grid">
						{recommendation.events.map((event) => (
							<div class="card">
								<p>{event.title}</p>
								<div>{event.description}</div>
								<div>
									<button
										class={`button ${
											feedback.liked.includes(event.id)
												? "liked"
												: ""
										}`}
										onClick={() =>
											handleFeedback(event.id, true)
										}
									>
										Like
									</button>
									<button
										class={`button ${
											feedback.disliked.includes(event.id)
												? "disliked"
												: ""
										}`}
										onClick={() =>
											handleFeedback(event.id, false)
										}
									>
										Dislike
									</button>
								</div>
							</div>
						))}
					</div>
					<button class="button" onClick={sendFeedback}>
						Submit Feedback
					</button>
				</>
			) : (
				<p>No recommendation fetched yet.</p>
			)}
		</div>
	);
}

export default RecommendationsSelf;
