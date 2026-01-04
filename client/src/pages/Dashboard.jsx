import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';

const API_URL = '/api/tickets';

function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

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
            toast.error("Error al cargar tickets");
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
                toast.success("Ticket creado exitosamente");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Error al crear ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const openTicket = (ticket) => {
        setSelectedTicket(ticket);
        setCommentText('');
    };

    const closeTicket = () => {
        setSelectedTicket(null);
    };

    const handleStatusChange = async (newStatus) => {
        await updateTicketStatus(selectedTicket._id, newStatus);
    };

    const updateTicketStatus = async (ticketId, status) => {
        try {
            const res = await fetch(`${API_URL}/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updatedTicket = await res.json();
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(updatedTicket);
                }
                fetchTickets();
                toast.success(`Estado actualizado a ${status}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar estado");
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
                toast.success("Ticket eliminado");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            toast.error("Error al eliminar ticket");
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
                toast.success("Comentario agregado");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Error al comentar");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Abierto': return 'bg-yellow-100 text-yellow-800';
            case 'En Progreso': return 'bg-blue-100 text-blue-800';
            case 'Resuelto': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-10 relative bg-gray-50/50">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-rose-50/50 pointer-events-none -z-10" />

            <div className={`max-w-6xl mx-auto transition-all ${selectedTicket ? 'blur-sm' : ''}`}>
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            ServiDesk
                        </motion.h1>
                        <p className="text-gray-500 font-medium ml-1">Hola, {user.name}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <div className="bg-white p-1 rounded-lg border shadow-sm flex">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Lista
                                </button>
                                <button
                                    onClick={() => setViewMode('board')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Tablero
                                </button>
                            </div>
                        )}
                        <button onClick={handleLogout} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition shadow-sm font-medium">
                            Salir
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Formulario (Sticky en Desktop) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 lg:sticky lg:top-8"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Nuevo Ticket</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="subject"
                                placeholder="Asunto del problema"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                            <textarea
                                name="description"
                                placeholder="Describe los detalles..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                            ></textarea>
                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-bold disabled:opacity-70 disabled:hover:scale-100">
                                {loading ? 'Enviando...' : 'Crear Ticket'}
                            </button>
                        </form>
                    </motion.div>

                    {/* Lista / Tablero */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isAdmin ? 'Gestión de Soporte' : 'Mis Tickets'}
                            </h2>
                            <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                {tickets.length} Total
                            </span>
                        </div>

                        {viewMode === 'board' && isAdmin ? (
                            <KanbanBoard
                                tickets={tickets}
                                onStatusChange={updateTicketStatus}
                                onTicketClick={openTicket}
                            />
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {tickets.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8 bg-white/50 rounded-2xl border border-dashed">No hay tickets activos.</p>
                                    ) : (
                                        tickets.map((ticket, index) => (
                                            <motion.div
                                                key={ticket._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => openTicket(ticket)}
                                                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            <span className="font-medium text-gray-700">{ticket.user}</span> • {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DETALLE */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={closeTicket}
                        />
                        <motion.div
                            layoutId={selectedTicket._id}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
                        >

                            {/* Header Modal */}
                            <div className="p-6 border-b flex justify-between items-start bg-gray-50/80">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                                    <p className="text-sm text-gray-500 mt-1">ID: {selectedTicket._id}</p>
                                </div>
                                <button onClick={closeTicket} className="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition">&times;</button>
                            </div>

                            {/* Body Modal */}
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex gap-2 mb-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-600">
                                        {selectedTicket.user}
                                    </span>
                                </div>

                                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                                    {selectedTicket.description}
                                </p>

                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        Actividad y Comentarios
                                    </h3>

                                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                        {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                                            selectedTicket.comments.map((comment, index) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={index}
                                                    className={`flex flex-col ${comment.esAdmin ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${comment.esAdmin
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                                        }`}>
                                                        <p>{comment.texto}</p>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1 mx-1">
                                                        {comment.usuario} • {new Date(comment.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-2">💭</div>
                                                <p className="text-gray-400 text-sm">No hay comentarios aún. Sé el primero.</p>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleCommentSubmit} className="relative">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Escribe una respuesta..."
                                            className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        />
                                        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition aspect-square flex items-center justify-center">
                                            ➤
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Footer (Admin) */}
                            {isAdmin && (
                                <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
                                    <div className="flex bg-white rounded-lg border shadow-sm p-1 mr-auto">
                                        {['Abierto', 'En Progreso', 'Resuelto'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${selectedTicket.status === status ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-bold transition"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Dashboard
