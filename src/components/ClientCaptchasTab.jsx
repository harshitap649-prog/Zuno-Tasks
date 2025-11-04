import { useState } from 'react';
import { Plus, ShieldCheck, Loader2 } from 'lucide-react';
import { submitClientCaptcha } from '../firebase/firestore';

export default function ClientCaptchasTab({ captchas, onReload }) {
  const [showTestForm, setShowTestForm] = useState(false);
  const [testFormData, setTestFormData] = useState({
    captchaImage: '',
    captchaType: 'image',
    clientId: 'test-client',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    if (!testFormData.captchaImage) {
      alert('Please enter a base64 image or URL');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitClientCaptcha(testFormData);
      if (result.success) {
        alert(`✅ Test captcha submitted! Captcha ID: ${result.captchaId}\n\nUsers can now see and solve this captcha.`);
        setTestFormData({ captchaImage: '', captchaType: 'image', clientId: 'test-client' });
        setShowTestForm(false);
        onReload();
      } else {
        alert('Failed to submit: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'solving': return 'bg-blue-100 text-blue-800';
      case 'solved': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const pendingCount = captchas.filter(c => c.status === 'pending').length;
  const solvingCount = captchas.filter(c => c.status === 'solving').length;
  const solvedCount = captchas.filter(c => c.status === 'solved').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Client Captchas</h2>
        <button
          onClick={() => setShowTestForm(!showTestForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Submit Test Captcha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600">Solving</p>
          <p className="text-2xl font-bold text-blue-600">{solvingCount}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-gray-600">Solved</p>
          <p className="text-2xl font-bold text-green-600">{solvedCount}</p>
        </div>
      </div>

      {/* Test Submission Form */}
      {showTestForm && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Submit Test Captcha</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use this form to test the captcha system. You can submit a base64 image or URL.
          </p>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captcha Image (Base64 or URL)
              </label>
              <textarea
                value={testFormData.captchaImage}
                onChange={(e) => setTestFormData({ ...testFormData, captchaImage: e.target.value })}
                placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... or https://example.com/captcha.png"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Use a base64 image converter or paste a direct image URL
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={testFormData.clientId}
                onChange={(e) => setTestFormData({ ...testFormData, clientId: e.target.value })}
                placeholder="test-client"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Submit Test Captcha
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowTestForm(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Captchas List */}
      {captchas.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No captchas submitted yet.</p>
          <button
            onClick={() => setShowTestForm(true)}
            className="btn-primary"
          >
            Submit Test Captcha
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {captchas.map((captcha) => {
            const imageSrc = captcha.captchaImage && !captcha.captchaImage.startsWith('http') && !captcha.captchaImage.startsWith('data:image')
              ? `data:image/png;base64,${captcha.captchaImage}` 
              : captcha.captchaImage;
            
            return (
              <div key={captcha.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(captcha.status)}`}>
                        {captcha.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">ID: {captcha.captchaId || captcha.id}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Client: <strong>{captcha.clientId || 'anonymous'}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {formatDate(captcha.submittedAt)}
                    </p>
                    {captcha.assignedTo && (
                      <p className="text-xs text-gray-500">
                        Assigned to: {captcha.assignedTo}
                      </p>
                    )}
                    {captcha.solvedAt && (
                      <p className="text-xs text-green-600">
                        Solved: {formatDate(captcha.solvedAt)}
                      </p>
                    )}
                    {captcha.solution && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm font-semibold text-green-800">Solution:</p>
                        <p className="text-lg font-mono text-green-900">{captcha.solution}</p>
                      </div>
                    )}
                    {captcha.pointsAwarded && (
                      <p className="text-xs text-purple-600 mt-1">
                        Points awarded: {captcha.pointsAwarded}
                      </p>
                    )}
                  </div>
                </div>
                
                {captcha.captchaImage && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Captcha Image:</p>
                    <div className="flex justify-center">
                      <img 
                        src={imageSrc} 
                        alt="Captcha" 
                        className="max-w-full h-auto border border-gray-300 rounded"
                        style={{ maxHeight: '150px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'block';
                          }
                        }}
                      />
                      <span style={{ display: 'none', color: '#999' }}>Invalid image</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

