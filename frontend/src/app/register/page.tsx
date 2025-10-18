'use client';

import { useState, useEffect } from 'react';
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
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Company/Brand name is required'),
  userType: z.enum(['supplier', 'brand']),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters', validate: (p: string) => p.length >= 8 },
  { id: 'uppercase', text: 'At least one uppercase letter', validate: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', text: 'At least one lowercase letter', validate: (p: string) => /[a-z]/.test(p) },
  { id: 'number', text: 'At least one number', validate: (p: string) => /[0-9]/.test(p) },
  { id: 'special', text: 'At least one special character', validate: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error: authError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      companyName: '',
      userType: 'supplier',
      terms: false,
    },
  });

  const userType = watch('userType');
  const watchPassword = watch('password');

  useEffect(() => {
    setPassword(watchPassword || '');
  }, [watchPassword]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(
        data.email,
        data.password,
        data.fullName,
        data.companyName,
        data.userType
      );
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[a-z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return (strength / 5) * 100;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = 
    passwordStrength < 20 ? 'bg-red-500' :
    passwordStrength < 40 ? 'bg-orange-500' :
    passwordStrength < 60 ? 'bg-yellow-500' :
    passwordStrength < 80 ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create your SCAP account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join the AI-powered compliance platform for the textile industry
            </p>
          </div>

          {/* Error Message */}
          {(errors.root || authError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {errors.root?.message || authError}
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="radio"
                      id="supplier"
                      value="supplier"
                      className="peer hidden"
                      {...register('userType')}
                    />
                    <label
                      htmlFor="supplier"
                      className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-colors ${
                        userType === 'supplier'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">I'm a Supplier</span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Textile manufacturers & suppliers</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="brand"
                      value="brand"
                      className="peer hidden"
                      {...register('userType')}
                    />
                    <label
                      htmlFor="brand"
                      className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-colors ${
                        userType === 'brand'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">I'm a Brand</span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Fashion brands & retailers</span>
                    </label>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      className={`w-full ${errors.fullName ? 'border-red-500' : ''}`}
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Company/Brand Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {userType === 'supplier' ? 'Company name' : 'Brand name'}
                  </label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      type="text"
                      placeholder={userType === 'supplier' ? 'Your company name' : 'Your brand name'}
                      className={`w-full ${errors.companyName ? 'border-red-500' : ''}`}
                      {...register('companyName')}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
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

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showPassword ? 'Hide password' : 'Show password'}
                    </button>
                  </div>
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
                  
                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrengthColor} transition-all duration-300`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1">
                        {passwordRequirements.map((req) => {
                          const isValid = req.validate(password);
                          return (
                            <div key={req.id} className="flex items-center">
                              {isValid ? (
                                <Check className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span className={`text-xs ${isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {req.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="pt-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:ring-offset-gray-800"
                        {...register('terms')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                        I agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          Privacy Policy
                        </a>
                      </label>
                      {errors.terms && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Mascot */}
      <div className="hidden lg:block fixed bottom-8 right-8">
        <div className="relative">
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-50"></div>
          <div className="relative z-10">
            <Image
              src="/branding/mascot/linky-avatar.png"
              alt="Linky the SCAP assistant"
              width={120}
              height={120}
              className="animate-float"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 w-48 text-sm text-center">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800"></div>
              <p className="text-gray-800 dark:text-gray-200">Need help? I'm here for you!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}