import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button, Input } from '../components/ui';
import { authService } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.login(
        username.trim(),
        password
      );

      console.log('Login response:', response.data);

      const token =
        response.data?.access_token ||
        response.data?.token ||
        response.data?.accessToken;

      if (!token) {
        throw new Error(
          'Login successful, but no access token was returned by the backend.'
        );
      }

      localStorage.setItem(
        'auth_token',
        token
      );

      const meResponse =
        await authService.getMe();

      console.log(
        'Current user response:',
        meResponse.data
      );

      const currentUser =
        meResponse.data;

      const role =
        currentUser?.role;

      if (!role) {
        localStorage.removeItem(
          'auth_token'
        );

        throw new Error(
          'Login successful, but the user role could not be determined.'
        );
      }

      localStorage.setItem(
        'user_role',
        role
      );

      localStorage.setItem(
        'username',
        currentUser.username
      );

      console.log(
        'Logged in user role:',
        role
      );

      setSubmitted(true);

      setTimeout(() => {
        navigate('/app/dashboard');
      }, 800);
    } catch (error: any) {
      console.error(
        'Login failed:',
        error
      );

      let message =
        'Login failed. Please check your username and password and try again.';

      if (
        error.response?.data?.detail
      ) {
        message =
          typeof error.response.data.detail ===
          'string'
            ? error.response.data.detail
            : 'Invalid username or password.';
      } else if (error.message) {
        message =
          error.message;
      }

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue managing your social media."
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex flex-col items-center text-center py-8"
          >
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4"
            >
              <Check className="w-8 h-8 text-emerald-600" />
            </motion.div>

            <h3 className="text-lg font-semibold text-gray-900">
              Welcome back!
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Redirecting to your dashboard...
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              icon={
                <User className="w-4 h-4" />
              }
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              error={errors.username}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={
                <Lock className="w-4 h-4" />
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              error={errors.password}
            />

            {errors.general && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">
                  {errors.general}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() =>
                    setRemember(
                      !remember
                    )
                  }
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    remember
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {remember && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>

                <span className="text-sm text-gray-600">
                  Remember me
                </span>
              </label>

              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              icon={
                !loading ? (
                  <ArrowRight className="w-4 h-4" />
                ) : undefined
              }
            >
              {loading
                ? 'Signing in...'
                : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign up free
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}