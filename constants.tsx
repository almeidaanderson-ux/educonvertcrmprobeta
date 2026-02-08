
import { UserRole, CourseModality, LeadStatus, User, Course, Lead, FinancialRecord, CourseFormation, CourseDuration } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Arthur Admin', email: 'admin@edu.com', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur' },
  { id: '2', name: 'Carlos Consultor', email: 'vendas@edu.com', role: UserRole.CONSULTANT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
  { id: '3', name: 'Fabio Financeiro', email: 'financeiro@edu.com', role: UserRole.FINANCE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio' },
];

export const MOCK_COURSES: Course[] = [
  { id: 'c1', name: 'Análise e Desenv. de Sistemas', formation: CourseFormation.TECHNOLOGIST, modality: CourseModality.EAD, price: 350.00, enrollmentFee: 150.00, scholarship: 0, duration: CourseDuration.YEARS_2_5, active: true },
  { id: 'c2', name: 'Psicologia Cognitiva', formation: CourseFormation.SPECIALIZATION, modality: CourseModality.POST_DIGITAL, price: 420.00, enrollmentFee: 200.00, scholarship: 20, duration: CourseDuration.MONTHS_18, active: true },
  { id: 'c3', name: 'Administração de Empresas', formation: CourseFormation.BACHELOR, modality: CourseModality.PRESENCIAL, price: 980.00, enrollmentFee: 299.00, scholarship: 10, duration: CourseDuration.YEARS_4, active: true },
];

export const MOCK_LEADS: Lead[] = [
  { 
    id: 'l1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-7777', 
    // Fix: Changed 'courseId' to 'courseIds' (array) to match Lead interface definition
    courseIds: ['c1'], modality: CourseModality.EAD, status: LeadStatus.NEW, 
    createdAt: '2024-03-01', assignedTo: '2', notes: ['Interesse via Landing Page'], totalValue: 8400 
  },
  { 
    id: 'l2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(21) 97777-6666', 
    // Fix: Changed 'courseId' to 'courseIds' (array) to match Lead interface definition
    courseIds: ['c3'], modality: CourseModality.PRESENCIAL, status: LeadStatus.NEGOTIATING, 
    createdAt: '2024-02-20', assignedTo: '2', notes: ['Solicitou desconto de 20%'], totalValue: 47040 
  },
];

export const MOCK_FINANCE: FinancialRecord[] = [
  { id: 'f1', studentName: 'Alice Medeiros', courseName: 'Administração', amount: 980.00, dueDate: '2024-03-10', status: 'PAID', installment: '12/48' },
  { id: 'f2', studentName: 'Bruno Alencar', courseName: 'ADS EAD', amount: 350.00, dueDate: '2024-02-10', status: 'OVERDUE', installment: '05/30' },
];
