'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/store/auth-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Base schema for all users
const baseSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
  role: z.enum(['supplier', 'brand']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
});

// Supplier-specific fields
const supplierSchema = baseSchema.extend({
  company_name: z.string().min(2, 'Company name required'),
  tier: z.enum(['2', '3', '4']),
  industry_type: z.enum(['dyeing', 'spinning', 'weaving', 'knitting', 'finishing', 'garment']),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  language_preference: z.enum(['en', 'hi', 'ta']),
});

// Brand-specific fields
const brandSchema = baseSchema.extend({
  company_name: z.string().min(2, 'Company name required'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  expected_supplier_count: z.string().optional(),
});

const registerSchema = supplierSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SupplierFormValues = z.infer<typeof supplierSchema>;
type BrandFormValues = z.infer<typeof brandSchema>;
type RegisterFormValues = SupplierFormValues | BrandFormValues;

// Constants
const INDIAN_STATES = ['Andhra Pradesh', 'Gujarat', 'Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh'];
const TEXTILE_CITIES = ['Tirupur', 'Ludhiana', 'Surat', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Coimbatore', 'Ahmedabad'];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'supplier' | 'brand'>('supplier');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      full_name: '',
      email: '',
      company_name: '',
      password: '',
      confirmPassword: '',
      role: 'supplier',
      acceptTerms: false,
      tier: undefined,
      industry_type: undefined,
      city: '',
      state: '',
      language_preference: 'en',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError('');
      
      const { confirmPassword, acceptTerms, ...registrationData } = data as any;
      
      await registerUser(registrationData);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message from different possible error formats
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'An unexpected error occurred. Please try again.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with theme toggle and language switcher */}
      <header className="absolute top-0 right-0 p-4 flex space-x-4 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Welcome Message */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image 
                src="/branding/logos/scap-logo-horizontal.png"
                alt="SCAP Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join SCAP Today
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Simplify compliance management for your textile business
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('supplier'); setValue('role', 'supplier'); }}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedRole === 'supplier'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold">Supplier</div>
                    <div className="text-xs text-gray-500 mt-1">Textile manufacturer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('brand'); setValue('role', 'brand'); }}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedRole === 'brand'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold">Brand</div>
                    <div className="text-xs text-gray-500 mt-1">Fashion/Retail company</div>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className={`w-full ${errors.full_name ? 'border-red-500' : ''}`}
                    {...register('full_name')}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Input
                    id="company_name"
                    type="text"
                    placeholder="Your Company Pvt Ltd"
                    className={`w-full ${errors.company_name ? 'border-red-500' : ''}`}
                    {...register('company_name')}
                  />
                </div>
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.company_name.message}
                  </p>
                )}
              </div>

              {/* Supplier-Specific Fields */}
              {selectedRole === 'supplier' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tier Level *
                      </label>
                      <select
                        id="tier"
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 ${
                          errors.tier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        {...register('tier')}
                      >
                        <option value="">Select tier</option>
                        <option value="2">Tier 2 - Direct Supplier</option>
                        <option value="3">Tier 3 - Sub-contractor</option>
                        <option value="4">Tier 4 - Raw Material</option>
                      </select>
                      {errors.tier && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.tier.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="industry_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Industry Type *
                      </label>
                      <select
                        id="industry_type"
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 ${
                          errors.industry_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        {...register('industry_type')}
                      >
                        <option value="">Select industry</option>
                        <option value="dyeing">Dyeing</option>
                        <option value="spinning">Spinning</option>
                        <option value="weaving">Weaving</option>
                        <option value="knitting">Knitting</option>
                        <option value="finishing">Finishing</option>
                        <option value="garment">Garment Manufacturing</option>
                      </select>
                      {errors.industry_type && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.industry_type.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City *
                      </label>
                      <select
                        id="city"
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 ${
                          errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        {...register('city')}
                      >
                        <option value="">Select city</option>
                        {TEXTILE_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State *
                      </label>
                      <select
                        id="state"
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 ${
                          errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        {...register('state')}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="language_preference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferred Language *
                    </label>
                    <select
                      id="language_preference"
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 ${
                        errors.language_preference ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      {...register('language_preference')}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                    </select>
                    {errors.language_preference && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.language_preference.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Brand-Specific Fields */}
              {selectedRole === 'brand' && (
                <>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website URL (Optional)
                    </label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourcompany.com"
                      className={`w-full ${errors.website ? 'border-red-500' : ''}`}
                      {...register('website')}
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.website.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="expected_supplier_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expected Number of Suppliers (Optional)
                    </label>
                    <select
                      id="expected_supplier_count"
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      {...register('expected_supplier_count')}
                    >
                      <option value="">Select range</option>
                      <option value="1-10">1-10 suppliers</option>
                      <option value="11-50">11-50 suppliers</option>
                      <option value="51-100">51-100 suppliers</option>
                      <option value="100+">100+ suppliers</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    {...register('acceptTerms')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
