export type User = { id: string; username: string; email: string; role?: "user" | "admin" };
export type Topic = { topicName: string; subtopics: string[]; time: { hour: number; minute: number } };
export type LearningLog = { _id: string; date: string; topics: Topic[] };