import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

<<<<<<< HEAD
export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-row bg-white">

      {/* LEFT SIDE - FORM */}
      <div className="w-1/2 min-h-screen flex flex-col justify-center px-8 lg:px-12 xl:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">

          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-10"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap
                className="w-5 h-5 text-white"
                fill="white"
              />
            </div>

            <span className="text-lg font-bold text-gray-900">
              SocialPilot
            </span>
          </Link>

          {/* Heading */}
=======
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SocialPilot</span>
          </Link>

>>>>>>> origin/shravanik-latest-scheduler
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
<<<<<<< HEAD
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>

            <div className="mt-8">
              {children}
            </div>
          </motion.div>

        </div>
      </div>

      {/* RIGHT SIDE - PURPLE VISUAL */}
      <div className="w-1/2 min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">

        {/* Background circles */}
        <div className="absolute inset-0">

          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />

          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />

        </div>

        {/* Right content */}
        <div className="relative h-full flex flex-col justify-center px-12 xl:px-20 text-white">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
          >

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

              <span className="text-xs font-medium">
                Join 50,000+ marketers
              </span>

            </div>

            {/* Heading */}
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              The smartest way to manage your social media
            </h2>

            {/* Description */}
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-md">
              Schedule posts, track campaigns, and grow your audience
              across every platform — all from one beautiful dashboard.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">

=======
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium">Join 50,000+ marketers</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              The smartest way to manage your social media
            </h2>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-md">
              Schedule posts, track campaigns, and grow your audience across every platform — all from one beautiful dashboard.
            </p>

            <div className="mt-10 space-y-4">
>>>>>>> origin/shravanik-latest-scheduler
              {[
                'Schedule to 6+ social platforms at once',
                'AI-powered optimal posting times',
                'Real-time analytics and reporting',
                'Team collaboration built-in',
              ].map((feature, idx) => (
<<<<<<< HEAD

                <motion.div
                  key={feature}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.4 + idx * 0.1,
                  }}
                  className="flex items-center gap-3"
                >

                  <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">

                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>

                  </div>

                  <span className="text-sm text-white/90">
                    {feature}
                  </span>

                </motion.div>

              ))}

            </div>

            {/* Reviews */}
            <div className="mt-12 flex items-center gap-4">

              <div className="flex -space-x-3">

                {[
                  'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/3746314/pexels-photo-3746314.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80',
                ].map((src, i) => (

                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white/80 object-cover"
                  />

                ))}

              </div>

              <div>

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map((i) => (

                    <svg
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>

                  ))}

                </div>

                <p className="text-xs text-white/70 mt-1">
                  4.9/5 from 2,500+ reviews
                </p>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}
=======
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/3746314/pexels-photo-3746314.jpeg?auto=compress&cs=tinysrgb&w=80',
                  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80'].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-white/80 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-white/70 mt-1">4.9/5 from 2,500+ reviews</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> origin/shravanik-latest-scheduler
