import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function LandingPage() {
  const [isOpening, setIsOpening] = useState(false)
  const navigate = useNavigate()

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => {
      navigate('/courses')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-cocis-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #e94560 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #0f3460 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center z-10"
          >
            {/* Title */}
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
            >
              WELCOME TO
            </motion.h1>
            
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold text-cocis-gold mb-12 tracking-wide"
            >
              COCIS EXAMINATION HUB
            </motion.h2>

            {/* Animated arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-white text-4xl"
              >
                ↓
              </motion.div>
            </motion.div>

            {/* Open button */}
            <motion.button
              onClick={handleOpen}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-cocis-gold text-white text-2xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              OPEN
            </motion.button>
          </motion.div>
        )}

        {/* Door opening animation */}
        {isOpening && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-cocis-primary z-20 origin-left"
            style={{ transformOrigin: 'center' }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-gray-400 text-sm flex flex-col items-center gap-2"
      >
        <span className="inline-block px-3 py-1 bg-cocis-accent rounded-full">
          Notes Section - Coming Soon
        </span>
        {/* <button
          onClick={() => navigate('/admin')}
          className="text-white/40 hover:text-cocis-gold text-xs transition-colors"
        >
          Admin Panel
        </button> */}
      </motion.div>
    </div>
  )
}

export default LandingPage
