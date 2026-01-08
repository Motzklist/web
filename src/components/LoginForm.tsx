'use client';

import {useState, FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';

/**
 * LoginForm
 *  - Renders a username/password login form.
 *  - Uses AuthContext's `login` method to authenticate.
 *  - Shows inline validation errors and a loading state while submitting.
 *  - Redirects to the home page ("/") on successful login.
 */
export default function LoginForm() {
    // Controlled input state for username
    const [username, setUsername] = useState('');
    // Controlled input state for password
    const [password, setPassword] = useState('');
    // Error message shown when login fails (e.g., invalid credentials)
    const [error, setError] = useState('');
    // Indicates whether a login request is currently in progress
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    // `login` comes from AuthContext and performs the actual authentication
    const {login} = useAuth();

    // Simple client-side validation: require non-empty username and password
    const isFormValid = username.trim() !== '' && password.trim() !== '';

    /**
     * Form submit handler
     *  - Prevents default form submission.
     *  - Validates fields.
     *  - Calls async `login` and redirects on success.
     *  - Catches errors and displays them to the user.
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Clear any previous error message before new attempt
        setError('');

        if (isFormValid) {
            setIsLoading(true);
            try {
                // Await login so we only continue if it succeeds
                await login(username, password);
                // On success, navigate to the home page
                router.push('/');
            } catch (err: any) {
                // If the backend provides a message, use it; otherwise use a generic one
                setError(err.message || 'Failed to login');
            } finally {
                // Always turn off loading state, whether login succeeded or failed
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Login
                </h2>

                {/* Login form with controlled inputs and submit handler */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error alert, only visible when an error message exists */}
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    {/* Username field */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            // Update local state on each keystroke
                            onChange={(e) => setUsername(e.target.value)}
                            // Disable when a login request is in progress
                            disabled={isLoading}
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

                    {/* Password field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            // Update local state on each keystroke
                            onChange={(e) => setPassword(e.target.value)}
                            // Disable when a login request is in progress
                            disabled={isLoading}
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit button: disabled if form invalid or while loading */}
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="w-full px-4 py-2 mt-6 text-white font-semibold rounded shadow-sm transition-colors duration-200 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-zinc-700"
                    >
                        {/* Show loading text while login request is in progress */}
                        {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
