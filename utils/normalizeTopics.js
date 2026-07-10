export default function normalizeTopics(topics) {
  const topicList = Array.isArray(topics)
    ? topics
    : topics && typeof topics === "object"
      ? Object.values(topics)
      : [];

  return topicList
    .filter((topic) => topic?.topicName && topic.topicName.trim() !== "")
    .map((topic) => {
      const subtopics = Array.isArray(topic.subtopics)
        ? topic.subtopics
        : topic.subtopics
          ? [topic.subtopics]
          : [];

      return {
        ...topic,
        subtopics: subtopics.filter(
          (subtopic) => subtopic && subtopic.trim() !== ""
        ),
      };
    });
}