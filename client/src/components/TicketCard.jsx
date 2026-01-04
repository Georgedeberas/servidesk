import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const TicketCard = ({ ticket, onClick, isDragging }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Abierto': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'En Progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resuelto': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <motion.div
            layoutId={ticket._id}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            className={twMerge(
                "bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-colors relative overflow-hidden group",
                isDragging ? "shadow-2xl rotate-2 ring-2 ring-blue-400 z-50" : "hover:border-blue-200"
            )}
        >
            {/* Decorative gradient blob */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

            <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-gray-800 leading-tight line-clamp-2">{ticket.subject}</h3>
                <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    getStatusColor(ticket.status)
                )}>
                    {ticket.status}
                </span>
            </div>

            <p className="text-gray-500 text-xs mb-3 line-clamp-2 relative z-10 font-medium">
                Por: <span className="text-gray-700">{ticket.user}</span>
            </p>

            <p className="text-gray-600 text-sm line-clamp-3 mb-3 relative z-10">
                {ticket.description}
            </p>

            <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-3 mt-1 relative z-10">
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                {ticket.comments?.length > 0 && (
                    <div className="flex items-center gap-1">
                        <span>💬 {ticket.comments.length}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TicketCard;
