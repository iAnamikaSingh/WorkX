import express from "express";
import Learning_Log from "../models/log.js";
import normalizeTopics from "../utils/normalizeTopics.js";

const router = express.Router();

router.get("/logs", async (req, res) => {
  const data = await Learning_Log.find({ owner: req.user._id }).sort({ date: -1 });
  res.render("logs.ejs", {
    data,
    title: "My Logs",
  });
});

router.get("/log/new", (req, res) => {
  res.render("newDataForm.ejs", {
    title: "Create a new log",
  });
});

router.post("/logs", async (req, res) => {
  try {
    const topics = normalizeTopics(req.body.topics);

    if (topics.length === 0) {
      req.session.error =
        "Please add at least one topic before saving.";
      return res.redirect("/log/new");
    }

    req.body.topics = topics;

    const newLog = new Learning_Log({
      ...req.body,
      owner: req.user._id,
    });

    await newLog.save();

    req.session.success = "Log saved successfully";

    res.redirect("/logs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving log");
  }
});

router.get("/log/:id/edit", async (req, res) => {
  const { id } = req.params;

  const log = await Learning_Log.findOne({ _id: id, owner: req.user._id });

  if (!log) {
    req.session.error = "Log not found or you do not have permission to edit it.";
    return res.redirect("/logs");
  }

  res.render("editForm.ejs", {
    log,
    title: "Edit your log",
  });
});

router.put("/log/:id", async (req, res) => {
  const { id } = req.params;

  const topics = normalizeTopics(req.body.topics);

  if (topics.length === 0) {
    req.session.error =
      "Please add at least one topic before saving.";

    return res.redirect(`/log/${id}/edit`);
  }

  req.body.topics = topics;

  const existingLog = await Learning_Log.findOne({ _id: id, owner: req.user._id });

  if (!existingLog) {
    req.session.error = "You cannot update this log.";
    return res.redirect("/logs");
  }

  await Learning_Log.findOneAndUpdate(
    { _id: id, owner: req.user._id },
    req.body,
    {
      runValidators: true,
      returnDocument: "after",
    }
  );

  req.session.success =
    "Log updated successfully";

  res.redirect("/logs");
});

router.delete(
  "/log/:id/topic/:topicIndex",
  async (req, res) => {
    const { id, topicIndex } = req.params;

    try {
      const log =
        await Learning_Log.findOne({ _id: id, owner: req.user._id });

      if (!log) {
        req.session.error = "Log not found or you do not have permission to edit it.";
        return res.redirect("/logs");
      }

      const parsedTopicIndex =
        Number(topicIndex);

      if (
        !Number.isInteger(parsedTopicIndex) ||
        parsedTopicIndex < 0 ||
        parsedTopicIndex >= log.topics.length
      ) {
        req.session.error =
          "Invalid topic selected.";

        return res.redirect("/logs");
      }

      log.topics.splice(parsedTopicIndex, 1);

      await log.save();

      req.session.success =
        "Topic deleted successfully.";

      res.redirect("/logs");
    } catch (err) {
      console.error(err);

      req.session.error =
        "Unable to delete topic.";

      res.redirect("/logs");
    }
  }
);

router.delete(
  "/log/:id/topic/:topicIndex/subtopic/:subIndex",
  async (req, res) => {
    const { id, topicIndex, subIndex } =
      req.params;

    try {
      const log =
        await Learning_Log.findOne({ _id: id, owner: req.user._id });

      if (!log) {
        req.session.error = "Log not found or you do not have permission to edit it.";
        return res.redirect("/logs");
      }

      const parsedTopicIndex =
        Number(topicIndex);

      const parsedSubIndex =
        Number(subIndex);

      if (
        !Number.isInteger(parsedTopicIndex) ||
        parsedTopicIndex < 0 ||
        parsedTopicIndex >= log.topics.length
      ) {
        req.session.error =
          "Invalid topic selected.";

        return res.redirect("/logs");
      }

      const topic =
        log.topics[parsedTopicIndex];

      if (
        !topic ||
        !Array.isArray(topic.subtopics)
      ) {
        req.session.error =
          "Topic does not have subtopics.";

        return res.redirect("/logs");
      }

      if (
        !Number.isInteger(parsedSubIndex) ||
        parsedSubIndex < 0 ||
        parsedSubIndex >= topic.subtopics.length
      ) {
        req.session.error =
          "Invalid subtopic selected.";

        return res.redirect("/logs");
      }

      topic.subtopics.splice(
        parsedSubIndex,
        1
      );

      await log.save();

      req.session.success =
        "Subtopic deleted successfully.";

      res.redirect("/logs");
    } catch (err) {
      console.error(err);

      req.session.error =
        "Unable to delete subtopic.";

      res.redirect("/logs");
    }
  }
);

router.delete("/log/:id", async (req, res) => {
  const { id } = req.params;

  const deletedLog = await Learning_Log.findOneAndDelete({ _id: id, owner: req.user._id });

  if (!deletedLog) {
    req.session.error = "Log not found or you do not have permission to delete it.";
    return res.redirect("/logs");
  }

  req.session.success =
    "Log deleted successfully";

  res.redirect("/logs");
});

export default router;