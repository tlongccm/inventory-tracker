import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import InventoryPage from './pages/InventoryPage'
import SoftwarePage from './pages/SoftwarePage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import AdminPage from './pages/AdminPage'
import ErrorBoundary from './components/ErrorBoundary'
import { CategoryProvider } from './contexts/CategoryContext'

function App() {
  return (
    <ErrorBoundary>
      <CategoryProvider>
        <BrowserRouter>
          <div>
            <nav className="nav">
              <div className="nav-brand">
                <img src="/logo.png" alt="Connective Capital" className="nav-logo" />
              </div>
              <div className="nav-links">
                <Link to="/">Equipment</Link>
                <Link to="/software">Software</Link>
                <Link to="/subscriptions">Subscriptions</Link>
                <Link to="/admin">Admin</Link>
              </div>
            </nav>
            <div className="container">
              <Routes>
                <Route path="/" element={<InventoryPage />} />
                <Route path="/software" element={<SoftwarePage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </CategoryProvider>
    </ErrorBoundary>
  )
}

export default App
