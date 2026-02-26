import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-primary transition-colors z-50 flex items-center font-medium">
          ← Back to Home
      </Link>
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 transition-all hover:scale-105 duration-300">
        <Link to="/" className="block text-center mb-8">
             <h1 className="text-4xl font-black text-primary tracking-tight">
                AntiGravity
             </h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-card py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-border">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};
