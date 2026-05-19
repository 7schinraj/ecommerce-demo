import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../services/authApi';
import { Input, Button, Alert } from '../../../components/ui';
import { validateEmail, validatePassword } from '../utils/validation';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    
    if (name === 'email') errorMsg = validateEmail(value);
    if (name === 'password') errorMsg = validatePassword(value);
    
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Trigger complete client-side validation
    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // SimpleJWT returns { message, tokens: { access, refresh }, user }
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate('/', { replace: true });
    } catch (err) {
      // Catch validation exceptions or server issues
      const errorMsg =
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.response?.data?.non_field_errors?.[0] ||
        err.message || 
        'Something went wrong. Please check your credentials.';
      
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header animate-fade-in">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Enter your details below to access your account</p>
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
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="yourname@example.com"
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
          placeholder="••••••••"
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
          Sign In
        </Button>
      </form>

      <div className="auth-footer animate-fade-in">
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
export { LoginForm };
