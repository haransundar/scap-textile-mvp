'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import client components with no SSR
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), { ssr: false });
const CTASection = dynamic(() => import('@/components/CTASection'), { ssr: false });

export default function HomeContent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/scap-icon.png" 
              alt="SCAP Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">SCAP</h1>
              <p className="text-xs hidden md:block">Supply Chain AI Compliance Platform</p>
            </div>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#how-it-works" className="hover:underline">How It Works</a></li>
              <li><a href="#testimonials" className="hover:underline">Testimonials</a></li>
              <li><a href="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 opacity-90"></div>
            <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
              backgroundImage: 'url("/branding/patterns/grid-pattern.svg")',
              backgroundSize: '64px 64px'
            }}></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                  AI-Native Compliance for Textile Supply Chains
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Reduce compliance costs by 87% with our AI-powered platform. Upload certificates in 30 seconds, get 3-month advance regulatory alerts, and share with unlimited brands.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors">
                    Start Free Trial
                  </a>
                  <a href="#demo" className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold rounded-lg text-lg transition-colors">
                    Watch Demo
                  </a>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Cost Reduction</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">30s</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Certificate Upload</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3mo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Advance Alerts</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">∞</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Brand Sharing</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10 max-w-md mx-auto">
                  <Image 
                    src="/linky-full.png" 
                    alt="Linky - SCAP AI Assistant" 
                    width={600} 
                    height={600}
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">Features</span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need for Compliance Management</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Powerful tools to streamline your compliance workflow and reduce manual work
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">30-Second Certificate Processing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upload compliance certificates and let our AI extract all the data automatically with 99.8% accuracy.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Predictive Risk Scoring</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get instant risk assessment across 87+ parameters with our proprietary ML model.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Compliance Assistant</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get instant answers to your compliance questions with our multilingual AI chatbot.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3-Month Advance Alerts</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Stay ahead of regulatory changes with our early warning system for compliance requirements.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Supply Chain Visibility</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Map and monitor your entire supply chain with real-time compliance tracking across all tiers.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure Document Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Share compliance documents with brands and partners securely with granular access controls.
                </p>
                <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="mt-16 text-center">
              <a href="/features" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                View All Features
                <svg className="ml-2 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">Process</span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How SCAP Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Get started in minutes with our simple 3-step process
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                <div className="lg:w-7/12">
                  <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 flex items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                        compliance-dashboard.html
                      </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
                            <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Supports 50+ certificate types</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:w-5/12 lg:pl-12">
                  <div className="lg:text-left">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold mb-4">1</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Upload Your Certificates</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Simply drag and drop your compliance certificates or click to browse. Our AI will automatically extract and validate all the data.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">OCR + AI</span> powered data extraction
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">99.8%</span> accuracy rate
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">30-second</span> processing time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12 mb-20">
                <div className="lg:w-7/12">
                  <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compliance Dashboard</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Overall Score: 87/100
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Risk Score */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Risk Level</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Low Risk</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                      </div>
                      
                      {/* Categories */}
                      <div className="space-y-3">
                        {[
                          { name: 'Environmental', score: 92, color: 'green' },
                          { name: 'Social', score: 85, color: 'blue' },
                          { name: 'Governance', score: 76, color: 'yellow' },
                          { name: 'Safety', score: 88, color: 'indigo' },
                          { name: 'Quality', score: 94, color: 'purple' }
                        ].map((category) => (
                          <div key={category.name} className="flex items-center">
                            <span className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                            <div className="flex-1 mx-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full bg-${category.color}-500`} 
                                  style={{width: `${category.score}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="w-10 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{category.score}%</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Action Items */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <svg className="h-2.5 w-2.5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                              </div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              Update <span className="font-medium">Supplier Code of Conduct</span> to include new human rights provisions
                            </span>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <svg className="h-2.5 w-2.5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                              </div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              Conduct <span className="font-medium">water usage audit</span> at manufacturing facility
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-5/12 lg:pr-12">
                  <div className="lg:text-left">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold mb-4">2</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Get Instant Risk Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Our AI analyzes your compliance status across 87 parameters, providing a detailed risk assessment with actionable insights and recommendations.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900">
                            <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">87/100</span> Overall Compliance Score
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <svg className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">3</span> Action Items Identified
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">3-Month</span> Advance Regulatory Alerts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-7/12">
                  <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Share Compliance Profile</h3>
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input type="email" name="email" id="email" className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" placeholder="name@company.com" />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="permission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permission Level</label>
                        <select id="permission" name="permission" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                          <option>View Only</option>
                          <option>Comment</option>
                          <option>Edit (Limited)</option>
                          <option>Full Access</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (Optional)</label>
                        <textarea id="message" name="message" rows={3} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md p-2" placeholder="Add a personal message..."></textarea>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center">
                          <input id="notify-me" name="notify-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded" defaultChecked />
                          <label htmlFor="notify-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Notify me when they view it
                          </label>
                        </div>
                        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Send Invite
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-5/12 lg:pl-12">
                  <div className="lg:text-left">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold mb-4">3</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Share with Brands & Partners</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Easily share your compliance status with brands and partners through secure, permission-based access. No more sending documents back and forth.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">One-click</span> sharing with multiple stakeholders
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">Customizable</span> permission levels
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">Real-time</span> updates for all shared parties
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* CTA Section */}
        <CTASection />

        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-gray-900 text-white pt-16 pb-8" aria-labelledby="footer-heading">
          <h2 id="footer-heading" className="sr-only">Footer</h2>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
                  <Image 
                    src="/branding/logos/scap-logo-horizontal-white.png"
                    alt="SCAP Logo"
                    width={180}
                    height={45}
                    className="h-9 w-auto"
                  />
                </div>
                <p className="text-gray-400 mb-6">
                  AI-powered compliance platform transforming supply chain management for the textile industry. 
                  Making compliance simple, smart, and sustainable.
                </p>
                <div className="flex space-x-4">
                  {[
                    { name: 'LinkedIn', icon: 'M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-4.5 6.5h-1.5V9c0-.8-.7-1.5-1.5-1.5S11 8.2 11 9v1.5H9.5V15h1.5v-3.7c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V15h1.5V9.5z' },
                    { name: 'Twitter', icon: 'M22 5.89c-.8.36-1.65.6-2.54.71.92-.55 1.62-1.42 1.95-2.45-.86.51-1.81.87-2.82 1.07-.81-.86-1.96-1.4-3.24-1.4-2.45 0-4.44 1.99-4.44 4.44 0 .35.04.69.12 1.01-3.69-.19-6.96-1.95-9.15-4.63-.38.65-.6 1.41-.6 2.22 0 1.54.78 2.9 1.97 3.69-.72-.02-1.4-.22-2-.54v.05c0 2.15 1.53 3.95 3.57 4.36-.37.1-.77.16-1.17.16-.29 0-.57-.03-.85-.08.57 1.79 2.23 3.09 4.2 3.12-1.54 1.21-3.48 1.93-5.58 1.93-.36 0-.72-.02-1.07-.06 1.98 1.27 4.33 2.01 6.86 2.01 8.24 0 12.74-6.82 12.74-12.74 0-.19 0-.38-.01-.57.88-.63 1.64-1.43 2.24-2.33z' },
                    { name: 'Facebook', icon: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 16.99 22 12z' },
                    { name: 'YouTube', icon: 'M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z' }
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={social.name}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.icon} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Quick Links</h4>
                <ul className="space-y-3">
                  <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
                  <li><a href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                  <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
                  <li><a href="/blog" className="text-gray-400 hover:text-white transition">Blog</a></li>
                  <li><a href="/careers" className="text-gray-400 hover:text-white transition">Careers</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Resources</h4>
                <ul className="space-y-3">
                  <li><a href="/help" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                  <li><a href="/docs" className="text-gray-400 hover:text-white transition">Documentation</a></li>
                  <li><a href="/api" className="text-gray-400 hover:text-white transition">API Reference</a></li>
                  <li><a href="/webinars" className="text-gray-400 hover:text-white transition">Webinars</a></li>
                  <li><a href="/status" className="text-gray-400 hover:text-white transition">Status</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Contact Us</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Email us at</p>
                      <a href="mailto:hello@scap.ai" className="text-white hover:text-blue-400 transition">hello@scap.ai</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Call us at</p>
                      <a href="tel:+911234567890" className="text-white hover:text-blue-400 transition">+91 123 456 7890</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Visit us at</p>
                      <p className="text-white">123 Tech Park,<br />Chennai,<br />Tamil Nadu 600001</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                  <p className="text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} SCAP. All rights reserved.
                  </p>
                  <div className="hidden md:block w-px h-4 bg-gray-700"></div>
                  <div className="flex space-x-6">
                    <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
                    <a href="/terms" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
                    <a href="/security" className="text-gray-400 hover:text-white text-sm transition">Security</a>
                    <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition">Cookies</a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-gray-400">System Status: <span className="text-green-400">All Systems Operational</span></span>
                  </div>
                  
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-white text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6 6 0 011.912-4.26 1 1 0 01.847-.18l2.2.55a1 1 0 01.72.72l.55 2.2a1 1 0 01-.18.847 6 6 0 01-5.049 2.024z" clipRule="evenodd" />
                      </svg>
                      English
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">English</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">தமிழ் (Tamil)</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">हिंदी (Hindi)</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center md:text-left">
                <p className="text-xs text-gray-500">
                  SCAP is a product of Supply Chain AI Compliance Platform Pvt. Ltd. Registered in India. 
                  <br className="hidden md:inline" />
                  All product names, logos, and brands are property of their respective owners.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
