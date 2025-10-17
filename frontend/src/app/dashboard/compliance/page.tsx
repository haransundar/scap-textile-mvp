"use client";

import { useState } from "react";

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("regulations");
  
  // Mock data for regulations
  const regulations = [
    { id: "1", name: "EU CSRD", description: "Corporate Sustainability Reporting Directive", status: "Compliant", dueDate: "2024-06-30" },
    { id: "2", name: "GDPR", description: "General Data Protection Regulation", status: "Compliant", dueDate: "2024-05-15" },
    { id: "3", name: "ISO 14001", description: "Environmental Management System", status: "Pending", dueDate: "2024-07-22" },
    { id: "4", name: "ISO 27001", description: "Information Security Management", status: "At Risk", dueDate: "2024-04-10" },
    { id: "5", name: "DORA", description: "Digital Operational Resilience Act", status: "Not Started", dueDate: "2024-09-15" },
  ];
  
  // Mock data for audits
  const audits = [
    { id: "1", name: "Annual Security Audit", date: "2024-02-15", status: "Completed", findings: 3 },
    { id: "2", name: "Environmental Compliance Review", date: "2024-03-10", status: "Scheduled", findings: null },
    { id: "3", name: "Supplier Code of Conduct Audit", date: "2023-11-22", status: "Completed", findings: 0 },
    { id: "4", name: "Data Protection Assessment", date: "2024-01-05", status: "In Progress", findings: null },
  ];
  
  // Mock data for tasks
  const tasks = [
    { id: "1", title: "Update ISO 27001 documentation", dueDate: "2024-03-25", priority: "High", assignee: "John Smith" },
    { id: "2", title: "Complete DORA self-assessment", dueDate: "2024-04-15", priority: "Medium", assignee: "Sarah Johnson" },
    { id: "3", title: "Review supplier certificates", dueDate: "2024-03-30", priority: "Medium", assignee: "Michael Brown" },
    { id: "4", title: "Prepare for environmental audit", dueDate: "2024-04-05", priority: "High", assignee: "Emily Davis" },
  ];
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "scheduled":
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "at risk":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "not started":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compliance Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track and manage regulatory compliance across your organization
        </p>
      </div>
      
      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">2/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">At Risk</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">1/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">1/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Not Started</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">1/5</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("regulations")}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === "regulations"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Regulations
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("audits")}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === "audits"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Audits
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`inline-block py-4 px-4 text-sm font-medium ${
                activeTab === "tasks"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Tasks
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Regulations Tab */}
        {activeTab === 'regulations' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {regulations.map((regulation) => (
                <li key={regulation.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{regulation.name}</p>
                        <p className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(regulation.status)}`}>
                          {regulation.status}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          Due: {regulation.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {regulation.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Audits Tab */}
        {activeTab === 'audits' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {audits.map((audit) => (
                <li key={audit.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{audit.name}</p>
                        <p className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                          {audit.status}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {audit.date}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          Findings: {audit.findings !== null ? audit.findings : "-"}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{task.title}</p>
                        <p className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          Assignee: {task.assignee}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <p className="mr-4">
                          Due: {task.dueDate}
                        </p>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400 mr-3">
                          Edit
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400">
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}