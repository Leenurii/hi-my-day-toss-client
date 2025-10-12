// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom'
import Index from './pages/Index'
import Home from './pages/Home'
import Write from './pages/Write'
import EntryResult from './pages/EntryResult'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } }}
        style={{ willChange: 'transform,opacity' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/write" element={<Write />} />
          <Route path="/entries/:id" element={<EntryResult />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
