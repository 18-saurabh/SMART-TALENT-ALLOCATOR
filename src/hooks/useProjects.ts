import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  managerId: string;
  managerName: string;
  assignedEmployees: string[];
  assignedEmployeeNames: string[];
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  budget?: number;
  tags: string[];
}

export interface Employee {
  uid: string;
  name: string;
  email: string;
  role: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  // Fetch employees for managers
  useEffect(() => {
    if (userProfile?.role === 'manager') {
      const fetchEmployees = async () => {
        try {
          const employeesQuery = query(collection(db, 'employees'));
          const employeesSnapshot = await getDocs(employeesQuery);
          const employeesList = employeesSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          })) as Employee[];
          setEmployees(employeesList);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      };
      fetchEmployees();
    }
  }, [userProfile]);

  // Fetch projects based on user role
  useEffect(() => {
    if (!userProfile) return;

    let projectsQuery;
    
    if (userProfile.role === 'manager') {
      // Managers see their created projects
      projectsQuery = query(
        collection(db, 'projects'),
        where('managerId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Employees see projects assigned to them
      projectsQuery = query(
        collection(db, 'projects'),
        where('assignedEmployees', 'array-contains', userProfile.uid)
      );
    }

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          deadline: data.deadline?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Project;
      });
      setProjects(projectsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userProfile || userProfile.role !== 'manager') {
      throw new Error('Only managers can create projects');
    }

    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        managerId: userProfile.uid,
        managerName: userProfile.name || 'Manager',
        createdAt: now,
        updatedAt: now,
        deadline: Timestamp.fromDate(projectData.deadline)
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      if (updates.deadline) {
        updateData.deadline = Timestamp.fromDate(updates.deadline);
      }
      
      await updateDoc(projectRef, updateData);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project['status'], progress?: number) => {
    try {
      const updates: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (progress !== undefined) {
        updates.progress = progress;
      }
      
      await updateProject(projectId, updates);
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  };

  return {
    projects,
    employees,
    loading,
    createProject,
    updateProject,
    updateProjectStatus
  };
}