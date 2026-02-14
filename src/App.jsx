import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Users from './pages/Users'
import Rooms from './pages/Rooms'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                { /* Navigation*/ }
                <nav className="bg-purple-600 text-white p-4">
                    <div className="container mx-auto flex gap-6">
                        <Link to="/" className="hover:underline font-bold text-xl">
                        Saltmine Analytics
                        </Link>
                        <Link to="/messages" className="hover:underline">Messages</Link>
                        <Link to="/users" className="hover:underline">Users</Link>
                        <Link to="/rooms" className="hover:underline">Rooms</Link>
                    </div>
                </nav>

                { /*Main Content*/ }
                <div className="container mx-auto py-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/rooms" element={<Rooms />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App