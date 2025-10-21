import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BarChart3, Zap, Sparkles, Brain, Rocket } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-[#4B6AFF]" />,
      title: "Smart Team Management",
      description: "Intelligently allocate talent based on skills, availability, and project requirements."
    },
    {
      icon: <Target className="h-8 w-8 text-[#4B6AFF]" />,
      title: "Project Matching",
      description: "Match the right people to the right projects with AI-powered recommendations."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#4B6AFF]" />,
      title: "Performance Analytics",
      description: "Track team performance and optimize resource allocation with detailed insights."
    },
    {
      icon: <Zap className="h-8 w-8 text-[#FF6F61]" />,
      title: "Real-time Insights",
      description: "Get instant visibility into team capacity, utilization, and project status."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FBFF] pt-16">
      <section className="hero-gradient py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6 animate-fadeIn">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <Brain className="h-5 w-5 text-white animate-pulse" />
              <span className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                AI-Powered Talent Management
              </span>
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white animate-fadeInUp leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Smart Talent<br />
            <span className="text-white">Allocation</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeInUp px-4" style={{ fontFamily: 'var(--font-body)' }}>
            Optimize your team's potential with intelligent talent allocation.
            Match skills to opportunities, maximize productivity, and drive success with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp">
            <Link
              to="/signup"
              className="modern-btn flex items-center space-x-2 text-base"
            >
              <Rocket className="h-5 w-5" />
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{ background: 'var(--gradient-card)' }}>
              <Sparkles className="h-4 w-4 text-[#4B6AFF]" />
              <span className="text-sm font-medium text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading)' }}>
                Why Choose Us
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-3 sm:mb-4 px-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Why Choose Smart Talent Allocator?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#4A4A4A] max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-body)' }}>
              Revolutionize how you manage and allocate talent in your organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="modern-card group animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {feature.title}
                </h3>
                <p className="text-[#4A4A4A] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fadeIn">
            <Rocket className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Ready to Transform?
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 animate-fadeInUp px-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Ready to Transform Your Team?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 animate-fadeInUp px-4" style={{ fontFamily: 'var(--font-body)' }}>
            Join thousands of organizations already using Smart Talent Allocator
          </p>
          <Link
            to="/signup"
            className="bg-white text-[#4B6AFF] px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 shadow-xl animate-fadeInUp"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
