import React from 'react';
import GanntChart from './GanttChart';
import { type GanttTask } from './Types';

const GanntRender: React.FC = () => {
  const tasks: GanttTask[] = [
    {
      id: 'task-1',
      name: 'Design UI',
      start: '2025-06-02',
      end: '2025-06-05',
      color: '#4CAF50'
    },
    {
      id: 'task-2',
      name: 'Sviluppo Frontend',
      start: '2025-06-09',
      end: '2025-06-13',
      color: '#2196F3'
    }
  ];

  return (
    <>
    <div style={{ padding: '20px' }}>
      <GanntChart
        tasks={tasks}
        startDate="2025-06-01"
        endDate="2025-06-30"
      />
    </div>
    </>


  );
};

export default GanntRender;
