import React, { useState, useEffect } from 'react';
import { User, UserRole, Lead, Course, FinancialRecord, LeadStatus } from './types';
import Login from './views/Login';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import LeadFunnel from './views/LeadFunnel';
import FinancialPanel from './views/FinancialPanel';
import Courses from './views/Courses';
import Agenda from './views/Agenda';
import Team from './views/Team';
import { AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          mapAndSetUser(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        mapAndSetUser(session.user);
        setActiveView('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLeads([]);
        setCourses([]);
        setFinancialRecords([]);
        setIsLoading(false);
        setActiveView('dashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const mapAndSetUser = (supabaseUser: any) => {
    setUser({
      id: supabaseUser.id,
      name: supabaseUser.user_metadata.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: (supabaseUser.user_metadata.role as UserRole) || UserRole.CONSULTANT,
      avatar: supabaseUser.user_metadata.avatar
    });
  };

  useEffect(() => {
    const loadBusinessData = async () => {
      if (!user) return;

      try {
        const [leadsRes, coursesRes, financeRes] = await Promise.all([
          supabase.from('leads').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('financial_records').select('*')
        ]);

        if (leadsRes.data) {
          const mappedLeads = leadsRes.data.map((l: any) => {
             let status = l.status;
             if (!Object.values(LeadStatus).includes(status)) {
                status = LeadStatus.NEW;
             }

             const notes: string[] = l.notes || [];
             const cityFromNote = notes.find((n: string) => n.startsWith('Cidade: '))?.replace('Cidade: ', '');
             const sourceFromNote = notes.find((n: string) => n.startsWith('Origem: '))?.replace('Origem: ', '');
             const inDoubtFromNote = notes.some((n: string) => n === 'Dúvida: Sim');
             
             const scheduleNote = notes.find((n: string) => n.startsWith('Agendamento: '));
             let nextActionDate = undefined;
             if (scheduleNote) {
                const datePart = scheduleNote.replace('Agendamento: ', '').trim();
                const parts = datePart.split('/');
                if (parts.length === 3) {
                  nextActionDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
             }

             const courseIds = l.course_id ? l.course_id.split(',').filter(Boolean) : [];

             return {
                ...l,
                name: l.name ? l.name.trim() : 'Sem Nome',
                status: status,
                createdAt: l.created_at,
                courseIds: courseIds,
                totalValue: l.total_value,
                assignedTo: l.assigned_to,
                city: l.city || cityFromNote,
                source: l.source || sourceFromNote,
                inDoubt: inDoubtFromNote,
                nextActionDate: nextActionDate
             };
          });
          setLeads(mappedLeads);
        }

        if (coursesRes.data) {
           const mappedCourses = coursesRes.data.map((c: any) => ({
              ...c,
              price: Number(c.price),
              scholarship: Number(c.scholarship),
              enrollmentFee: c.enrollment_fee ? Number(c.enrollment_fee) : 0,
              enrollmentDiscount: c.enrollment_discount ? Number(c.enrollment_discount) : 0
           }));
           setCourses(mappedCourses);
        }
        
        if (financeRes.data) {
           const mappedFinance = financeRes.data.map((f: any) => ({
             ...f,
             leadId: f.lead_id || undefined,
             studentName: f.student_name ? f.student_name.trim() : '',
             courseName: f.course_name,
             dueDate: f.due_date
           }));
           setFinancialRecords(mappedFinance);
        }

      } catch (error) {
        console.error("Erro crítico ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessData();
  }, [user]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getDurationInMonths = (duration: string) => {
    if (!duration) return 24;
    const cleanDuration = duration.toLowerCase().trim();
    const number = parseFloat(cleanDuration.split(' ')[0]);
    if (cleanDuration.includes('ano')) return Math.round(number * 12);
    return Math.round(number) || 24;
  };

  const handleLeadEnrollment = async (lead: Lead) => {
    const mainCourse = courses.find(c => c.id === lead.courseIds[0]);
    const totalMonths = mainCourse ? getDurationInMonths(mainCourse.duration) : 24;
    const newRecords: FinancialRecord[] = [];

    if (mainCourse && mainCourse.enrollmentFee && mainCourse.enrollmentFee > 0) {
      const discountValue = mainCourse.enrollmentDiscount || 0;
      const netEnrollmentFee = Math.max(0, mainCourse.enrollmentFee - discountValue);
      const enrollmentId = generateUUID();
      
      // Fixed: Consistently include course name in enrollment fee title for better identification
      const enrollmentTitle = `Taxa de Matrícula - ${mainCourse.name}${discountValue > 0 ? ` (Desc. ${formatCurrency(discountValue)})` : ''}`;

      newRecords.push({
        id: enrollmentId,
        leadId: lead.id,
        studentName: lead.name,
        courseName: enrollmentTitle,
        amount: netEnrollmentFee,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        installment: 'Taxa Única'
      });
    }

    const tuitionId = generateUUID();
    const monthlyGross = mainCourse ? mainCourse.price : (lead.totalValue / totalMonths);
    const scholarship = mainCourse ? mainCourse.scholarship : 0;
    const monthlyNet = monthlyGross * (1 - scholarship / 100);

    newRecords.push({
      id: tuitionId,
      leadId: lead.id,
      studentName: lead.name,
      courseName: lead.courseIds.length > 1 ? `${lead.courseIds.length} Cursos` : (mainCourse?.name || 'Curso'),
      amount: monthlyNet,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      status: 'PENDING',
      installment: `01/${totalMonths}`
    });

    setFinancialRecords(prev => [...newRecords, ...prev]);

    try {
      const dbPayloads = newRecords.map(r => ({
          id: r.id,
          student_name: r.studentName,
          course_name: r.courseName,
          amount: r.amount,
          due_date: r.dueDate,
          status: r.status,
          installment: r.installment
      }));
      const { error } = await supabase.from('financial_records').insert(dbPayloads);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao gerar registros financeiros:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Sincronizando Dados...</p>
      </div>
    );
  }

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <>
      <Layout user={user} onLogout={() => supabase.auth.signOut()} activeView={activeView} setActiveView={setActiveView}>
        {activeView === 'dashboard' && <Dashboard leads={leads} courses={courses} />}
        {activeView === 'leads' && (
          <LeadFunnel leads={leads} setLeads={setLeads} courses={courses} onConfirmAction={openConfirm} onLeadEnrolled={handleLeadEnrollment} />
        )}
        {activeView === 'financial' && (
          <FinancialPanel records={financialRecords} setRecords={setFinancialRecords} leads={leads} setLeads={setLeads} onConfirmAction={openConfirm} />
        )}
        {activeView === 'courses' && (
          <Courses 
            courses={courses} 
            setCourses={setCourses} 
            leads={leads}
            financialRecords={financialRecords}
            setFinancialRecords={setFinancialRecords}
            onConfirmAction={openConfirm} 
          />
        )}
        {activeView === 'agenda' && (
          <Agenda leads={leads} setLeads={setLeads} user={user} onConfirmAction={openConfirm} />
        )}
        {activeView === 'team' && user.role === UserRole.ADMIN && (
          <Team currentUser={user} onConfirmAction={openConfirm} />
        )}
      </Layout>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="w-full max-sm:max-w-[320px] max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={closeConfirm} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">Cancelar</button>
              <button onClick={() => { confirmModal.onConfirm(); closeConfirm(); }} className="flex-1 py-3.5 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;