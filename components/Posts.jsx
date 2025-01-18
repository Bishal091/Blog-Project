import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { fetchPosts, likePost } from "../lib/api";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaSpinner,
  FaEllipsisV,
  FaUser,
  FaEdit,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaRocket,
  FaUsers,
  FaTag,
  FaShareAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PostOptionsMenu = ({ postId, authorId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-700">
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md z-10 border">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              // Implement report post logic
              setIsOpen(false);
            }}
          >
            Report Post
          </button>
        </div>
      )}
    </div>
  );
};

const Posts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleLikeToggle = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to like/unlike this post!");
      router.push("/login");
      return;
    }

    try {
      const updatedPost = await likePost(postId, token);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: updatedPost.likes,
              }
            : post
        )
      );
    } catch (error) {
      toast.error("Failed to toggle like: " + error.message);
    }
  };

  const isPostLiked = (postId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return false;
    const post = posts.find((p) => p.id === postId);
    return post.likes.some((like) => like.user_id === user.id);
  };

  const filteredPosts = posts
    .filter((post) => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "likes") {
        return b.likes.length - a.likes.length;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Morning";
    if (currentHour < 18) return "Afternoon";
    return "Evening";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <motion.span initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <FaSpinner className="h-10 w-10 text-indigo-600 animate-spin" />
        </motion.span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 text-xl">Failed to load posts. {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100 flex flex-col md:flex-row items-center"
      >
        <div className="flex-grow">
          <h1 className="text-2xl font-medium font-sans text-gray-800 mb-2">
            {getGreeting()}, Welcome to <span>Burrr</span>
          </h1>
          <p className="text-lg italic tracking-wide text-gray-600">Explore, share, and connect with the community.</p>
        </div>
        <Link
          href="/create"
          className="ml-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center space-x-2"
        >
          <FaEdit />
          <span>Create Post</span>
        </Link>
      </motion.div>

      {/* Search and Sort Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0"
      >
        <div className="flex w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search posts by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2 border border-r-0 border-gray-300 rounded-l-lg rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="absolute right-0 top-0 bottom-0 bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 transition-all duration-300 flex items-center">
              <FaSearch />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="sort" className="text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Date</option>
            <option value="likes">Likes</option>
            <option value="title">Title</option>
          </select>
          {sortBy === "date" && <FaSortAmountDown className="text-indigo-600" />}
          {sortBy === "likes" && <FaSortAmountUp className="text-indigo-600" />}
        </div>
      </motion.div>

      {/* Posts Section */}
      {filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No posts found. Be the first to create one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full p-2">
                      <FaUser className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{post.author.username}</h3>
                      <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <PostOptionsMenu postId={post.id} authorId={post.author.id} />
                </div>
                <Link href={`/post/${post.id}`} className="block">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition">{post.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                </Link>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-end justify-end space-x-2 p-1">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <Link
                      href={`/post/${post.id}`}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition"
                    >
                      +{post.tags.length - 2}
                    </Link>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center p-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                  >
                    {isPostLiked(post.id) ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                    <span className="text-sm">{post.likes.length}</span>
                  </button>
                  <Link
                    href={`/post/${post.id}`}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-600"
                  >
                    <FaComment size={24} />
                    <span className="text-sm">{post.comments.length}</span>
                  </Link>
                </div>
                <Link href={`/post/${post.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Read More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;