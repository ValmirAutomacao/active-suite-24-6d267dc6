import { Payment } from '@/types';
import { mockStudents } from './mockStudents';
import { mockSports } from './mockSports';

// Generate payments for 6 months (March to August 2024)
const generatePayments = (): Payment[] => {
  const payments: Payment[] = [];
  const months = ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08'];
  
  months.forEach(month => {
    mockStudents.forEach((student, index) => {
      const dayOfMonth = (index % 28) + 1; // Vary payment due dates
      const isCurrentMonth = month === '2024-08';
      
      // Realistic status distribution
      let status: Payment['status'];
      if (month === '2024-08') {
        const rand = Math.random();
        if (rand < 0.6) status = 'paid';
        else if (rand < 0.85) status = 'pending';  
        else status = 'overdue';
      } else {
        status = Math.random() < 0.9 ? 'paid' : 'overdue'; // Clean historical data
      }
      
      // Get sport names for display
      const sportNames = student.enrolledSports.map(sportId => 
        mockSports.find(s => s.id === sportId)?.name || sportId
      ).join(' + ');
      
      payments.push({
        id: `pay-${month}-${student.id}`,
        studentId: student.id,
        studentName: student.name,
        amount: student.monthlyFee,
        dueDate: `${month}-${dayOfMonth.toString().padStart(2, '0')}`,
        paidDate: status === 'paid' ? `${month}-${(dayOfMonth + Math.floor(Math.random() * 5)).toString().padStart(2, '0')}` : undefined,
        status,
        sport: sportNames,
        month
      });
    });
  });
  
  return payments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
};

export const mockPayments = generatePayments();