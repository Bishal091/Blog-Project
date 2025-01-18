import React, { useState } from "react";
import { useRouter } from "next/router";
import { fetchPostDetails, createComment } from "../lib/api";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

const PostDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [comment, setComment] = useState("");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPostDetails(id);
        setPost(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add a comment!");
      router.push("/login");
      return;
    }

    try {
      await createComment(id, comment, token);
      setComment("");
      toast.success("Comment added successfully!");
      // Refetch post details to update comments
      const updatedPost = await fetchPostDetails(id);
      setPost(updatedPost);
    } catch (error) {
      toast.error("Error adding comment: " + error.message);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <>
      <button
        className="fixed px-3 py-1 rounded-lg flex items-center gap-2 text-black"
        onClick={() => router.push("/")}
      >
        <FaArrowLeft className="text-indigo-600 cursor-pointer bg-gray-400 rounded-full p-1" size={36} />
        <p className="hidden md:block">Back</p>
      </button>
      <div className="container mx-auto p-4 px-20">
        {/* Post Details */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-lg p-6 my-8 flex flex-col md:flex-row justify-between"
        >
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <p className="text-sm text-gray-500">
              Author: <span className="font-bold">{post.author.username}</span> |{" "}
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 md:ml-4 justify-start md:justify-end items-start">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          {post.comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            <ul>
              {post.comments.map((comment) => (
                <motion.li
                  key={comment.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gray-100 p-4 rounded-md mb-4"
                >
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500">
                    By: <span className="font-bold">{comment.author.username}</span> |{" "}
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Comment Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4">Add a Comment</h3>
          <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Write your comment here..."
              rows="4"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Submit Comment
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default PostDetail;