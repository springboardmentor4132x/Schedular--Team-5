import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Calendar, BarChart3, Megaphone, Share2, Bell, Check,
  ArrowRight, Star, Sparkles, Shield, Clock, Users, TrendingUp,
} from 'lucide-react';

import {
  FaFacebook, 
  FaTwitter,
  FaLinkedin,
  FaInstagram
} from 'react-icons/fa';
import { Button } from '../components/ui';

const features = [
  { icon: Calendar, title: 'Smart Scheduling', description: 'Schedule posts across all platforms with AI-powered optimal timing recommendations.', color: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Track engagement, reach, and conversions with beautiful, real-time dashboards.', color: 'from-violet-500 to-purple-500' },
  { icon: Megaphone, title: 'Campaign Management', description: 'Create, manage, and track marketing campaigns from a single unified workspace.', color: 'from-amber-500 to-orange-500' },
  { icon: Share2, title: 'Multi-Platform', description: 'Connect and manage Facebook, Instagram, Twitter, LinkedIn, and YouTube accounts.', color: 'from-emerald-500 to-teal-500' },
  { icon: Bell, title: 'Smart Notifications', description: 'Never miss a beat with intelligent alerts for posts, campaigns, and milestones.', color: 'from-rose-500 to-pink-500' },
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption and SOC 2 compliance to keep your data safe and secure.', color: 'from-indigo-500 to-blue-500' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Posts Scheduled' },
  { value: '12K+', label: 'Campaigns Run' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'CMO, TechCorp', avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'SocialPilot transformed our social media workflow. We save 15+ hours every week and our engagement has never been higher.', rating: 5 },
  { name: 'James Rodriguez', role: 'Founder, StartupHub', avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'The analytics dashboard is incredible. We can finally see which campaigns actually drive revenue. Game changer.', rating: 5 },
  { name: 'Priya Sharma', role: 'Social Media Manager', avatar: 'https://images.pexels.com/photos/3746314/pexels-photo-3746314.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Managing 6 social accounts used to be a nightmare. Now it takes me 30 minutes a day. The scheduling AI is brilliant.', rating: 5 },
  { name: 'Michael Chen', role: 'Marketing Director', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Best social media tool we have used. The campaign tracking and ROI reporting features are exactly what we needed.', rating: 5 },
];

const pricingPlans = [
  { name: 'Starter', price: '$19', period: '/mo', features: ['3 social accounts', '100 scheduled posts', 'Basic analytics', 'Email support'], popular: false },
  { name: 'Professional', price: '$49', period: '/mo', features: ['10 social accounts', 'Unlimited posts', 'Advanced analytics', 'Campaign management', 'Priority support', 'Team collaboration'], popular: true },
  { name: 'Enterprise', price: '$99', period: '/mo', features: ['Unlimited accounts', 'Unlimited everything', 'Custom analytics', 'API access', 'Dedicated manager', 'SSO & SAML'], popular: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SocialPilot</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/register"><Button size="sm" className="hidden sm:inline-flex">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">AI-Powered Social Media Management</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight text-balance">
                Manage all your <span className="gradient-text">social media</span> in one place
              </motion.h1>

              <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                Schedule posts, track campaigns, and analyze performance across every platform. Save hours every week and grow your audience faster.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>Start free trial</Button>
                </Link>
                <Link to="/app/dashboard">
                  <Button variant="secondary" size="lg" icon={<BarChart3 className="w-5 h-5" />}>View demo dashboard</Button>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {['A', 'S', 'M', 'P'][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Loved by 50,000+ marketers</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-400 font-medium">socialpilot.io/dashboard</div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Followers', value: '83.6K', icon: Users, color: 'from-indigo-500 to-violet-500' },
                      { label: 'Engagement', value: '9.2%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Scheduled', value: '43', icon: Clock, color: 'from-amber-500 to-orange-500' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ y: -2 }}
                        className="bg-gray-50 rounded-xl p-3"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-700">Engagement Overview</p>
                      <span className="text-xs text-emerald-600 font-medium">+12.5%</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {[40, 55, 45, 70, 60, 85, 75, 95, 80, 100, 90, 110].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {[FaFacebook, FaInstagram, FaTwitter, FaLinkedin].map((Icon, i) => (
                      <div key={i} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">FEATURES</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-gray-600">
              Powerful tools designed to streamline your social media management and drive real results.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow hover:card-shadow-hover transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">TESTIMONIALS</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Trusted by thousands of teams
            </h2>
            <p className="mt-4 text-gray-600">
              See what our customers have to say about their experience with SocialPilot.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">PRICING</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-600">Choose the plan that works for you. No hidden fees.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white rounded-2xl p-6 border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'} card-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <Link to="/register" className="block mt-5">
                  <Button fullWidth variant={plan.popular ? 'primary' : 'secondary'}>Get started</Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-8 py-16 text-center"
          >
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to transform your social media?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Join 50,000+ marketers who save hours every week with SocialPilot. Start your free 14-day trial today.
              </p>
              <Link to="/register" className="inline-block mt-8">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 hover:shadow-xl" icon={<ArrowRight className="w-5 h-5" />}>
                  Start your free trial
                </Button>
              </Link>
              <p className="mt-4 text-xs text-white/70">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-base font-bold text-gray-900">SocialPilot</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                The all-in-one social media management platform for modern marketing teams.
              </p>
              <div className="flex gap-3 mt-4">
                {[FaTwitter, FaFacebook, FaInstagram, FaLinkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Press'] },
              { title: 'Resources', links: ['Help Center', 'Community', 'Tutorials', 'Status', 'Security'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 SocialPilot, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
