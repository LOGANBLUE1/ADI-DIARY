import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabaseClient'

function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">📔</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Adi's Diary
          </h1>
          <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4F46E5',
                    brandAccent: '#7C3AED',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            theme="light"
            providers={[]}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Your personal diary, organized and secure 🔒
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login