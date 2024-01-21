
export enum RecommendationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    FEEDBACK = 'feedback',
}

export enum RecommendationType {
    SELF = 'self',
    FRIEND = 'friend',
    GROUP = 'group',
}

export interface Location {
    latitude: number;
    longitude: number;
  }

export interface User {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    friends: string[];
    location: Location;
  }
  
  export interface Event {
    id: string;
    title: string;
    description: string;
    location?: Location;
    url?: string;
    embedding?: number[][],
    metadata?: any;
  }
  
  export interface Feedback {
    liked: string[];
    disliked: string[];
    neutral: string[];
  }
  
  export interface EventFeedback {
    event: Event;
    feedback: Feedback;
  }

  export interface EventResponse {
    title: string;
    description: string;
  }

  export interface ActivityResponse {
    activities: EventResponse[]
  }
  
  export interface Like {
    id: string;
    from_user: string;
    to_user: string;
    event_id: string;
  }
  
  export interface Recommendation {
    id: string;
    events: Event[];
    user_id: string;
    other_user_ids?: string[];
    type: RecommendationType;
    status: RecommendationStatus;
    date: Date
    [key: string]: any;
  }
  
  export interface FeedbackRequest {
    id: string;
    feedback_data: Feedback[];
  }
  
  export interface FeedbackResponse {
    updated_recommendations: Event[];
  }