'use client';

import React from 'react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 text-center">
        <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Supply Chain Compliance?</h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
          Join 1,200+ suppliers and brands who trust SCAP for their compliance needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register"
            className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Start Free Trial
          </Link>
          <Link 
            href="/demo"
            className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Request Demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-blue-200">No credit card required • 14-day free trial • Cancel anytime</p>
      </div>
    </section>
  );
}
