import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import { motion } from 'framer-motion';

const columns = {
    'Abierto': { title: 'Abierto', color: 'border-t-4 border-yellow-400' },
    'En Progreso': { title: 'En Progreso', color: 'border-t-4 border-blue-400' },
    'Resuelto': { title: 'Resuelto', color: 'border-t-4 border-green-400' }
};

const KanbanBoard = ({ tickets, onStatusChange, onTicketClick }) => {

    const getTicketsByStatus = (status) => {
        return tickets.filter(t => t.status === status);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        onStatusChange(draggableId, newStatus);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                {Object.entries(columns).map(([status, col]) => (
                    <Droppable key={status} droppableId={status}>
                        {(provided, snapshot) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`
                    bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 min-h-[500px] 
                    border border-gray-200/60 shadow-inner flex flex-col 
                    transition-all duration-200 ease-in-out
                    ${col.color} 
                    ${snapshot.isDraggingOver ? 'bg-blue-50/80 ring-2 ring-blue-200 shadow-lg scale-[1.01]' : ''}
                `}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-700">{col.title}</h3>
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {getTicketsByStatus(status).length}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {getTicketsByStatus(status).map((ticket, index) => (
                                        <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        opacity: snapshot.isDragging ? 0.9 : 1,
                                                    }}
                                                >
                                                    <TicketCard
                                                        ticket={ticket}
                                                        onClick={() => onTicketClick(ticket)}
                                                        isDragging={snapshot.isDragging}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {/* Visual cue for empty column */}
                                    {getTicketsByStatus(status).length === 0 && !snapshot.isDraggingOver && (
                                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 opacity-50">
                                            <span className="text-sm text-gray-400">Arrastra aquí</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;
