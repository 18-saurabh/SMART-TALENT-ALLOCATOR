import React from 'react';
import { Target, Plus } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from './ProjectCard';

export default function ProjectsGrid() {
  const { projects, loading, updateProjectStatus } = useProjects();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 animate-float-up hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 animate-float-up">My Projects</h2>
        <span className="text-sm text-gray-500 animate-pulse">{projects.length} total</span>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12 animate-float-down">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Assigned</h3>
          <p className="text-gray-600 mb-6">You don't have any projects assigned yet. Check back later or contact your manager.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 animate-float-up">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isManager={false}
                onStatusUpdate={updateProjectStatus}
              />
            ))}
          </div>
          
          {/* Quick Submit Section */}
          <div className="border-t border-gray-200 pt-6 animate-float-down">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 animate-float-up">Quick Submit for Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects
                .filter(p => p.status === 'in-progress')
                .map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90">
                    <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Progress: {project.progress}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => updateProjectStatus(project.id, 'review', Math.max(project.progress, 90))}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-purple-700"
                    >
                      Submit for Review
                    </button>
                  </div>
                ))}
              {projects.filter(p => p.status === 'in-progress').length === 0 && (
                <div className="col-span-full text-center py-4 animate-float-up">
                  <p className="text-gray-500">No projects ready for submission</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}