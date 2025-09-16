
import { RecognitionProgram } from '@/types/recognition';

export const recognitionPrograms: RecognitionProgram[] = [
  {
    id: 'fideliza',
    name: 'Fideliza+',
    description: 'Programa de Incentivos e Reconhecimento das Farmers da LA Music.',
    color: '#3B82F6',
    icon: 'Star',
    totalPossibleStars: 50,
    targetRoles: ['Coord. Pedagógica', 'Recepção'],
    criteria: [
      {
        id: 'retention-rate',
        title: 'Excelência em Retenção',
        description: 'Manter taxa de retenção de alunos acima de 85% através de estratégias eficazes',
        type: 'checkbox',
        weight: 15,
        isRequired: true
      },
      {
        id: 'student-satisfaction',
        title: 'Satisfação e Engajamento',
        description: 'Obter avaliações positivas consistentes dos alunos e responsáveis',
        type: 'checkbox',
        weight: 10,
        isRequired: false
      },
      {
        id: 'proactive-contact',
        title: 'Relacionamento Proativo',
        description: 'Identificar e contatar proativamente alunos em risco de evasão',
        type: 'checkbox',
        weight: 8,
        isRequired: true
      },
      {
        id: 'improvement-actions',
        title: 'Inovação no Atendimento',
        description: 'Desenvolver e implementar melhorias na experiência educacional dos alunos',
        type: 'observation',
        weight: 12,
        maxStars: 12
      },
      {
        id: 'exceptional-service',
        title: 'Momentos Especiais',
        description: 'Criar experiências memoráveis que excedem as expectativas dos alunos',
        type: 'stars',
        weight: 5,
        maxStars: 5
      }
    ]
  },
  {
    id: 'matriculador',
    name: 'Matriculador+ LA',
    description: 'Programa de Incentivos e Reconhecimento dos Hunters da LA Music.',
    color: '#10B981',
    icon: 'DollarSign',
    totalPossibleStars: 60,
    targetRoles: ['Consultores', 'Coord. Vendas'],
    criteria: [
      {
        id: 'monthly-target',
        title: 'Superação de Metas',
        description: 'Alcançar ou superar as metas mensais de matrículas estabelecidas',
        type: 'checkbox',
        weight: 15,
        isRequired: true
      },
      {
        id: 'conversion-rate',
        title: 'Eficiência Comercial',
        description: 'Manter taxa de conversão de leads em matrículas acima de 30%',
        type: 'checkbox',
        weight: 10,
        isRequired: true
      },
      {
        id: 'follow-up-quality',
        title: 'Relacionamento Estratégico',
        description: 'Executar follow-up personalizado e efetivo com prospects qualificados',
        type: 'checkbox',
        weight: 8,
        isRequired: false
      },
      {
        id: 'sales-strategy',
        title: 'Inovação Comercial',
        description: 'Desenvolver e aplicar técnicas inovadoras de vendas e relacionamento',
        type: 'observation',
        weight: 7,
        maxStars: 7
      }
    ]
  },
  {
    id: 'professor',
    name: 'Professor+ LA',
    description: 'Programa de Incentivos e Reconhecimento dos Professores da LA Music.',
    color: '#8B5CF6',
    icon: 'Award',
    totalPossibleStars: 45,
    targetRoles: ['Professores'],
    criteria: [
      {
        id: 'class-preparation',
        title: 'Excelência Pedagógica',
        description: 'Demonstrar preparação meticulosa e planejamento estratégico das aulas',
        type: 'checkbox',
        weight: 12,
        isRequired: true
      },
      {
        id: 'student-engagement',
        title: 'Inspiração Musical',
        description: 'Manter alunos motivados e engajados no aprendizado musical',
        type: 'checkbox',
        weight: 10,
        isRequired: true
      },
      {
        id: 'innovative-methods',
        title: 'Metodologia Inovadora',
        description: 'Aplicar técnicas de ensino criativas e adaptadas ao perfil de cada aluno',
        type: 'checkbox',
        weight: 8,
        isRequired: false
      },
      {
        id: 'student-progress',
        title: 'Desenvolvimento Individual',
        description: 'Acompanhar e potencializar o crescimento musical de cada estudante',
        type: 'observation',
        weight: 10,
        maxStars: 10
      },
      {
        id: 'extra-activities',
        title: 'Engajamento Institucional',
        description: 'Participar ativamente em eventos, apresentações e projetos da LA Music',
        type: 'stars',
        weight: 5,
        maxStars: 5
      }
    ]
  }
];
