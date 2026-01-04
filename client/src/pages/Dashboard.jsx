import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tickets';

function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ subject: '', description: '' });
                fetchTickets();
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen p-4 md:p-10">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600">ServiDesk</h1>
                        <p className="text-gray-500">Hola, {user.name} ({user.role})</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Cerrar Sesión
                    </button>
                </header>

                {/* Formulario */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Nuevo Ticket</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                name="subject"
                                placeholder="Asunto"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <textarea
                            name="description"
                            placeholder="Describe el problema..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Ticket'}
                        </button>
                    </form>
                </div>

                {/* Lista de Tickets */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        {user.role === 'admin' ? 'Todos los Tickets' : 'Mis Tickets'}
                    </h2>
                    {tickets.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay tickets registrados.</p>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div key={ticket._id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{ticket.subject}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Por: <span className="font-medium text-gray-800">{ticket.user}</span>
                                            </p>
                                            <p className="text-gray-700">{ticket.description}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 text-right">
                                        {new Date(ticket.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
