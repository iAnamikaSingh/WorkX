const addTopicBtn =
  typeof document !== "undefined"
    ? document.getElementById("addTopicBtn")
    : null;

function reindexTopicData(topicEntries) {
  return topicEntries.map((topicEntry, index) => ({
    ...topicEntry,
    topicKey: index,
    heading: `Topic ${index + 1}`,
  }));
}

function reindexTopics() {
  if (typeof document === "undefined") {
    return;
  }

  const topicElements = Array.from(document.querySelectorAll(".topic"));
  const reindexedTopics = reindexTopicData(
    topicElements.map((topicElement) => ({ element: topicElement })),
  );

  reindexedTopics.forEach(({ element }, index) => {
    const topicTitle = element.querySelector(".topic-title");
    if (topicTitle) {
      topicTitle.textContent = `Topic ${index + 1}`;
    }

    const topicNameInput = element.querySelector('input[name*="[topicName]"]');
    if (topicNameInput) {
      topicNameInput.name = `topics[${index}][topicName]`;
      topicNameInput.id = `topics[${index}]`;

      const topicLabel = element.querySelector('label[for^="topics["]');
      if (topicLabel) {
        topicLabel.setAttribute("for", `topics[${index}]`);
      }
    }

    const subtopics = Array.from(element.querySelectorAll(".subtopic"));
    subtopics.forEach((subtopic, subIndex) => {
      const input = subtopic.querySelector('input[type="text"]');
      const label = subtopic.querySelector("label");
      if (input) {
        input.name = `topics[${index}][subtopics][]`;
        input.id = `subtopic-${index}-${subIndex}`;
      }
      if (label) {
        label.textContent = `Subtopic ${subIndex + 1}`;
        label.setAttribute("for", `subtopic-${index}-${subIndex}`);
      }
    });

    const hourInput = element.querySelector('input[name$="[time][hour]"]');
    if (hourInput) {
      hourInput.name = `topics[${index}][time][hour]`;
      hourInput.id = `topics[${index}][time][hour]`;

      const hourLabel = element.querySelector('label[for$="[time][hour]"]');
      if (hourLabel) {
        hourLabel.setAttribute("for", `topics[${index}][time][hour]`);
      }
    }

    const minuteInput = element.querySelector('input[name$="[time][minute]"]');
    if (minuteInput) {
      minuteInput.name = `topics[${index}][time][minute]`;
      minuteInput.id = `topics[${index}][time][minute]`;

      const minuteLabel = element.querySelector('label[for$="[time][minute]"]');
      if (minuteLabel) {
        minuteLabel.setAttribute("for", `topics[${index}][time][minute]`);
      }
    }
  });
}

if (addTopicBtn) {
  addTopicBtn.addEventListener("click", () => {
    const nextTopicIndex = document.querySelectorAll(".topic").length;
    const topicDiv = document.createElement("div");
    topicDiv.className = "topic card border-0 bg-light rounded-4 mb-4";

    topicDiv.innerHTML = `
      <div class="card-body p-4">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <h3 class="topic-title h5 mb-0 fw-semibold         ">Topic ${nextTopicIndex + 1}</h3>
          <button type="button" class="removeTopic btn btn-sm btn-outline-danger">
            <i class="fa-solid fa-xmark me-1"></i>Remove
          </button>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold         " for="topics[${nextTopicIndex}]">Topic Name</label>
          <input
            type="text"
            name="topics[${nextTopicIndex}][topicName]"
            id="topics[${nextTopicIndex}]"
            class="form-control rounded-3 border-dark-subtle"
            required
          >
        </div>

        <div class="subtopics mt-4">
          <div class="subtopic mb-3">
            <label class="form-label fw-semibold         " for="subtopic-${nextTopicIndex}-0">Subtopic 1</label>
            <div class="d-flex gap-2">
              <input
                type="text"
                name="topics[${nextTopicIndex}][subtopics][]"
                id="subtopic-${nextTopicIndex}-0"
                class="form-control rounded-3 border-dark-subtle"
              >
              <button type="button" class="removeSubtopic btn btn-outline-danger btn-sm">
                <i class="fa-solid fa-minus"></i>
              </button>
            </div>
          </div>
        </div>

        <button type="button" class="addSubtopic btn btn-sm btn-outline-info">
          <i class="fa-solid fa-plus me-1"></i>Add Subtopic
        </button>

        <div class="row g-3 mt-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold         " for="topics[${nextTopicIndex}][time][hour]">Hour</label>
            <input
              type="number"
              name="topics[${nextTopicIndex}][time][hour]"
              id="topics[${nextTopicIndex}][time][hour]"
              value="0"
              min="0"
              max="24"
              oninvalid="this.setCustomValidity('Please enter hour between 0 and 24')"
              oninput="this.setCustomValidity('')"
              class="form-control rounded-3 border-dark-subtle"
              required
            >
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold         " for="topics[${nextTopicIndex}][time][minute]">Minute</label>
            <input
              type="number"
              name="topics[${nextTopicIndex}][time][minute]"
              id="topics[${nextTopicIndex}][time][minute]"
              value="0"
              min="0"
              max="59"
              oninvalid="this.setCustomValidity('Please enter minute between 0 and 59')"
              oninput="this.setCustomValidity('')"
              class="form-control rounded-3 border-dark-subtle"
              required
            >
          </div>
        </div>
      </div>
    `;

    const buttonWrapper = addTopicBtn.parentElement;
    if (buttonWrapper) {
      buttonWrapper.before(topicDiv);
    } else {
      addTopicBtn.before(topicDiv);
    }
    reindexTopics();
  });
}

document.addEventListener("click", (e) => {
  const addSubtopicBtn = e.target.closest(".addSubtopic");
  if (addSubtopicBtn) {
    const topicDiv = addSubtopicBtn.closest(".topic");
    const subtopicsDiv = topicDiv.querySelector(".subtopics");
    const topicNameInput = topicDiv.querySelector('input[name*="[topicName]"]');
    const match = topicNameInput
      ? topicNameInput.name.match(/topics\[(\d+)\]/)
      : null;
    const topicKey = match ? match[1] : "0";
    const subtopicCount = subtopicsDiv.querySelectorAll(".subtopic").length;
    const subtopicDiv = document.createElement("div");

    subtopicDiv.className = "subtopic mb-3";
    subtopicDiv.innerHTML = `
      <label class="form-label fw-semibold         " for="subtopic-${topicKey}-${subtopicCount}">Subtopic ${subtopicCount + 1}</label>
      <div class="d-flex gap-2">
        <input
          type="text"
          name="topics[${topicKey}][subtopics][]"
          id="subtopic-${topicKey}-${subtopicCount}"
          class="form-control rounded-3 border-dark-subtle"
        >
        <button type="button" class="removeSubtopic btn btn-outline-danger btn-sm">
          <i class="fa-solid fa-minus"></i>
        </button>
      </div>
    `;

    subtopicsDiv.appendChild(subtopicDiv);
    reindexTopics();
    return;
  }

  const removeTopicBtn = e.target.closest(".removeTopic");
  if (removeTopicBtn) {
    removeTopicBtn.closest(".topic").remove();
    reindexTopics();
    return;
  }

  const removeSubtopicBtn = e.target.closest(".removeSubtopic");
  if (removeSubtopicBtn) {
    removeSubtopicBtn.closest(".subtopic").remove();
    reindexTopics();
  }
});

if (typeof document !== "undefined") {
  reindexTopics();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { reindexTopicData };
}
