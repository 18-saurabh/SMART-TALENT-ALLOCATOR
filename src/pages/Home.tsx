import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BarChart3, Zap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Smart Team Management",
      description: "Intelligently allocate talent based on skills, availability, and project requirements."
    },
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Project Matching",
      description: "Match the right people to the right projects with AI-powered recommendations."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Performance Analytics",
      description: "Track team performance and optimize resource allocation with detailed insights."
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Real-time Insights",
      description: "Get instant visibility into team capacity, utilization, and project status."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Smart Talent
            <span className="text-blue-600 block">Allocation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Optimize your team's potential with intelligent talent allocation. 
            Match skills to opportunities, maximize productivity, and drive success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
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
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="mb-4">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of organizations already using Smart Talent Allocator
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}