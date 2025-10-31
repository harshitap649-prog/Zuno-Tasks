import { useState } from 'react';
import { HelpCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function HelpSupport({ user }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!subject.trim()) {
      setError('Please enter a subject for your message.');
      return;
    }

    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }

    if (message.trim().length < 10) {
      setError('Please provide more details in your message (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      // Import here to avoid circular dependencies
      const { submitSupportMessage } = await import('../firebase/firestore');
      const result = await submitSupportMessage(user.uid, {
        subject: subject.trim(),
        message: message.trim(),
        userEmail: user.email,
        userName: user.displayName || 'User',
      });

      if (result.success) {
        setSuccess(true);
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Help & Support</h1>
        <p className="text-gray-600">
          Have a question or need assistance? Send us a message and we'll get back to you soon.
        </p>
      </div>

      <div className="card">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-800 mb-1">Message Sent Successfully!</p>
              <p className="text-sm text-green-700">
                Thank you for contacting us. We've received your message and will respond as soon as possible.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-red-800 mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="What is your message about? (e.g., Withdrawal issue, Account problem)"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Please describe your issue or question in detail. The more information you provide, the better we can help you..."
              required
              disabled={loading}
              minLength={10}
            />
            <p className="mt-2 text-xs text-gray-500">
              {message.length} characters (minimum 10 characters)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Please include as much detail as possible about your issue. This will help us respond to you faster and more accurately.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">How do I earn points?</h4>
              <p className="text-sm text-gray-600">
                You can earn points by completing tasks and watching ads. Each completed task and watched ad gives you points that can be converted to cash.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">How do I withdraw money?</h4>
              <p className="text-sm text-gray-600">
                Go to the Withdraw page, enter your UPI ID or Paytm number, and request a withdrawal. Minimum withdrawal is ₹100 (10,000 points).
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">When will I receive my withdrawal?</h4>
              <p className="text-sm text-gray-600">
                Withdrawals are typically processed within 24-48 hours after approval. You'll receive payment directly to your UPI/Paytm account.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Can I watch more than 3 ads per day?</h4>
              <p className="text-sm text-gray-600">
                You can watch 3 ads per day to earn points. The limit resets at midnight every day automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

