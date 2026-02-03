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

  const currentStudent = {
    id: 1,
    fullName: "John Doe",
    studentId: "STU001",
  };

  useEffect(() => {
    if (params.id) fetchAnnouncement();
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
        if (data.type === "QUESTION") fetchQueries();
      }
    } catch (error) {
      console.error(error);
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
      console.error(error);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    try {
      setSubmittingQuery(true);
      const response = await fetch("/api/announcements/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newQuery,
          announcementId: parseInt(params.id),
          userId: currentStudent.id,
        }),
      });
      if (response.ok) {
        setNewQuery("");
        fetchQueries();
      }
    } catch (error) {
      console.error(error);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: announcement.content }),
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading announcement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!announcement) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-400">Announcement not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-indigo-500 hover:text-indigo-400"
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
      <div className="min-h-screen bg-[#1d1d24] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            Back to Announcements
          </button>

          {/* Announcement Card */}
          <div className="bg-[#25252b] rounded-lg shadow-sm border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.type === "QUESTION"
                          ? "bg-blue-800 text-blue-100"
                          : "bg-green-800 text-green-100"
                      }`}
                    >
                      {announcement.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.isActive
                          ? "bg-emerald-800 text-emerald-100"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {announcement.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {announcement.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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

            {announcement.imageUrl && (
              <div className="w-full">
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div
                className="prose max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            </div>

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

            {summary && (
              <div className="mx-6 mb-6 p-6 bg-[#2b2b33] rounded-lg border border-gray-700">
                <div className="flex items-center mb-3">
                  <Sparkles className="text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    AI Summary
                  </h3>
                </div>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
              </div>
            )}
          </div>

          {announcement.type === "QUESTION" && (
            <div className="mt-6 bg-[#25252b] rounded-lg shadow-sm border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center">
                  <MessageCircle className="text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">
                    Questions & Queries ({queries.length})
                  </h2>
                </div>
              </div>

              <div className="p-6 border-b border-gray-700 bg-[#1d1d24]">
                <form onSubmit={handleSubmitQuery}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newQuery}
                      onChange={(e) => setNewQuery(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 px-4 py-2 border border-gray-600 bg-[#1d1d24] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200"
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

              <div className="p-6">
                {queries.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No queries yet. Be the first to ask a question!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {queries.map((query) => (
                      <div
                        key={query.id}
                        className="bg-[#1d1d24] rounded-lg border border-gray-700 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-300">
                              <User className="w-4 h-4 mr-2" />
                              <span className="font-medium">
                                {query.student?.fullName ||
                                  `Student #${query.userId}`}
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
                          <p className="text-gray-300">{query.content}</p>
                        </div>

                        {query.replies && query.replies.length > 0 && (
                          <div className="border-t border-gray-700">
                            <div className="p-3 space-y-3">
                              {query.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="pl-4 border-l-2 border-indigo-500"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center text-sm text-indigo-400">
                                      <Reply className="w-3 h-3 mr-2" />
                                      <span className="font-medium">
                                        {reply.repliedBy?.fullName || "Staff"}
                                      </span>
                                      <span className="ml-2 px-2 py-0.5 bg-indigo-700 text-indigo-100 text-xs rounded-full">
                                        {reply.repliedBy?.role ||
                                          reply.repliedByType}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">
                                    {reply.content}
                                  </p>
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
