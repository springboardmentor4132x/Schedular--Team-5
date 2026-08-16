import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  ChevronDown,
} from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button, Input } from '../components/ui';
import { authService } from '../services/api';

export function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
    role: 'content_creator',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [administratorExists, setAdministratorExists] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const checkAdministrator = async () => {
      try {
        const response = await authService.checkAdministratorExists();

        setAdministratorExists(
          response.data.administrator_exists
        );

        if (response.data.administrator_exists) {
          setForm((previousForm) => ({
            ...previousForm,
            role:
              previousForm.role === 'administrator'
                ? 'content_creator'
                : previousForm.role,
          }));
        }
      } catch (error) {
        console.error(
          'Failed to check administrator status:',
          error
        );

        setErrors({
          general:
            'Unable to verify registration options. Please try again.',
        });
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdministrator();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (form.full_name.trim().length < 2) {
      newErrors.full_name = 'Name is too short';
    }

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.trim().length < 3) {
      newErrors.username =
        'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email =
        'Enter a valid email address';
    }

    if (!form.password) {
      newErrors.password =
        'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password =
        'Minimum 8 characters';
    }

    if (!form.confirm) {
      newErrors.confirm =
        'Confirm your password';
    } else if (
      form.confirm !== form.password
    ) {
      newErrors.confirm =
        'Passwords do not match';
    }

    if (!form.role) {
      newErrors.role =
        'Please select a role';
    }

    if (
      administratorExists &&
      form.role === 'administrator'
    ) {
      newErrors.role =
        'An Administrator account already exists. Please select another role.';
    }

    if (!agree) {
      newErrors.agree =
        'Please accept the terms and privacy policy';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response =
        await authService.register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          role: form.role,
        });

      console.log(
        'Registration successful:',
        response.data
      );

      setSubmitted(true);

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error: any) {
      console.error(
        'Registration failed:',
        error
      );

      let message =
        'Registration failed. Please try again.';

      if (error.response?.data?.detail) {
        if (
          typeof error.response.data.detail ===
          'string'
        ) {
          message =
            error.response.data.detail;
        } else if (
          Array.isArray(
            error.response.data.detail
          )
        ) {
          message =
            error.response.data.detail
              .map(
                (item: any) =>
                  item.msg
              )
              .join(', ');
        }
      } else if (error.message) {
        message = error.message;
      }

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    let strength = 0;

    if (form.password.length >= 8) {
      strength++;
    }

    if (/[A-Z]/.test(form.password)) {
      strength++;
    }

    if (/[0-9]/.test(form.password)) {
      strength++;
    }

    if (
      /[^A-Za-z0-9]/.test(
        form.password
      )
    ) {
      strength++;
    }

    return strength;
  };

  const strength =
    passwordStrength();

  const strengthLabels = [
    '',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ];

  const strengthColors = [
    '',
    'bg-red-400',
    'bg-amber-400',
    'bg-blue-400',
    'bg-emerald-400',
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Create your SocialPilot account and start managing your social media."
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
              Account created successfully!
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Redirecting you to the login page...
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
            className="space-y-4"
          >
            <Input
              label="Full name"
              type="text"
              placeholder="Enter your full name"
              icon={
                <User className="w-4 h-4" />
              }
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name:
                    e.target.value,
                })
              }
              error={errors.full_name}
            />

            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              icon={
                <User className="w-4 h-4" />
              }
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username:
                    e.target.value,
                })
              }
              error={errors.username}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={
                <Mail className="w-4 h-4" />
              }
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
              error={errors.email}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select account role
              </label>

              {checkingAdmin ? (
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-500">
                  Checking available roles...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                    className={`w-full appearance-none px-4 py-2.5 pr-10 bg-white border rounded-xl text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                      errors.role
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="content_creator">
                      Content Creator
                    </option>

                    <option value="marketing_team">
                      Marketing Team
                    </option>

                    <option value="business_user">
                      Business User
                    </option>

                    {!administratorExists && (
                      <option value="administrator">
                        Administrator
                      </option>
                    )}
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {errors.role && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.role}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={
                  <Lock className="w-4 h-4" />
                }
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target.value,
                  })
                }
                error={errors.password}
              />

              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map(
                      (i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= strength
                              ? strengthColors[
                                  strength
                                ]
                              : 'bg-gray-200'
                          }`}
                        />
                      )
                    )}
                  </div>

                  <span className="text-xs text-gray-500 w-10">
                    {
                      strengthLabels[
                        strength
                      ]
                    }
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              icon={
                <Lock className="w-4 h-4" />
              }
              value={form.confirm}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm:
                    e.target.value,
                })
              }
              error={errors.confirm}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() =>
                  setAgree(!agree)
                }
                className={`w-4 h-4 rounded border mt-0.5 transition-all flex items-center justify-center flex-shrink-0 ${
                  agree
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {agree && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>

              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a
                  href="#"
                  className="text-indigo-600 font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-indigo-600 font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            {errors.agree && (
              <p className="text-xs text-red-600 -mt-2">
                {errors.agree}
              </p>
            )}

            {errors.general && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">
                  {errors.general}
                </p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={
                loading ||
                checkingAdmin
              }
              icon={
                !loading &&
                !checkingAdmin ? (
                  <ArrowRight className="w-4 h-4" />
                ) : undefined
              }
            >
              {checkingAdmin
                ? 'Checking roles...'
                : loading
                ? 'Creating account...'
                : 'Create account'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}