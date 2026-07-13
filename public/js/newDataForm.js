let topicIndex = 0;

const topicsContainer = document.getElementById("topicsContainer");
const addTopicBtn = document.getElementById("addTopicBtn");

addTopicBtn.addEventListener("click", addTopic);
addTopic();

function addTopic() {
  const currentIndex = topicIndex;
  const topicNumber = topicsContainer.children.length + 1;

  const topicDiv = document.createElement("div");
  topicDiv.className = "topic card border-0 bg-light rounded-4 mb-4";

  topicDiv.innerHTML = `
    <div class="card-body p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 mb-0 fw-semibold        ">Topic ${topicNumber}</h2>
        <button type="button" class="removeTopic btn btn-sm btn-outline-danger">
          <i class="fa-solid fa-xmark me-1"></i>Remove
        </button>
      </div>

      <div class="mb-3">
        <label for="topicName-${currentIndex}" class="form-label fw-semibold        ">Topic Name</label>
        <input
          type="text"
          name="topics[${currentIndex}][topicName]"
          id="topicName-${currentIndex}"
          class="form-control rounded-3 border-dark-subtle"
          placeholder="e.g. JavaScript, Project planning..."
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold        ">Subtopics</label>
        <div class="subtopics mt-2"></div>
        <button type="button" class="addSubtopic btn btn-sm btn-outline-info mt-3">
          <i class="fa-solid fa-plus me-1"></i>Add Subtopic
        </button>
      </div>

      <div class="row g-3">
        <div class="col-sm-6">
          <label class="form-label fw-semibold        " for="hour-${currentIndex}">Hours</label>
          <input
            type="number"
            name="topics[${currentIndex}][time][hour]"
            id="hour-${currentIndex}"
            class="form-control rounded-3 border-dark-subtle"
            value="0"
            min="0"
            max="24"
            oninvalid="this.setCustomValidity('Please enter hour between 0 and 24')"
            oninput="this.setCustomValidity('')"
            required
          />
        </div>
        <div class="col-sm-6">
          <label class="form-label fw-semibold        " for="minute-${currentIndex}">Minutes</label>
          <input
            type="number"
            name="topics[${currentIndex}][time][minute]"
            id="minute-${currentIndex}"
            class="form-control rounded-3 border-dark-subtle"
            value="0"
            min="0"
            max="59"
            oninvalid="this.setCustomValidity('Please enter minute between 0 and 59')"
            oninput="this.setCustomValidity('')"
            required
          />
        </div>
      </div>
    </div>
  `;

  topicsContainer.appendChild(topicDiv);

  const subtopicContainer = topicDiv.querySelector(".subtopics");
  addSubtopic(subtopicContainer, currentIndex);

  topicDiv.querySelector(".addSubtopic").addEventListener("click", () => {
    addSubtopic(subtopicContainer, currentIndex);
  });

  topicDiv.querySelector(".removeTopic").addEventListener("click", () => {
    topicDiv.remove();

    if (topicsContainer.children.length === 0) {
      addTopic();
    } else {
      updateTopicNumbers();
    }
  });

  topicIndex++;
}

function addSubtopic(container, topicIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "subtopic d-flex gap-2 mb-2";

  wrapper.innerHTML = `
    <input
      type="text"
      name="topics[${topicIndex}][subtopics][]"
      class="form-control rounded-3 border-dark-subtle"
      placeholder="Enter subtopic"
    />
    <button type="button" class="removeSubtopic btn btn-outline-danger btn-sm">
      <i class="fa-solid fa-minus"></i>
    </button>
  `;

  wrapper.querySelector(".removeSubtopic").addEventListener("click", () => {
    wrapper.remove();
  });

  container.appendChild(wrapper);
}

function updateTopicNumbers() {
  const topicCards = Array.from(topicsContainer.querySelectorAll(".topic"));

  topicCards.forEach((topic, index) => {
    const heading = topic.querySelector("h2, .topic-title");
    if (heading) {
      heading.textContent = `Topic ${index + 1}`;
    }

    const topicNameInput = topic.querySelector('input[name*="[topicName]"]');
    if (topicNameInput) {
      topicNameInput.name = `topics[${index}][topicName]`;
      topicNameInput.id = `topicName-${index}`;
    }

    const topicLabel = topic.querySelector(
      'label[for^="topicName-"], label[for^="topics["]',
    );
    if (topicLabel) {
      topicLabel.setAttribute("for", `topicName-${index}`);
    }

    const subtopicWrappers = topic.querySelectorAll(".subtopic");
    subtopicWrappers.forEach((subtopic, subIndex) => {
      const input = subtopic.querySelector('input[type="text"]');
      if (input) {
        input.name = `topics[${index}][subtopics][]`;
        input.id = `subtopic-${index}-${subIndex}`;
      }

      const label = subtopic.querySelector("label");
      if (label) {
        label.textContent = `Subtopic ${subIndex + 1}`;
        label.setAttribute("for", `subtopic-${index}-${subIndex}`);
      }
    });

    const hourInput = topic.querySelector('input[name$="[time][hour]"]');
    if (hourInput) {
      hourInput.name = `topics[${index}][time][hour]`;
      hourInput.id = `topics[${index}][time][hour]`;
    }

    const minuteInput = topic.querySelector('input[name$="[time][minute]"]');
    if (minuteInput) {
      minuteInput.name = `topics[${index}][time][minute]`;
      minuteInput.id = `topics[${index}][time][minute]`;
    }
  });
}
