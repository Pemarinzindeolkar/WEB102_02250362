// In-memory database (temporary storage)

// Users
let users = [
    {
      id: 1,
      username: "pema",
      email: "pema@example.com",
      followers: 120,
      following: 80
    },
    {
      id: 2,
      username: "kinley",
      email: "kinley@example.com",
      followers: 200,
      following: 150
    }
  ];
  
  // Videos
  let videos = [
    {
      id: 1,
      title: "My First Video",
      url: "https://example.com/video1.mp4",
      userId: 1,
      likes: 50
    },
    {
      id: 2,
      title: "Travel Vlog",
      url: "https://example.com/video2.mp4",
      userId: 2,
      likes: 75
    }
  ];
  
  // Comments
  let comments = [
    {
      id: 1,
      text: "Nice video!",
      userId: 2,
      videoId: 1
    },
    {
      id: 2,
      text: "Awesome!",
      userId: 1,
      videoId: 2
    }
  ];
  
  // Export all data
  module.exports = {
    users,
    videos,
    comments
  };