'use client';

import React from 'react';
import Image from 'next/image';

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">Testimonials</span>
          <h2 id="testimonials-heading" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by Leading Brands & Suppliers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See how SCAP is transforming compliance management for businesses of all sizes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Testimonial 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Priya K." 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Priya K.</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Manager, Arvind Ltd</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="flex-1">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "SCAP has revolutionized our compliance process. What used to take weeks now takes hours. The AI-powered certificate processing is a game-changer for our team."
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>✓ Reduced compliance processing time by 87%</p>
                <p>✓ Eliminated 100% of manual data entry errors</p>
              </div>
            </blockquote>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Rahul M." 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Rahul M.</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sustainability Director, H&M India</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="flex-1">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "The supply chain visibility we've gained through SCAP is unparalleled. We can now track compliance across all tiers of our supply chain in real-time."
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>✓ 100% supply chain visibility achieved</p>
                <p>✓ 3-month early warning on regulatory changes</p>
              </div>
            </blockquote>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image 
                  src="https://randomuser.me/api/portraits/women/68.jpg" 
                  alt="Ananya P." 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Ananya P.</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">CEO, EcoTextile Solutions</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="flex-1">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "As a small supplier, SCAP has given us credibility with major brands. The one-click sharing feature has helped us onboard 5 new clients in just 2 months."
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>✓ 5 new enterprise clients onboarded</p>
                <p>✓ 75% faster supplier onboarding</p>
              </div>
            </blockquote>
          </div>
        </div>

        {/* Logos */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-8">TRUSTED BY LEADING BRANDS</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[
              { name: 'H&M', logo: '/branding/logos/hm-logo.svg' },
              { name: 'Zara', logo: '/branding/logos/zara-logo.svg' },
              { name: 'Arvind', logo: '/branding/logos/arvind-logo.svg' },
              { name: 'Raymond', logo: '/branding/logos/raymond-logo.svg' },
              { name: 'Aditya Birla', logo: '/branding/logos/aditya-birla-logo.svg' },
            ].map((company) => (
              <div key={company.name} className="h-8 flex items-center opacity-60 hover:opacity-100 transition-opacity">
                <Image 
                  src={company.logo} 
                  alt={company.name} 
                  width={120}
                  height={32}
                  className="h-full w-auto max-w-[120px] dark:brightness-0 dark:invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
