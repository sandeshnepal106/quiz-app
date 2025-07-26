import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.js';
import axios from 'axios';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, profilePic, setProfilePic, setUserId } = useContext(AppContext);

  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    axios.defaults.withCredentials = true;

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          username,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        const isEmail = usernameOrEmail.includes('@');
        const payload = isEmail
          ? { email: usernameOrEmail, password }
          : { username: usernameOrEmail, password };

        const res = await axios.post(`${backendUrl}/api/user/login`, payload);

        if (res.data.success) {
          setIsLoggedin(true);
          if(!profilePic){
            setProfilePic(res.data.profilePic);
            console.log(res.data);
          }
          setUserId(res.data.id);
          navigate('/');
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
  <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {state === 'Sign Up' ? 'Create Account' : 'Login'}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        {state === 'Sign Up' ? 'Sign up to get started' : 'Login to continue'}
      </p>
    </div>

    <form onSubmit={onSubmitHandler} className="space-y-4">
      {state === 'Sign Up' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      )}

      {state === 'Sign Up' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="johndoe"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      )}

      {state === 'Sign Up' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username or Email</label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            placeholder="username or you@example.com"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {state === 'Login' && (
        <div className="text-right text-sm">
          <button
            type="button"
            className="text-blue-500 dark:text-blue-400 hover:underline"
            onClick={() => navigate('/reset-password')}
          >
            Forgot Password?
          </button>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
      >
        {state}
      </button>
    </form>

    <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
      {state === 'Sign Up' ? (
        <>
          Already have an account?{' '}
          <span
            onClick={() => setState('Login')}
            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
          >
            Login here
          </span>
        </>
      ) : (
        <>
          Don't have an account?{' '}
          <span
            onClick={() => setState('Sign Up')}
            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </>
      )}
    </p>
  </div>
</div>

  );
}

export default Login;
