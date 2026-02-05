import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto glass rounded-2xl p-6 md:p-10"
      >
        <div className="flex items-center mb-8">
          <Link 
            to="/signup" 
            className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white ml-4">Terms & Conditions</h1>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. The Honest Truth</h2>
            <p>
              Montraq is a personal project designed to help you track your finances with discipline. 
              We are not a bank, we don't sell your data, and we don't look at your financial details. 
              The data you enter lives in a secure database powered by Google Firebase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data Privacy</h2>
            <p>
              Your data is yours. We use authentication to ensure only you can access your dashboard. 
              However, as with any online service, please use a strong password and keep your account secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Usage</h2>
            <p>
              This app is provided "as is". While we strive for perfection, we cannot guarantee 100% uptime 
              or that bugs won't appear. We are constantly improving the experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies & Storage</h2>
            <p>
              We use local storage and cookies purely to keep you logged in and to remember your preferences (like this cool dark mode). 
              No tracking pixels, no ads.
            </p>
          </section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
