import { motion } from "framer-motion";
import { FloatingDock } from "./ui/floating-dock";

interface FloatingNavProps {
  onAddExpense: () => void;
  onInsights: () => void;
  onSavings: () => void;
  onLogout: () => void;
}

export function FloatingNav({ onAddExpense, onInsights, onSavings, onLogout }: FloatingNavProps) {
  const links = [
    {
      title: "Dashboard",
      icon: (
        <svg className="h-full w-full text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "#dashboard",
      onClick: () => {
        // Already on dashboard, do nothing
      },
      color: "text-primary-400"
    },
    {
      title: "Add Expense",
      icon: (
        <svg className="h-full w-full text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: "#add",
      onClick: onAddExpense,
      color: "text-green-400"
    },
    {
      title: "Insights",
      icon: (
        <svg className="h-full w-full text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: "#insights",
      onClick: onInsights,
      color: "text-yellow-400"
    },
    {
      title: "Savings",
      icon: (
        <svg className="h-full w-full text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "#savings",
      onClick: onSavings,
      color: "text-blue-400"
    },
    {
      title: "Logout",
      icon: (
        <svg className="h-full w-full text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      href: "#logout",
      onClick: onLogout,
      color: "text-red-400"
    },
  ];

  return (
    <>
      {/* Desktop: Bottom Center */}
      <div className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <FloatingDock
          items={links}
          desktopClassName="shadow-2xl"
          mobileClassName="hidden"
        />
      </div>

      {/* Mobile: Standard Bottom Nav */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe"
      >
        <div className="flex justify-around items-center px-2 py-3">
          {links.map((link) => (
            <motion.button
              key={link.title}
              onClick={link.onClick}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex flex-col items-center justify-center min-w-[64px] group relative"
            >
              <div 
                className={`w-6 h-6 mb-1 transition-colors duration-300 ${link.color || 'text-gray-400'}`}
              >
                {link.icon}
              </div>
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors">
                {link.title}
              </span>
              
              {/* Subtle glow effect on hover/active attempt */}
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
