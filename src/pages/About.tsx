import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      name: "Saurabh Patel",
      role: "Team Lead Developer",
      description: "Full-stack developer with expertise in React, Node.js, and system architecture. Passionate about building scalable solutions.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Shivansu Pasi",
      role: "UI/UX Designer",
      description: "Creative designer focused on user-centered design and modern interfaces. Expert in Figma, design systems, and user research.",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Aditya Pandey",
      role: "Research AI Specialist",
      description: "AI/ML expert specializing in talent matching algorithms and predictive analytics for workforce optimization.",
      image: "https://images.pexels.com/photos/2102415/pexels-photo-2102415.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Meet Our Team
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're a passionate team of developers, designers, and AI specialists 
            working together to revolutionize talent management and allocation.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 md:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovate</h3>
              <p className="text-gray-600">
                Leverage cutting-edge AI and machine learning to create smarter talent allocation solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Optimize</h3>
              <p className="text-gray-600">
                Help organizations maximize their human potential through intelligent matching and analytics.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Empower</h3>
              <p className="text-gray-600">
                Enable both managers and employees to reach their full potential in the right roles.
              </p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {member.description}
                </p>
                <div className="flex space-x-3">
                  <button className="p-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full transition-colors duration-200">
                    <Github className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full transition-colors duration-200">
                    <Linkedin className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full transition-colors duration-200">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
              <p className="text-blue-100">
                We constantly push boundaries to create better solutions for talent management.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Collaboration</h3>
              <p className="text-blue-100">
                Great things happen when talented people work together towards a common goal.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Excellence</h3>
              <p className="text-blue-100">
                We strive for the highest quality in everything we build and deliver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}