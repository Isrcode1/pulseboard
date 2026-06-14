import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './pages/Home'
import PublicProfile from './pages/PublicProfile'
import Dashboard from './pages/Dashboard'
import Callback from './pages/Callback'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/auth/github/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/p/:username" element={<PublicProfile />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
