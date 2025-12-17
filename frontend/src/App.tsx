import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import InventoryPage from './pages/InventoryPage'
import AdminPage from './pages/AdminPage'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div>
          <nav className="nav">
            <div className="nav-brand">
              <img src="/logo.png" alt="Connective Capital" className="nav-logo" />
            </div>
            <div className="nav-links">
              <Link to="/">Inventory</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </nav>
          <div className="container">
            <Routes>
              <Route path="/" element={<InventoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
