import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BarChart3, Zap, Sparkles, Brain, Rocket } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600 animate-float-up" />,
      title: "Smart Team Management",
      description: "Intelligently allocate talent based on skills, availability, and project requirements."
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600 animate-float-down" />,
      title: "Project Matching",
      description: "Match the right people to the right projects with AI-powered recommendations."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-cyan-600 animate-float-up" />,
      title: "Performance Analytics",
      description: "Track team performance and optimize resource allocation with detailed insights."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600 animate-float-rotate" />,
      title: "Real-time Insights",
      description: "Get instant visibility into team capacity, utilization, and project status."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-down"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-rotate"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-over-spline px-6 py-3 rounded-full">
              <Brain className="h-5 w-5 text-blue-600 animate-pulse-glow" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Talent Management</span>
              <Sparkles className="h-4 w-4 text-purple-600 animate-float-rotate" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-gray-900">Smart Talent</span>
            <span className="gradient-text block animate-gradient">Allocation</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Optimize your team's potential with <span className="font-semibold text-blue-600">intelligent talent allocation</span>. 
            Match skills to opportunities, maximize productivity, and drive success with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="modern-btn animate-pulse-glow flex items-center space-x-2 shadow-lg"
            >
              <Rocket className="h-5 w-5" />
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-float-up">
              Why Choose Smart Talent Allocator?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionize how you manage and allocate talent in your organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="modern-card p-8 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 animate-gradient"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Rocket className="h-4 w-4 text-white animate-float-up" />
              <span className="text-sm font-medium text-white">Ready to Transform?</span>
            </div>
            
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-float-up">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-float-down">
            Join <span className="font-bold">thousands of organizations</span> already using Smart Talent Allocator
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 shadow-2xl animate-pulse-glow"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}