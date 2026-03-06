import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function OtpStep() {
  const navigate = useNavigate();
  const authRaw = sessionStorage.getItem('gtrack_auth');
  const auth = authRaw ? JSON.parse(authRaw) as { userId: string; email: string; otp: string } : null;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  if (!auth) {
    navigate('/login', { replace: true });
    return null;
  }

  function updateDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerify();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  }

  function handleVerify() {
    const entered = digits.join('');
    if (entered.length < 6) {
      setError('Enter any 6 digits to continue.');
      return;
    }
    // Demo mode: any 6-digit code is accepted
    sessionStorage.setItem('gtrack_auth', JSON.stringify({ ...auth, verified: true }));
    navigate('/welcome');
  }

  const filled = digits.join('').length;

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-[#0D6B50] rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-black">G</span>
            </div>
            <span className="text-white text-2xl font-black tracking-tight">G-Track</span>
          </div>
          <p className="text-gray-400 text-sm">Garage Collective · Project Management</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center justify-center w-14 h-14 bg-[#0D6B50]/20 rounded-full mb-4 mx-auto">
            <ShieldCheck size={24} className="text-[#0D6B50]" />
          </div>

          <h1 className="text-white text-xl font-bold text-center mb-1">Enter verification code</h1>
          <p className="text-gray-400 text-sm text-center mb-3">
            Sent to <span className="text-white font-medium">{auth.email}</span>
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 mb-5 text-center">
            <p className="text-amber-400 text-xs font-semibold">Demo Mode — enter any 6 digits to continue</p>
          </div>

          {/* OTP boxes */}
          <div className={`flex gap-3 justify-center mb-4 ${shake ? 'animate-[wiggle_0.4s_ease]' : ''}`}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => updateDigit(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-white text-xl font-bold bg-[#111111] border rounded-xl 
                  focus:outline-none transition-all
                  ${d ? 'border-[#0D6B50]' : 'border-white/10'}
                  ${error ? 'border-red-500/60' : 'focus:border-[#0D6B50]'}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mb-4">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={filled < 6}
            className="w-full flex items-center justify-center gap-2 bg-[#0D6B50] hover:bg-[#0a5a42] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2"
          >
            Verify Code
          </button>

          <p className="text-gray-500 text-xs text-center mt-4">
            Didn't get the code?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#0D6B50] hover:text-green-400 transition-colors"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
