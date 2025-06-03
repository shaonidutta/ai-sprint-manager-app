import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, SprintFlowIcon, EyeIcon, EyeOffIcon } from '../../components/common';

const Login = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(result.redirectTo, { 
          state: { email: result.email },
          replace: true 
        });
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-neutral-200 p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <SprintFlowIcon size={48} />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Log in to your account
          </h1>
          <p className="text-sm text-neutral-600">
            Enter your email and password to access SprintFlow
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              fullWidth
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                inputClassName="pr-10"
                fullWidth
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-md p-3">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Logging in...' : 'Log in'}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-150"
            >
              Can't log in?
            </Link>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-150"
              >
                Sign up for SprintFlow
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-xs text-neutral-500">
            <a href="#" className="hover:text-neutral-700 transition-colors duration-150">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-700 transition-colors duration-150">Terms of Service</a>
            <a href="#" className="hover:text-neutral-700 transition-colors duration-150">Support</a>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            © 2024 SprintFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 