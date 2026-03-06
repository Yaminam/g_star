import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { USERS } from '../../data';
import { generateOtp } from '../../helpers';

export function EmailStep() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const user = USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError('No account found with this email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Demo mode: OTP is just for show — any 6 digits will be accepted on the next screen
      const otp = generateOtp();
      sessionStorage.setItem('gtrack_auth', JSON.stringify({ userId: user.id, email: user.email, otp }));
      setDemoOtp(otp);
      setLoading(false);
    }, 600);
  }

  function handleContinue() {
    navigate('/otp');
  }

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
          {!demoOtp ? (
            <>
              <h1 className="text-white text-xl font-bold mb-1">Sign in to G-Track</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your work email to receive a one-time code.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@garagecollective.io"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#0D6B50] transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                      <AlertCircle size={12} />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-[#0D6B50] hover:bg-[#0a5a42] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Mail size={15} /> Send OTP</>
                  )}
                </button>
              </form>

              {/* Demo hint */}
              <div className="mt-6 p-3 bg-[#111111] border border-white/5 rounded-xl">
                <p className="text-gray-500 text-xs font-medium mb-1">Demo accounts</p>
                <div className="space-y-0.5">
                  {[
                    { label: 'Director (BOSS)',  email: 'rajan@garagecollective.io'  },
                    { label: 'Team Lead',        email: 'priya@garagecollective.io' },
                    { label: 'Member',           email: 'rohit@garagecollective.io' },
                  ].map(({ label, email: e }) => (
                    <button key={e} onClick={() => setEmail(e)} className="block w-full text-left text-xs text-gray-400 hover:text-white transition-colors py-0.5">
                      <span className="text-[#0D6B50]">{label}:</span> {e}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* OTP sent confirmation */
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0D6B50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-[#0D6B50]" />
              </div>
              <h2 className="text-white text-lg font-bold mb-1">Check your email!</h2>
              <p className="text-gray-400 text-sm mb-5">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
              {/* Demo banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Demo Mode</p>
                <p className="text-amber-300/80 text-xs">No real email sent. On the next screen, enter <span className="text-amber-300 font-bold">any 6 digits</span> to continue.</p>
              </div>
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 bg-[#0D6B50] hover:bg-[#0a5a42] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Enter OTP <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
