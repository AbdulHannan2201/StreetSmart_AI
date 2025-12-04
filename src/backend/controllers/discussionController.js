const Discussion = require("../models/discussionModel");
const { exec } = require("child_process");
const path = require("path");

// --- Internal Discussions (DB) ---

// Get all discussions
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("author", "name")
      .populate("replies.author", "name")
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new discussion
const createDiscussion = async (req, res) => {
  try {
    const { propertyTitle, locality, rating, text } = req.body;

    const discussion = await Discussion.create({
      propertyTitle,
      locality,
      rating,
      text,
      author: req.user._id,
    });

    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

// Add a reply
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const discussion = await Discussion.findById(req.params.discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    discussion.replies.push({
      author: req.user._id,
      text,
    });

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Like a discussion
const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    discussion.likes += 1;
    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Like a reply
const likeReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.likes += 1;
    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- External Discussions (Reddit Scraper) ---

const scrapeRedditDiscussions = (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  const scriptPath = path.join(__dirname, "../../Scrapper/search_discussions.py");
  const command = `python3 "${scriptPath}" "${query}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      // Don't fail hard, just return empty
      return res.json([]);
    }

    try {
      const results = JSON.parse(stdout);
      res.json(results);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.json([]);
    }
  });
};

module.exports = {
  getDiscussions,
  createDiscussion,
  addReply,
  likeDiscussion,
  likeReply,
  scrapeRedditDiscussions,
};
