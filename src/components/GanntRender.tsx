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
    ,
    {
      id: 'task-3',
      name: 'Sviluppo Backend',
      start: '2025-07-01',
      end: '2025-06-05',
      color: '#FF9800'
    },
    {
      id: 'task-4',
      name: 'Testing',
      start: '2025-07-10',
      end: '2025-07-15',
      color: '#9C27B0'
    }
  ];

  return (
    <>
    <div style={{ padding: '20px' }}>
      <GanntChart
        tasks={tasks}
        startDate="2025-06-01"
        endDate="2025-07-31"
      />
    </div>
    </>


  );
};

export default GanntRender;
