
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CONSULTANT = 'CONSULTANT',
  FINANCE = 'FINANCE'
}

export enum CourseModality {
  EAD = 'EAD',
  POST_DIGITAL = 'Pós Digital',
  PRESENCIAL = 'Presencial',
  SEMI_PRESENCIAL = 'Semi-Presencial'
}

export enum CourseFormation {
  BACHELOR = 'Bacharelado',
  LICENTIATE = 'Licenciatura',
  TECHNOLOGIST = 'Tecnólogo',
  SPECIALIZATION = 'Especialização',
  MBA = 'MBA',
  MASTER = 'Mestrado',
  DOCTORATE = 'Doutorado',
  TECHNICAL = 'Técnico',
  EXTENSION = 'Extensão'
}

export enum CourseDuration {
  MONTHS_6 = '6 Meses',
  YEAR_1 = '1 Ano',
  MONTHS_18 = '18 Meses',
  YEARS_2 = '2 Anos',
  YEARS_2_5 = '2.5 Anos',
  YEARS_3 = '3 Anos',
  YEARS_4 = '4 Anos',
  YEARS_5 = '5 Anos'
}

export enum LeadStatus {
  NEW = 'Novo Lead',
  CONTACTED = 'Contato Realizado',
  NEGOTIATING = 'Em Negociação',
  PROPOSAL_SENT = 'Proposta Enviada',
  PENDING_DOCS = 'Documentação Pendente',
  ENROLLED = 'Matrícula Confirmada',
  LOST = 'Perda / Desistência'
}

export enum LeadSource {
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  GOOGLE = 'Google Ads',
  TIKTOK = 'TikTok',
  REFERRAL = 'Indicação',
  EVENT = 'Evento / Feira',
  WALK_IN = 'Balcão / Presencial',
  OTHER = 'Outros'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  name: string;
  formation: CourseFormation | string;
  modality: CourseModality;
  price: number;
  enrollmentFee?: number; // Valor da Matrícula Bruto
  enrollmentDiscount?: number; // Desconto na Matrícula (Valor Fixo R$)
  scholarship: number; // Porcentagem de desconto na Mensalidade (0 a 100)
  duration: CourseDuration | string;
  active: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  source?: LeadSource | string;
  inDoubt?: boolean; 
  courseIds: string[];
  modality: CourseModality;
  status: LeadStatus;
  createdAt: string;
  assignedTo: string;
  notes: string[];
  totalValue: number;
  nextActionDate?: string; // Formato YYYY-MM-DD
}

export interface FinancialRecord {
  id: string;
  leadId?: string;
  studentName: string;
  courseName: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  installment: string;
}
