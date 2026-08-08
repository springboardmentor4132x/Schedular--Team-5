import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button, Input } from '../components/ui';
import { FaGithub } from 'react-icons/fa';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Name is required';
    else if (form.name.length < 2) e.name = 'Name too short';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirm) e.confirm = 'Confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (!agree) e.agree = 'Please accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => navigate('/app/dashboard'), 1000);
    }, 1400);
  };

  const passwordStrength = () => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];

  return (
    <AuthLayout title="Create your account" subtitle="Start your 14-day free trial. No credit card required.">
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
            <h3 className="text-lg font-semibold text-gray-900">Account created!</h3>
            <p className="text-sm text-gray-500 mt-1">Welcome to SocialPilot. Setting up your workspace...</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Full name"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="w-4 h-4" />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 w-10">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              icon={<Lock className="w-4 h-4" />}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgree(!agree)}
                className={`w-4 h-4 rounded border mt-0.5 transition-all flex items-center justify-center flex-shrink-0 ${agree ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}
              >
                {agree && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 font-medium">Terms of Service</a> and{' '}
                <a href="#" className="text-indigo-600 font-medium">Privacy Policy</a>
              </span>
            </label>
            {errors.agree && <p className="text-xs text-red-600 -mt-2">{errors.agree}</p>}

            <Button type="submit" fullWidth size="lg" loading={loading} icon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-500">or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {icon: FaGithub, label: 'Github'}

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
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
