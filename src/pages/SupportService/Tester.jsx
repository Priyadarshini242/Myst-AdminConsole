import React from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Sample data
const initialData = [
  { id: '1', content: 'Item 1' },
  { id: '2', content: 'Item 2' },
  { id: '3', content: 'Item 3' },
  { id: '4', content: 'Item 4' },
];

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const queryClient = new QueryClient();

const DragDropTable = () => {
  const { data, isLoading } = useQuery('items', () => Promise.resolve(initialData));

  const mutation = useMutation(updatedData => {
    // Perform mutation logic here (e.g., update the data on the server)
    console.log('Data updated:', updatedData);
  });

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      data,
      result.source.index,
      result.destination.index
    );

    mutation.mutate(items);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <table
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <thead>
              <tr>
                <th>Draggable Table</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <td>{item.content}</td>
                    </tr>
                  )}
                </Draggable>
              ))}
            </tbody>
            {provided.placeholder}
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const Tester = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <DragDropTable />
      </div>
    </QueryClientProvider>
  );
};

export default Tester;