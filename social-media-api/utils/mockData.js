const users = [
  {
    id: 1,
    username: "karma_dorji",
    full_name: "Karma Dorji",
    email: "karma@example.com",
    bio: "Travel photographer from Bhutan",
    profile_picture: "https://i.pravatar.cc/150?img=12",
    created_at: "2024-01-01"
  },
  {
    id: 2,
    username: "sonam_gyeltshen",
    full_name: "Sonam Gyeltshen",
    email: "sonam@example.com",
    bio: "Nature lover 🌿",
    profile_picture: "https://i.pravatar.cc/150?img=5",
    created_at: "2024-01-02"
  },
  {
    id: 3,
    username: "pema_wangchuk",
    full_name: "Pema Wangchuk",
    email: "pema@example.com",
    bio: "Mountain explorer",
    profile_picture: "https://i.pravatar.cc/150?img=8",
    created_at: "2024-01-05"
  }
];

const posts = [
  {
    id: 1,
    user_id: 1,
    caption: "Beautiful sunrise in Bhutan 🌄",
    image_url: "https://picsum.photos/500/300",
    created_at: "2024-02-01"
  },
  {
    id: 2,
    user_id: 2,
    caption: "Hiking the mountains today!",
    image_url: "https://picsum.photos/500/301",
    created_at: "2024-02-02"
  },
  {
    id: 3,
    user_id: 3,
    caption: "Peaceful monastery view 🙏",
    image_url: "https://picsum.photos/500/302",
    created_at: "2024-02-03"
  }
];

const comments = [
  {
    id: 1,
    post_id: 1,
    user_id: 2,
    text: "Amazing photo!",
    created_at: "2024-02-03"
  },
  {
    id: 2,
    post_id: 2,
    user_id: 1,
    text: "Looks like a great hike!",
    created_at: "2024-02-04"
  },
  {
    id: 3,
    post_id: 3,
    user_id: 1,
    text: "Such a peaceful place!",
    created_at: "2024-02-05"
  }
];

const likes = [
  {
    id: 1,
    post_id: 1,
    user_id: 2
  },
  {
    id: 2,
    post_id: 1,
    user_id: 3
  },
  {
    id: 3,
    post_id: 2,
    user_id: 1
  }
];

const followers = [
  {
    id: 1,
    follower_id: 1,
    following_id: 2
  },
  {
    id: 2,
    follower_id: 2,
    following_id: 1
  },
  {
    id: 3,
    follower_id: 3,
    following_id: 1
  }
];

module.exports = {
  users,
  posts,
  comments,
  likes,
  followers
};