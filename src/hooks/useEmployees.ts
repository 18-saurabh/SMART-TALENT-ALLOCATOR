import { useState, useEffect } from 'react';
import { 
  collection, 
  doc,
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Employee {
  uid: string;
  name: string;
  email: string;
  role: string;
  skills: Skill[];
  availability: 'available' | 'limited' | 'unavailable';
  availabilityNotes?: string;
  department?: string;
  position?: string;
  joinedAt?: Date;
  lastUpdated?: Date;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const { userProfile } = useAuth();

  // Fetch all employees
  useEffect(() => {
    const employeesQuery = query(
      collection(db, 'employees'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(employeesQuery, (snapshot) => {
      const employeesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          skills: data.skills || [],
          availability: data.availability || 'available',
          joinedAt: data.joinedAt?.toDate(),
          lastUpdated: data.lastUpdated?.toDate(),
        } as Employee;
      });
      setEmployees(employeesList);
      setFilteredEmployees(employeesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateEmployeeProfile = async (updates: Partial<Employee>) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const employeeRef = doc(db, 'employees', userProfile.uid);
      const updateData = {
        ...updates,
        lastUpdated: new Date()
      };
      
      await updateDoc(employeeRef, updateData);
    } catch (error) {
      console.error('Error updating employee profile:', error);
      throw error;
    }
  };

  const addSkill = async (skill: Skill) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    const currentEmployee = employees.find(emp => emp.uid === userProfile.uid);
    if (!currentEmployee) {
      throw new Error('Employee profile not found');
    }

    const existingSkillIndex = currentEmployee.skills.findIndex(s => 
      s.name.toLowerCase() === skill.name.toLowerCase()
    );

    let updatedSkills;
    if (existingSkillIndex >= 0) {
      // Update existing skill
      updatedSkills = [...currentEmployee.skills];
      updatedSkills[existingSkillIndex] = skill;
    } else {
      // Add new skill
      updatedSkills = [...currentEmployee.skills, skill];
    }

    await updateEmployeeProfile({ skills: updatedSkills });
  };

  const removeSkill = async (skillName: string) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    const currentEmployee = employees.find(emp => emp.uid === userProfile.uid);
    if (!currentEmployee) {
      throw new Error('Employee profile not found');
    }

    const updatedSkills = currentEmployee.skills.filter(skill => 
      skill.name.toLowerCase() !== skillName.toLowerCase()
    );

    await updateEmployeeProfile({ skills: updatedSkills });
  };

  const updateAvailability = async (availability: Employee['availability'], notes?: string) => {
    await updateEmployeeProfile({ 
      availability, 
      availabilityNotes: notes 
    });
  };

  const filterEmployees = (filters: {
    skills?: string[];
    availability?: Employee['availability'][];
    department?: string;
    searchTerm?: string;
  }) => {
    let filtered = [...employees];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(emp =>
        filters.skills!.some(skill =>
          emp.skills.some(empSkill =>
            empSkill.name.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.availability && filters.availability.length > 0) {
      filtered = filtered.filter(emp =>
        filters.availability!.includes(emp.availability)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(emp =>
        emp.department?.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const resetFilters = () => {
    setFilteredEmployees(employees);
  };

  const getSkillSuggestions = () => {
    const allSkills = employees.flatMap(emp => emp.skills.map(skill => skill.name));
    return [...new Set(allSkills)].sort();
  };

  const getCurrentEmployee = () => {
    if (!userProfile) return null;
    return employees.find(emp => emp.uid === userProfile.uid) || null;
  };

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    loading,
    updateEmployeeProfile,
    addSkill,
    removeSkill,
    updateAvailability,
    filterEmployees,
    resetFilters,
    getSkillSuggestions,
    getCurrentEmployee
  };
}