import { useState, useEffect, useRef } from 'react';
import { HelpCircle, Send, CheckCircle, AlertCircle, MessageSquare, Clock, DollarSign, Gift, User, Shield, Trash2, Paperclip, ChevronDown, ChevronUp, Sparkles, TrendingUp, Wallet } from 'lucide-react';

export default function HelpSupport({ user }) {
  const [activeView, setActiveView] = useState('faq'); // 'faq' or 'chat'
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const faqData = [
    {
      id: 1,
      question: 'How do I earn points?',
      answer: 'You can earn points by completing tasks and watching ads. Each completed task and watched ad gives you points that can be converted to cash.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 2,
      question: 'How do I withdraw money?',
      answer: 'Go to the Withdraw page, enter your UPI ID or Paytm number, and request a withdrawal. Minimum withdrawal is ₹100 (1,000 points).',
      icon: Wallet,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      question: 'When will I receive my withdrawal?',
      answer: 'Withdrawals are typically processed within 24-48 hours after approval. You\'ll receive payment directly to your UPI/Paytm account.',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 4,
      question: 'Can I watch more than 3 ads per day?',
      answer: 'You can watch 3 ads per day to earn points. The limit resets at midnight every day automatically.',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch user messages
  useEffect(() => {
    if (user) {
      fetchUserMessages();
      // Refresh messages every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchUserMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMessages.length]);

  const fetchUserMessages = async () => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const { getUserSupportMessages } = await import('../firebase/firestore');
      const result = await getUserSupportMessages(user.uid);
      if (result.success) {
        // Flatten messages and replies into a single timeline
        const timeline = [];
        result.messages.forEach((msg) => {
          // Add user message
          timeline.push({
            id: msg.id,
            type: 'user',
            text: msg.message,
            subject: msg.subject,
            timestamp: msg.createdAt,
            status: msg.status,
            messageId: msg.id,
            canDelete: canDeleteMessage(msg),
          });
          
          // Add admin replies
          if (msg.replies && msg.replies.length > 0) {
            msg.replies.forEach((reply, index) => {
              timeline.push({
                id: `${msg.id}-reply-${index}`,
                type: 'admin',
                text: reply.text,
                author: reply.author || 'Support Team',
                timestamp: reply.createdAt,
                messageId: msg.id,
              });
            });
          }
        });
        
        // Sort by timestamp
        timeline.sort((a, b) => {
          const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
          const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
          return dateA - dateB;
        });
        
        setUserMessages(timeline);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch (err) {
      return 'Recently';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };

  const canDeleteMessage = (msg) => {
    if (!msg.createdAt) return false;
    try {
      const createdAt = msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt);
      const now = new Date();
      const diffInHours = (now - createdAt) / (1000 * 60 * 60);
      return diffInHours < 1;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }

    if (message.trim().length < 3) {
      setError('Please provide more details in your message (at least 3 characters).');
      return;
    }

    setLoading(true);

    try {
      const { submitSupportMessage } = await import('../firebase/firestore');
      const result = await submitSupportMessage(user.uid, {
        subject: message.trim().substring(0, 50) || 'Support Request',
        message: message.trim(),
        userEmail: user.email,
        userName: user.displayName || 'User',
      });

      if (result.success) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
        await fetchUserMessages();
        inputRef.current?.focus();
      } else {
        setError(result.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Support message error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setDeletingMessage(messageId);
    setError('');
    try {
      const { deleteSupportMessage } = await import('../firebase/firestore');
      const result = await deleteSupportMessage(messageId, user.uid);
      
      if (result.success) {
        await fetchUserMessages();
      } else {
        setError(result.error || 'Failed to delete message.');
      }
    } catch (err) {
      setError('An error occurred while deleting message.');
      console.error('Delete error:', err);
    } finally {
      setDeletingMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Top Heading Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg mb-4 px-6 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-white text-center">
            We're here to help you
          </h1>
        </div>

        {/* View Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('faq')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeView === 'faq'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Send Message
              {userMessages.filter(m => m.type === 'user').length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeView === 'chat' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {userMessages.filter(m => m.type === 'user').length}
                </span>
              )}
            </button>
            </div>
        </div>

        {/* FAQ Section */}
        {activeView === 'faq' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
              </div>
              <p className="text-sm text-gray-600 ml-14">Find answers to common questions about earning points, withdrawals, and more.</p>
      </div>

            <div className="space-y-3">
              {faqData.map((faq) => {
                const Icon = faq.icon;
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-purple-300"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className={`bg-gradient-to-r ${faq.color} p-3 rounded-lg shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">{faq.question}</h3>
                      </div>
                      <div className={`ml-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    </button>
                    {isExpanded && (
                      <div className="px-6 py-4 bg-white border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-4">
                          <div className={`bg-gradient-to-r ${faq.color} p-2 rounded-lg mt-1 flex-shrink-0`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">{faq.answer}</p>
            </div>
          </div>
        )}
                  </div>
                );
              })}
            </div>

            {/* Still Need Help Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Still need help?</h3>
                  <p className="text-xs text-gray-600 mb-2">If you can't find the answer you're looking for, send us a message and we'll get back to you soon.</p>
                  <button
                    onClick={() => setActiveView('chat')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Contact Support
                  </button>
                    </div>
                  </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        {activeView === 'chat' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between border-b border-purple-500">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Shield className="w-5 h-5 text-white" />
              </div>
          <div>
                <h2 className="text-lg font-bold text-white">Support Chat</h2>
                <p className="text-xs text-purple-100">Get help from our support team</p>
              </div>
          </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-white">{userMessages.filter(m => m.type === 'user').length} conversations</span>
                  </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ height: 'calc(100% - 140px)' }}>
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : userMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-6 mb-4">
                  <MessageSquare className="w-12 h-12 text-purple-600" />
                    </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                <p className="text-sm text-gray-500 max-w-md">Start a conversation with our support team. We're here to help you with any questions or issues.</p>
                  </div>
            ) : (
              <div className="space-y-3">
                {userMessages.map((item, index) => {
                  const showDateSeparator = index === 0 || 
                    (userMessages[index - 1] && 
                     new Date(item.timestamp).toDateString() !== new Date(userMessages[index - 1].timestamp).toDateString());
                  
                  return (
                    <div key={item.id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-200">
                            {new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </span>
          </div>
                      )}
                      
                      {item.type === 'user' ? (
                        <div className="flex items-end justify-end gap-2 mb-2">
                          <div className="max-w-[70%] lg:max-w-[60%]">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md">
                              {item.subject && (
                                <div className="font-semibold text-sm mb-1">{item.subject}</div>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                                <span className="text-xs opacity-75">{formatTime(item.timestamp)}</span>
                                {item.canDelete && (
          <button
                                    onClick={() => handleDeleteMessage(item.messageId)}
                                    disabled={deletingMessage === item.messageId}
                                    className="ml-2 p-1 hover:bg-white/20 rounded transition-all disabled:opacity-50"
                                    title="Delete message"
                                  >
                                    {deletingMessage === item.messageId ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
            )}
          </button>
                )}
              </div>
                    </div>
                  </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                </div>
              ) : (
                        <div className="flex items-end justify-start gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div className="max-w-[70%] lg:max-w-[60%]">
                            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-md border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-blue-600">{item.author}</span>
                                <span className="text-xs text-gray-400">{formatTime(item.timestamp)}</span>
                          </div>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.text}</p>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                </div>
              )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
                </div>
              </div>
          )}
          
          {success && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Message sent successfully!</span>
                  </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-gray-50 focus:bg-white transition-all text-sm"
                  disabled={loading}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute right-3 bottom-3">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  </div>
            </div>
              <button
                type="submit"
                disabled={loading || !message.trim() || message.trim().length < 3}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {message.length >= 3 ? (
                <span className="text-green-600">✓ Ready to send</span>
              ) : (
                <span>Minimum 3 characters required</span>
              )}
              </p>
                </div>
              </div>
        )}
      </div>
    </div>
  );
}
