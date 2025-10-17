"use client";

import { useState } from "react";
import Link from "next/link";

export default function RiskAnalysisPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  
  // Mock data for suppliers and risk scores
  const suppliers = [
    { id: "1", name: "Acme Manufacturing", riskScore: 78, lastUpdated: "2023-12-15" },
    { id: "2", name: "Global Textiles", riskScore: 45, lastUpdated: "2024-01-20" },
    { id: "3", name: "EcoPackaging Solutions", riskScore: 92, lastUpdated: "2024-02-05" },
    { id: "4", name: "Tech Components Inc", riskScore: 63, lastUpdated: "2024-01-10" },
  ];
  
  // Risk factors for the selected supplier
  const riskFactors = [
    { id: "1", factor: "Certificate Expiration", score: 85, impact: "High", description: "Multiple certificates expiring within 30 days" },
    { id: "2", factor: "Regulatory Compliance", score: 72, impact: "Medium", description: "Partial compliance with new EU regulations" },
    { id: "3", factor: "Documentation Completeness", score: 90, impact: "Low", description: "Most required documentation is up to date" },
    { id: "4", factor: "Audit History", score: 65, impact: "Medium", description: "Minor issues found in last audit" },
  ];
  
  // Get risk color based on score
  const getRiskColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Risk Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and analyze compliance risks across your supply chain
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Suppliers</h2>
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSupplier === supplier.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setSelectedSupplier(supplier.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${getRiskColor(supplier.riskScore)}`}>
                    {supplier.riskScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last updated: {supplier.lastUpdated}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risk Details */}
        <div className="lg:col-span-2">
          {selectedSupplier ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {suppliers.find(s => s.id === selectedSupplier)?.name} Risk Assessment
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Overall Risk Score: 
                    <span className={`ml-2 px-2 py-1 rounded-full ${
                      getRiskColor(suppliers.find(s => s.id === selectedSupplier)?.riskScore || 0)
                    }`}>
                      {suppliers.find(s => s.id === selectedSupplier)?.riskScore}%
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Export Report
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    View History
                  </button>
                </div>
              </div>
              
              {/* Risk Visualization */}
              <div className="mb-8">
                <h3 className="text-md font-medium mb-4 dark:text-white">Risk Factors</h3>
                <div className="space-y-4">
                  {riskFactors.map((factor) => (
                    <div key={factor.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium dark:text-white">{factor.factor}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Impact: {factor.impact}</span>
                          <span className="text-sm dark:text-white">{factor.score}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            factor.score < 30 ? 'bg-red-500' :
                            factor.score < 70 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  <li>Update expiring certificates within the next 14 days</li>
                  <li>Complete missing documentation for EU regulatory compliance</li>
                  <li>Schedule follow-up audit to address previous findings</li>
                  <li>Implement automated certificate expiration notifications</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Supplier</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Choose a supplier from the list to view detailed risk analysis and recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}