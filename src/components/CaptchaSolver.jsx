import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { 
  getAdminSettings, 
  getPendingCaptchas, 
  assignCaptchaToUser, 
  submitCaptchaSolution 
} from '../firebase/firestore';

const DEFAULT_POINTS_PER_CAPTCHA = 1; // Default points awarded per solved captcha

export default function CaptchaSolver({ userId, onComplete }) {
  const [currentCaptcha, setCurrentCaptcha] = useState(null); // Current captcha from Firestore
  const [captchaImage, setCaptchaImage] = useState(null); // For display (math or image)
  const [solution, setSolution] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, solving, success, error
  const [message, setMessage] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [pointsPerCaptcha, setPointsPerCaptcha] = useState(DEFAULT_POINTS_PER_CAPTCHA);
  const [captchaType, setCaptchaType] = useState('math'); // 'math' or 'image'
  const solvingRef = useRef(false);
  const refreshIntervalRef = useRef(null);

  // Load points per captcha from admin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await getAdminSettings();
        if (result.success && result.settings?.captchaPointsPerSolve) {
          setPointsPerCaptcha(result.settings.captchaPointsPerSolve);
        }
      } catch (error) {
        console.error('Error loading captcha settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Get a new captcha - try client captchas first, fallback to math
  const getNewCaptcha = async () => {
    if (solvingRef.current) return;
    
    setStatus('loading');
    setSolution('');
    setMessage('');
    setPointsAwarded(false);
    setCaptchaImage(null);
    setCurrentCaptcha(null);

    try {
      // Step 1: Try to get a real client captcha from Firestore
      const pendingResult = await getPendingCaptchas(1);
      
      if (pendingResult.success && pendingResult.captchas.length > 0) {
        const clientCaptcha = pendingResult.captchas[0];
        
        // Assign this captcha to the current user
        const assignResult = await assignCaptchaToUser(clientCaptcha.id, userId);
        
        if (assignResult.success) {
          setCurrentCaptcha(clientCaptcha);
          
          // Handle image captcha
          if (clientCaptcha.captchaType === 'image' && clientCaptcha.captchaImage) {
            setCaptchaType('image');
            // Handle base64 image
            let imageSrc = clientCaptcha.captchaImage;
            if (!imageSrc.startsWith('data:image') && !imageSrc.startsWith('http')) {
              // Assume it's base64 without prefix
              imageSrc = `data:image/png;base64,${imageSrc}`;
            }
            setCaptchaImage({ type: 'image', src: imageSrc, id: clientCaptcha.id });
            setStatus('solving');
            setMessage('Solve the captcha below (from a real client)');
            return;
          } else {
            // Fallback to math if captcha type is unknown
            generateMathCaptcha();
          }
        } else {
          console.error('Failed to assign captcha:', assignResult.error);
          // Fallback to math captcha
          generateMathCaptcha();
        }
      } else {
        // No client captchas available, generate math captcha as fallback
        generateMathCaptcha();
      }
      
    } catch (error) {
      console.error('Error getting captcha:', error);
      // Fallback to math captcha on error
      generateMathCaptcha();
    }
  };

  // Generate a simple math captcha as fallback
  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    const captchaData = {
      type: 'math',
      question: `${num1} + ${num2} = ?`,
      answer: answer.toString(),
      id: `math_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setCaptchaType('math');
    setCaptchaImage(captchaData);
    setStatus('solving');
    setMessage('Solve the captcha below (practice mode - no client captchas available)');
    
    // Store answer in sessionStorage for math captchas
    sessionStorage.setItem(`captcha_${captchaData.id}`, captchaData.answer);
  };

  // Submit the solution
  const submitSolution = async () => {
    if (!solution.trim() || pointsAwarded || solvingRef.current) {
      return;
    }

    solvingRef.current = true;
    setStatus('loading');
    setMessage('Submitting solution...');

    try {
      // If it's a client captcha, submit to Firestore
      if (currentCaptcha && captchaType !== 'math') {
        const result = await submitCaptchaSolution(currentCaptcha.id, userId, solution.trim());
        
        if (result.success) {
          setPointsAwarded(true);
          setStatus('success');
          setMessage(`✅ Correct! You earned ${result.pointsAwarded} point(s)! Solution sent to client.`);
          
          // Callback to refresh user data
          if (onComplete) {
            setTimeout(() => {
              onComplete();
              // Auto-get new captcha after 2 seconds
              setTimeout(() => {
                solvingRef.current = false;
                getNewCaptcha();
              }, 2000);
            }, 1500);
          } else {
            setTimeout(() => {
              solvingRef.current = false;
              getNewCaptcha();
            }, 2000);
          }
        } else {
          throw new Error(result.error || 'Failed to submit solution');
        }
      } 
      // If it's a math captcha (fallback), verify locally
      else if (captchaType === 'math' && captchaImage) {
        const storedAnswer = sessionStorage.getItem(`captcha_${captchaImage.id}`);
        
        if (!storedAnswer) {
          throw new Error('Captcha expired. Please get a new one.');
        }

        // Verify solution (case-insensitive, trim whitespace)
        const userAnswer = solution.trim().toLowerCase();
        const correctAnswer = storedAnswer.toLowerCase();

        if (userAnswer === correctAnswer) {
          // For math captchas, we still award points (practice mode)
          // Note: This uses updateUserPoints directly since it's not a client captcha
          const { updateUserPoints } = await import('../firebase/firestore');
          const result = await updateUserPoints(userId, pointsPerCaptcha, 'captcha');
          
          if (result.success) {
            setPointsAwarded(true);
            setStatus('success');
            setMessage(`✅ Correct! You earned ${pointsPerCaptcha} point(s)!`);
            
            // Clear stored answer
            sessionStorage.removeItem(`captcha_${captchaImage.id}`);
            
            // Callback to refresh user data
            if (onComplete) {
              setTimeout(() => {
                onComplete();
                setTimeout(() => {
                  solvingRef.current = false;
                  getNewCaptcha();
                }, 2000);
              }, 1500);
            } else {
              setTimeout(() => {
                solvingRef.current = false;
                getNewCaptcha();
              }, 2000);
            }
          } else {
            throw new Error(result.error || 'Failed to award points');
          }
        } else {
          setStatus('error');
          setMessage('❌ Incorrect answer. Please try again.');
          solvingRef.current = false;
        }
      } else {
        throw new Error('No captcha to solve');
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to submit solution. Please try again.');
      solvingRef.current = false;
    }
  };

  // Load first captcha on mount and set up auto-refresh
  useEffect(() => {
    getNewCaptcha();
    
    // Auto-refresh pending captchas every 10 seconds (if no captcha is being solved)
    refreshIntervalRef.current = setInterval(() => {
      if (!solvingRef.current && !currentCaptcha && status !== 'solving') {
        getNewCaptcha();
      }
    }, 10000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Solve Captcha</h3>
        <button
          onClick={() => {
            solvingRef.current = false;
            getNewCaptcha();
          }}
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          New Captcha
        </button>
      </div>

      {status === 'loading' && !captchaImage && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading captcha...</span>
        </div>
      )}

      {/* Math Captcha Display */}
      {captchaImage && captchaType === 'math' && captchaImage.type === 'math' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Solve this math problem:</p>
            <p className="text-4xl font-bold text-gray-800">{captchaImage.question}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter your answer:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitSolution()}
                placeholder="Your answer"
                disabled={status === 'loading' || pointsAwarded}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                autoFocus
              />
              <button
                onClick={submitSolution}
                disabled={status === 'loading' || !solution.trim() || pointsAwarded}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Captcha Display (from real clients) */}
      {captchaImage && captchaType === 'image' && captchaImage.type === 'image' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">Solve this image captcha (from a real client):</p>
            <div className="flex justify-center">
              <img 
                src={captchaImage.src} 
                alt="Captcha to solve" 
                className="max-w-full h-auto border border-gray-300 rounded"
                style={{ maxHeight: '200px' }}
              />
            </div>
            {currentCaptcha && (
              <p className="text-xs text-gray-500 mt-2">
                Client ID: {currentCaptcha.clientId || 'anonymous'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter the captcha text:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitSolution()}
                placeholder="Enter captcha text (case-sensitive)"
                disabled={status === 'loading' || pointsAwarded}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 uppercase"
                autoFocus
                style={{ textTransform: 'uppercase' }}
              />
              <button
                onClick={submitSolution}
                disabled={status === 'loading' || !solution.trim() || pointsAwarded}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              💡 This is a real captcha from a client. Your solution will be sent to them.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          status === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : status === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Earn <strong>{pointsPerCaptcha} point(s)</strong> per solved captcha. 
          {pointsAwarded && ' Points awarded!'}
        </p>
      </div>
    </div>
  );
}

