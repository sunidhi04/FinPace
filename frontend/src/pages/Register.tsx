import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  currency: string;
  timezone: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegisterFormData>({
    defaultValues: {
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
  
  const password = watch('password');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' },
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: RegisterFormData) => {
    dispatch(
      registerUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        currency: data.currency,
        timezone: data.timezone,
      })
    ).then((result) => {
      if (registerUser.fulfilled.match(result)) {
        navigate('/login', { state: { registered: true } });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-secondary-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-secondary-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Sign up to start managing your personal finances
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={`block w-full px-3 py-2 mt-1 border ${
                    errors.firstName ? 'border-red-300' : 'border-secondary-300'
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={`block w-full px-3 py-2 mt-1 border ${
                    errors.lastName ? 'border-red-300' : 'border-secondary-300'
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`block w-full px-3 py-2 mt-1 border ${
                  errors.email ? 'border-red-300' : 'border-secondary-300'
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full px-3 py-2 mt-1 border ${
                    errors.password ? 'border-red-300' : 'border-secondary-300'
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { 
                      value: 8, 
                      message: 'Password must be at least 8 characters' 
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Password must include uppercase, lowercase, number and special character'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-secondary-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`block w-full px-3 py-2 mt-1 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-secondary-300'
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'The passwords do not match'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-secondary-700">
                Preferred Currency
              </label>
              <select
                id="currency"
                className={`block w-full px-3 py-2 mt-1 border ${
                  errors.currency ? 'border-red-300' : 'border-secondary-300'
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                {...register('currency', { required: 'Please select a currency' })}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-secondary-700">
                Timezone
              </label>
              <select
                id="timezone"
                className={`block w-full px-3 py-2 mt-1 border ${
                  errors.timezone ? 'border-red-300' : 'border-secondary-300'
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                {...register('timezone', { required: 'Please select a timezone' })}
              >
                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                  {Intl.DateTimeFormat().resolvedOptions().timeZone} (Current)
                </option>
                {timezones
                  .filter(tz => tz !== Intl.DateTimeFormat().resolvedOptions().timeZone)
                  .map(timezone => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))
                }
              </select>
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-5 h-5 mr-2 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Create Account
            </button>
          </div>
        </form>

        <div className="text-sm text-center text-secondary-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;