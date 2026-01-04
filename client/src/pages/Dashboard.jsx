import { useState, useEffect } from 'react'

const API_URL = '/api/tickets';

function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [commentText, setCommentText] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${user.token}` }
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

    // --- Interaction Logics ---

    const openTicket = (ticket) => {
        setSelectedTicket(ticket);
        setCommentText(''); // Clear previous comment input
    };

    const closeTicket = () => {
        setSelectedTicket(null);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await fetch(`${API_URL}/${selectedTicket._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updatedTicket = await res.json();
                setSelectedTicket(updatedTicket); // Update modal view
                fetchTickets(); // Update list view
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Seguro que quieres eliminar este ticket?')) return;
        try {
            const res = await fetch(`${API_URL}/${selectedTicket._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                closeTicket();
                fetchTickets();
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await fetch(`${API_URL}/${selectedTicket._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ texto: commentText })
            });
            if (res.ok) {
                const updatedTicket = await res.json();
                setSelectedTicket(updatedTicket);
                setCommentText('');
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Helper for status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Abierto': return 'bg-yellow-100 text-yellow-800';
            case 'En Progreso': return 'bg-blue-100 text-blue-800';
            case 'Resuelto': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-10 relative">
            <div className={`max-w-4xl mx-auto transition-all ${selectedTicket ? 'opacity-50 pointer-events-none' : ''}`}>
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600">ServiDesk</h1>
                        <p className="text-gray-500">Hola, {user.name} ({user.role})</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                        Cerrar Sesión
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Nuevo Ticket</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="subject"
                            placeholder="Asunto"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <textarea
                            name="description"
                            placeholder="Describe el problema..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium">
                            {loading ? 'Creando...' : 'Crear Ticket'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        {user.role === 'admin' ? 'Todos los Tickets' : 'Mis Tickets'}
                    </h2>
                    {tickets.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay tickets.</p>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => openTicket(ticket)}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg">{ticket.subject}</h3>
                                        <p className="text-sm text-gray-600">Por: <span className="font-medium">{ticket.user}</span></p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETALLE */}
            {selectedTicket && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="absolute inset-0 bg-black opacity-50" onClick={closeTicket}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col">

                        {/* Header Modal */}
                        <div className="p-6 border-b flex justify-between items-start bg-gray-50 rounded-t-xl">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                                <p className="text-sm text-gray-500 mt-1">Usuario: {selectedTicket.user}</p>
                                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                            <button onClick={closeTicket} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            <p className="text-gray-700 text-lg mb-6 bg-gray-50 p-4 rounded-lg border">
                                {selectedTicket.description}
                            </p>

                            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                💬 Historial de Comentarios
                            </h3>

                            <div className="space-y-4 mb-6">
                                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                                    selectedTicket.comments.map((comment, index) => (
                                        <div key={index} className={`flex flex-col ${comment.esAdmin ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg ${comment.esAdmin
                                                    ? 'bg-blue-100 text-blue-900 rounded-br-none'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                }`}>
                                                <p className="text-xs font-bold mb-1 opacity-70">
                                                    {comment.usuario} {comment.esAdmin && '(Admin)'} • {new Date(comment.fecha).toLocaleDateString()}
                                                </p>
                                                <p>{comment.texto}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic text-center text-sm">No hay comentarios aún.</p>
                                )}
                            </div>

                            {/* Add Comment Form */}
                            <form onSubmit={handleCommentSubmit} className="mt-4">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Escribe una respuesta..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                    rows="2"
                                ></textarea>
                                <button type="submit" className="mt-2 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                                    Enviar Respuesta
                                </button>
                            </form>
                        </div>

                        {/* Footer Modal (Admin Actions) */}
                        {user.role === 'admin' && (
                            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex flex-wrap gap-2 justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange('Abierto')}
                                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-semibold"
                                    >Abierto</button>
                                    <button
                                        onClick={() => handleStatusChange('En Progreso')}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-semibold"
                                    >En Progreso</button>
                                    <button
                                        onClick={() => handleStatusChange('Resuelto')}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-semibold"
                                    >Resuelto</button>
                                </div>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-semibold"
                                >
                                    Eliminar Ticket
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
