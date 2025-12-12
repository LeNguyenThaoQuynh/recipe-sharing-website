import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

// Wrapper component để tránh lỗi StrictMode với react-beautiful-dnd
const DragDropWrapper = ({ children, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
};

export default DragDropWrapper;