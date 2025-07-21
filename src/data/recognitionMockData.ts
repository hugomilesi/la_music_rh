
import { RecognitionProgram } from '@/types/recognition';

export const recognitionPrograms: RecognitionProgram[] = [
  {
    id: 'fideliza',
    name: 'Fideliza+',
    description: 'Programa de fidelização para colaboradores administrativos',
    color: '#3B82F6',
    icon: 'Star',
    totalPossibleStars: 50,
    targetRoles: ['Coord. Pedagógica', 'Recepção'],
    criteria: [
      {
        id: 'retention-rate',
        title: 'Taxa de Retenção',
        description: 'Manter taxa de retenção acima de 85%',
        type: 'checkbox',
        weight: 15,
        isRequired: true
      },
      {
        id: 'student-satisfaction',
        title: 'Satisfação dos Alunos',
        description: 'Receber feedback positivo dos alunos',
        type: 'checkbox',
        weight: 10,
        isRequired: false
      },
      {
        id: 'proactive-contact',
        title: 'Contato Proativo',
        description: 'Realizar contatos proativos com alunos em risco',
        type: 'checkbox',
        weight: 8,
        isRequired: true
      },
      {
        id: 'improvement-actions',
        title: 'Ações de Melhoria',
        description: 'Implementar ações para melhorar a experiência do aluno',
        type: 'observation',
        weight: 12,
        maxStars: 12
      },
      {
        id: 'exceptional-service',
        title: 'Atendimento Excepcional',
        description: 'Casos de atendimento que superaram expectativas',
        type: 'stars',
        weight: 5,
        maxStars: 5
      }
    ]
  },
  {
    id: 'matriculador',
    name: 'Matriculador+ LA',
    description: 'Programa de incentivo para equipe de vendas',
    color: '#10B981',
    icon: 'DollarSign',
    totalPossibleStars: 60,
    targetRoles: ['Consultores', 'Coord. Vendas'],
    criteria: [
      {
        id: 'monthly-target',
        title: 'Meta Mensal',
        description: 'Atingir meta mensal de matrículas',
        type: 'checkbox',
        weight: 15,
        isRequired: true
      },
      {
        id: 'conversion-rate',
        title: 'Taxa de Conversão',
        description: 'Manter taxa de conversão acima de 30%',
        type: 'checkbox',
        weight: 10,
        isRequired: true
      },
      {
        id: 'follow-up-quality',
        title: 'Qualidade do Follow-up',
        description: 'Realizar follow-up efetivo com leads',
        type: 'checkbox',
        weight: 8,
        isRequired: false
      },
      {
        id: 'sales-strategy',
        title: 'Estratégia de Vendas',
        description: 'Descrever estratégias utilizadas para conquistar matrículas',
        type: 'observation',
        weight: 7,
        maxStars: 7
      }
    ]
  },
  {
    id: 'professor',
    name: 'Professor+ LA',
    description: 'Programa de reconhecimento para professores',
    color: '#8B5CF6',
    icon: 'Award',
    totalPossibleStars: 45,
    targetRoles: ['Professores'],
    criteria: [
      {
        id: 'class-preparation',
        title: 'Preparação das Aulas',
        description: 'Demonstrar preparação adequada para as aulas',
        type: 'checkbox',
        weight: 12,
        isRequired: true
      },
      {
        id: 'student-engagement',
        title: 'Engajamento dos Alunos',
        description: 'Manter alunos engajados durante as aulas',
        type: 'checkbox',
        weight: 10,
        isRequired: true
      },
      {
        id: 'innovative-methods',
        title: 'Métodos Inovadores',
        description: 'Utilizar métodos de ensino inovadores',
        type: 'checkbox',
        weight: 8,
        isRequired: false
      },
      {
        id: 'student-progress',
        title: 'Progresso dos Alunos',
        description: 'Acompanhar e documentar o progresso individual dos alunos',
        type: 'observation',
        weight: 10,
        maxStars: 10
      },
      {
        id: 'extra-activities',
        title: 'Atividades Extras',
        description: 'Participação em atividades extras e projetos especiais',
        type: 'stars',
        weight: 5,
        maxStars: 5
      }
    ]
  }
];
