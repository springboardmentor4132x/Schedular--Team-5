import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button, Input } from '../components/ui';
import { FaGithub,  FaFacebook } from 'react-icons/fa';
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => navigate('/app/dashboard'), 800);
    }, 1200);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue managing your social media.">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4"
            >
              <Check className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900">Welcome back!</h3>
            <p className="text-sm text-gray-500 mt-1">Redirecting to your dashboard...</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${remember ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}
                >
                  {remember && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} icon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
               { icon: FaGithub, label: 'GitHub' },
               { icon: FaFacebook, label: 'Facebook' },
               ].map((provider) => (
                <button
                  key={provider.label}
                  type="button"

                  className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <provider.icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign up free
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
