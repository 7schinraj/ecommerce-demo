import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../services/authApi';
import { Input, Button, Alert } from '../../../components/ui';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = '';
    
    if (name === 'username') errorMsg = validateUsername(value);
    if (name === 'email') errorMsg = validateEmail(value);
    if (name === 'password') errorMsg = validatePassword(value);
    
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Trigger complete client-side validation
    const usernameErr = validateUsername(formData.username);
    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);

    if (usernameErr || emailErr || passwordErr) {
      setErrors({
        username: usernameErr,
        email: emailErr,
        password: passwordErr,
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Backend returns tokens & user details upon successful signup
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate('/', { replace: true });
    } catch (err) {
      // Format validation exceptions from backend (e.g. "Account already exists")
      const errorMsg =
        err.response?.data?.detail || 
        err.response?.data?.message || 
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        (Array.isArray(err.response?.data) ? err.response.data[0] : null) ||
        err.message || 
        'Failed to register account. Please try again.';
      
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header animate-fade-in">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to access and manage computing hardware</p>
      </div>

      {serverError && (
        <Alert
          message={serverError}
          type="error"
          onClose={() => setServerError('')}
          className="auth-alert"
        />
      )}

      <form onSubmit={handleSubmit} className="animate-fade-in" noValidate>
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="e.g. john_doe"
          error={errors.username}
          icon={UserIcon}
          disabled={isLoading}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="e.g. customer@example.com"
          error={errors.email}
          icon={Mail}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="•••••••• (Min 6 chars)"
          error={errors.password}
          icon={Lock}
          disabled={isLoading}
        />



        <Button
          type="submit"
          variant="primary"
          className="btn-full auth-submit-btn"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="auth-footer animate-fade-in">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupForm;
export { SignupForm };
