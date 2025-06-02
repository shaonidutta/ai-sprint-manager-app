import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, SprintFlowIcon, EyeIcon, EyeOffIcon } from '../../components/common';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Navigate to verify-OTP page on successful registration
      if (result.success) {
        navigate(result.redirectTo, {
          state: { email: result.email },
          replace: true
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-neutral-200 p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <SprintFlowIcon size={48} />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Create your account
          </h1>
          <p className="text-sm text-neutral-600">
            Join SprintFlow to manage your projects efficiently
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-md p-3">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700 mb-1">
                First name
              </label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                error={validationErrors.first_name}
                fullWidth
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700 mb-1">
                Last name
              </label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                error={validationErrors.last_name}
                fullWidth
              />
            </div>
          </div>

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
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
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
                autoComplete="new-password"
                required
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
                className="pr-10"
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
            {validationErrors.password && (
              <div className="mt-1 text-xs text-error-600 bg-error-50 border border-error-200 rounded px-2 py-1">
                Please fill out this field.
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={validationErrors.confirmPassword}
                className="pr-10"
                fullWidth
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-neutral-600">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-150">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-150">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Terms Error */}
          {validationErrors.terms && (
            <div className="text-sm text-error-600">
              {validationErrors.terms}
            </div>
          )}

          {/* Create Account Button */}
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-150"
              >
                Log in to SprintFlow
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

export default Register;