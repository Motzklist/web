/**
 * @fileoverview LoginForm component tests
 * Tests all login functionality including validation, submission, error handling
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
    }),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        isAuthenticated: false,
    }),
}));

import LoginForm from '@/components/LoginForm';

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render login form with all elements', () => {
            render(<LoginForm />);

            expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        it('should have empty input fields initially', () => {
            render(<LoginForm />);

            expect(screen.getByLabelText(/username/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
        });

        it('should have password field with type password', () => {
            render(<LoginForm />);

            expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
        });
    });

    describe('Form Validation', () => {
        it('should have disabled submit button when form is empty', () => {
            render(<LoginForm />);

            expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
        });

        it('should have disabled submit button when only username is filled', async () => {
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');

            expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
        });

        it('should have disabled submit button when only password is filled', async () => {
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/password/i), 'password123');

            expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
        });

        it('should enable submit button when both fields are filled', async () => {
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');

            expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
        });

        it('should keep button disabled when fields contain only whitespace', async () => {
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), '   ');
            await user.type(screen.getByLabelText(/password/i), '   ');

            expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
        });
    });

    describe('Form Submission', () => {
        it('should call login with credentials when form is submitted', async () => {
            mockLogin.mockResolvedValueOnce({});
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
            });
        });

        it('should show loading state during submission', async () => {
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
        });

        it('should disable inputs during submission', async () => {
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByLabelText(/username/i)).toBeDisabled();
            expect(screen.getByLabelText(/password/i)).toBeDisabled();
        });

        it('should redirect to home page on successful login', async () => {
            mockLogin.mockResolvedValueOnce({});
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message on login failure', async () => {
            mockLogin.mockRejectedValueOnce(new Error('Invalid password'));
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
            });
        });

        it('should display generic error message when no error message provided', async () => {
            mockLogin.mockRejectedValueOnce(new Error());
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/failed to login/i)).toBeInTheDocument();
            });
        });

        it('should not redirect on login failure', async () => {
            mockLogin.mockRejectedValueOnce(new Error('Login failed'));
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/login failed/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('should clear error when form is resubmitted', async () => {
            mockLogin.mockRejectedValueOnce(new Error('First error'));
            render(<LoginForm />);
            const user = userEvent.setup();

            await user.type(screen.getByLabelText(/username/i), 'testuser');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/first error/i)).toBeInTheDocument();
            });

            // Submit again - error should be cleared while loading
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.queryByText(/first error/i)).not.toBeInTheDocument();
        });
    });
});

