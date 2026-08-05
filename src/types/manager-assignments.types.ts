import React from 'react';

export interface ProjectInfo {
  id: string;
  name: string;
  status: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  projects: ProjectInfo[];
}

export interface ManagerData {
  id: string;
  name: string;
  email: string;
  role: string;
  employees: TeamMember[];
  teamLeads: TeamMember[];
}

export interface CorporateHierarchyTreeProps {
  managers: ManagerData[];
  expandedNodes: Record<string, boolean>;
  toggleNode: (nodeId: string) => void;
  setSelectedManagerId: (id: string | null) => void;
  getInitials: (name: string) => string;
  getGradient: (name: string) => string;
  getBgColor: (name: string) => string;
}

export interface ManagerAssignmentEditorProps {
  selectedManager: ManagerData | null;
  saving: boolean;
  assignedTeamLeadIds: string[];
  setAssignedTeamLeadIds: React.Dispatch<React.SetStateAction<string[]>>;
  assignedEmployeeIds: string[];
  setAssignedEmployeeIds: React.Dispatch<React.SetStateAction<string[]>>;
  teamLeadSearch: string;
  setTeamLeadSearch: (val: string) => void;
  employeeSearch: string;
  setEmployeeSearch: (val: string) => void;
  showTeamLeadDropdown: boolean;
  setShowTeamLeadDropdown: (show: boolean) => void;
  showEmployeeDropdown: boolean;
  setShowEmployeeDropdown: (show: boolean) => void;
  availableTeamLeads: any[];
  availableEmployees: any[];
  allUsers: any[];
  managers: ManagerData[];
  selectedManagerId: string | null;
  handleSave: () => Promise<void>;
  setSelectedManagerId: (id: string | null) => void;
  getInitials: (name: string) => string;
  getGradient: (name: string) => string;
  getBgColor: (name: string) => string;
}

export interface ManagersListPanelProps {
  managers: ManagerData[];
  filteredManagers: ManagerData[];
  managerSearch: string;
  setManagerSearch: (search: string) => void;
  selectedManagerId: string | null;
  setSelectedManagerId: (id: string | null) => void;
  getInitials: (name: string) => string;
  getGradient: (name: string) => string;
}
