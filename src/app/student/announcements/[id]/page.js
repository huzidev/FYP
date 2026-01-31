"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MessageCircle,
  Reply,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../../../Component/Header";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(null);
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Mock current student - replace with actual auth context
  const currentStudent = {
    id: 1,
    fullName: "John Doe",
    studentId: "STU001",
  };

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement();
    }
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);

        // Fetch queries if it's a QUESTION type
        if (data.type === "QUESTION") {
          fetchQueries();
        }
      } else {
        console.error("Failed to fetch announcement");
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const response = await fetch(
        `/api/announcements/queries?announcementId=${params.id}`,
      );

      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries || []);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();

    if (!newQuery.trim()) return;

    try {
      setSubmittingQuery(true);
      const response = await fetch("/api/announcements/queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newQuery,
          announcementId: parseInt(params.id),
          userId: currentStudent.id,
        }),
      });

      if (response.ok) {
        setNewQuery("");
        fetchQueries(); // Refresh queries
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit query");
      }
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Failed to submit query");
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleSummarize = async () => {
    if (!announcement?.content) return;

    try {
      setSummarizing(true);
      const response = await fetch("/api/announcements/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: announcement.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to generate summary");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!announcement) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Announcement not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-indigo-600 hover:text-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            Back to Announcements
          </button>

          {/* Announcement Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.type === "QUESTION"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {announcement.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {announcement.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {announcement.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="mr-2" />
                      <span>Posted by {announcement.createdByType}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2" />
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            {announcement.imageUrl && (
              <div className="w-full">
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            </div>

            {/* AI Summary Button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Summary Display */}
            {summary && (
              <div className="mx-6 mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-3">
                  <Sparkles className="text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Summary
                  </h3>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{summary}</div>
              </div>
            )}
          </div>

          {/* Queries Section (only for QUESTION type) */}
          {announcement.type === "QUESTION" && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <MessageCircle className="text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Questions & Queries ({queries.length})
                  </h2>
                </div>
              </div>

              {/* Query Form */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleSubmitQuery}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newQuery}
                      onChange={(e) => setNewQuery(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={submittingQuery}
                    />
                    <button
                      type="submit"
                      disabled={submittingQuery || !newQuery.trim()}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="mr-2" />
                      {submittingQuery ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Queries List */}
              <div className="p-6">
                {queries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No queries yet. Be the first to ask a question!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {queries.map((query) => (
                      <div
                        key={query.id}
                        className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span className="font-medium">
                                {query.student?.fullName || `Student #${query.userId}`}
                              </span>
                              {query.student?.studentId && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({query.student.studentId})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(query.createdAt)}
                            </div>
                          </div>
                          <p className="text-gray-700">{query.content}</p>
                        </div>

                        {/* Replies Section */}
                        {query.replies && query.replies.length > 0 && (
                          <div className="bg-white border-t border-gray-200">
                            <div className="p-3 space-y-3">
                              {query.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="pl-4 border-l-2 border-indigo-200"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center text-sm">
                                      <Reply className="w-3 h-3 mr-2 text-indigo-600" />
                                      <span className="font-medium text-indigo-600">
                                        {reply.repliedBy?.fullName || 'Staff'}
                                      </span>
                                      <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                        {reply.repliedBy?.role || reply.repliedByType}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
