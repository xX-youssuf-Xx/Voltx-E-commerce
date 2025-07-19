import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CashierPage from './pages/CashierPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<CashierPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 