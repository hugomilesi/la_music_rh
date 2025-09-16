import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { X, Maximize2 } from 'lucide-react';

interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  classification: 'CLT' | 'PJ' | 'Horista' | 'Estagiario';
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenth_vacation: number;
  inss: number;
  store: number;
  bistro: number;
  advance: number;
  discount: number;
  total: number;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
  unit?: string;
}

interface PayrollTableProps {
  employees: PayrollEmployee[];
  selectedUnit: string;
}

export function PayrollTable({ employees, selectedUnit }: PayrollTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum funcionário encontrado para esta unidade</p>
      </div>
    );
  }

  return (
    <>
      {/* Normal Table View */}
      <div className={`w-full ${isExpanded ? 'hidden' : 'block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Folha de Pagamento - {selectedUnit}</h3>
          <button
            onClick={toggleExpansion}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg rounded-lg transition-all duration-300 border-none"
          >
            <Maximize2 className="w-4 h-4" />
            Expandir Tabela
          </button>
        </div>
        <Table className="w-full table-auto">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Cargo</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">Classificação</TableHead>
            <TableHead className="font-semibold text-right">Salário</TableHead>
            <TableHead className="font-semibold text-right hidden lg:table-cell">V. Transporte</TableHead>
            <TableHead className="font-semibold text-right hidden xl:table-cell">Bônus</TableHead>
            <TableHead className="font-semibold text-right hidden xl:table-cell">Comissão</TableHead>
            <TableHead className="font-semibold text-right hidden 2xl:table-cell">Reembolso</TableHead>
            <TableHead className="font-semibold text-right hidden 2xl:table-cell">13º/Férias</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right hidden 2xl:table-cell">INSS</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right hidden 2xl:table-cell">Loja</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right hidden 2xl:table-cell">Bistrô</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right hidden 2xl:table-cell">Adiantamento</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right hidden 2xl:table-cell">Desconto</TableHead>
            <TableHead className="font-semibold text-blue-600 text-right">Total</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">CPF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell className="font-medium">
                {employee.name}
              </TableCell>
              
              <TableCell>
                {employee.role}
              </TableCell>
              
              <TableCell className="hidden lg:table-cell">
                <Badge variant={employee.classification === 'CLT' ? 'default' : 'secondary'}>
                  {employee.classification}
                </Badge>
              </TableCell>
              
              <TableCell className="text-right">
                {formatCurrency(employee.salary)}
              </TableCell>
              
              <TableCell className="text-right hidden lg:table-cell">
                {formatCurrency(employee.transport)}
              </TableCell>
              
              <TableCell className="text-right hidden xl:table-cell">
                {formatCurrency(employee.bonus)}
              </TableCell>
              
              <TableCell className="text-right hidden xl:table-cell">
                {formatCurrency(employee.commission)}
              </TableCell>
              
              <TableCell className="text-right hidden 2xl:table-cell">
                {formatCurrency(employee.reimbursement)}
              </TableCell>
              
              <TableCell className="text-right hidden 2xl:table-cell">
                {formatCurrency(employee.thirteenth_vacation)}
              </TableCell>
              
              <TableCell className="text-gray-600 font-medium text-right hidden 2xl:table-cell">
                {formatCurrency(employee.inss)}
              </TableCell>
              
              <TableCell className="text-gray-600 text-right hidden 2xl:table-cell">
                {formatCurrency(employee.store)}
              </TableCell>
              
              <TableCell className="text-gray-600 text-right hidden 2xl:table-cell">
                {formatCurrency(employee.bistro)}
              </TableCell>
              
              <TableCell className="text-gray-600 text-right hidden 2xl:table-cell">
                {formatCurrency(employee.advance)}
              </TableCell>
              
              <TableCell className="text-gray-600 text-right hidden 2xl:table-cell">
                {formatCurrency(employee.discount)}
              </TableCell>
              
              <TableCell className="font-bold text-blue-600 text-right">
                {formatCurrency(employee.total)}
              </TableCell>
              
              <TableCell className="text-sm hidden lg:table-cell">
                {employee.cpf}
              </TableCell>
            </TableRow>
          ))}

        </TableBody>
        </Table>
        
        {/* Summary Row */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total Funcionários: </span>
              <span className="text-blue-600">{employees.length}</span>
            </div>
            <div>
              <span className="font-semibold">Total Salários: </span>
              <span className="text-blue-600">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total INSS: </span>
              <span className="text-gray-600">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.inss, 0))}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total Geral: </span>
              <span className="text-blue-600 font-bold">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.total, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Table View with Glassmorphism */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-[95vw] sm:w-[90vw] max-h-[90vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden relative">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-semibold">Folha de Pagamento - {selectedUnit}</h3>
              <button
                onClick={toggleExpansion}
                className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
                style={{ background: 'linear-gradient(135deg, hsl(0, 0%, 98%) 0%, #FAFAFA 100%)' }}
              >
                <X className="w-4 h-4" />
                Fechar
              </button>
            </div>
            
            {/* Scrollable table container */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <Table className="w-full min-w-[1400px]">
                <TableHeader className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <TableRow className="border-b border-white/20">
                    <TableHead className="font-semibold w-[200px] bg-white/90 dark:bg-gray-800/90">Nome</TableHead>
                    <TableHead className="font-semibold w-[150px] bg-white/90 dark:bg-gray-800/90">Cargo</TableHead>
                    <TableHead className="font-semibold w-[120px] bg-white/90 dark:bg-gray-800/90">Classificação</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Salário</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">V. Transporte</TableHead>
                    <TableHead className="font-semibold w-[100px] text-right bg-white/90 dark:bg-gray-800/90">Bônus</TableHead>
                    <TableHead className="font-semibold w-[100px] text-right bg-white/90 dark:bg-gray-800/90">Comissão</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Reembolso</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">13º/Férias</TableHead>
                    <TableHead className="font-semibold text-gray-600 w-[100px] text-right bg-white/90 dark:bg-gray-800/90">INSS</TableHead>
                    <TableHead className="font-semibold text-gray-600 w-[100px] text-right bg-white/90 dark:bg-gray-800/90">Loja</TableHead>
                    <TableHead className="font-semibold text-gray-600 w-[100px] text-right bg-white/90 dark:bg-gray-800/90">Bistrô</TableHead>
                    <TableHead className="font-semibold text-gray-600 w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Adiantamento</TableHead>
                    <TableHead className="font-semibold text-gray-600 w-[100px] text-right bg-white/90 dark:bg-gray-800/90">Desconto</TableHead>
                    <TableHead className="font-semibold text-blue-600 w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Total</TableHead>
                    <TableHead className="font-semibold w-[150px] bg-white/90 dark:bg-gray-800/90">CPF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-white/30 dark:hover:bg-gray-800/30 border-b border-white/10">
                      <TableCell className="font-medium w-[200px]">
                        {employee.name}
                      </TableCell>
                      
                      <TableCell className="w-[150px]">
                        {employee.role}
                      </TableCell>
                      
                      <TableCell className="w-[120px]">
                        <Badge variant={employee.classification === 'CLT' ? 'default' : 'secondary'}>
                          {employee.classification}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right w-[120px]">
                        {formatCurrency(employee.salary)}
                      </TableCell>
                      
                      <TableCell className="text-right w-[120px]">
                        {formatCurrency(employee.transport)}
                      </TableCell>
                      
                      <TableCell className="text-right w-[100px]">
                        {formatCurrency(employee.bonus)}
                      </TableCell>
                      
                      <TableCell className="text-right w-[100px]">
                        {formatCurrency(employee.commission)}
                      </TableCell>
                      
                      <TableCell className="text-right w-[120px]">
                        {formatCurrency(employee.reimbursement)}
                      </TableCell>
                      
                      <TableCell className="text-right w-[120px]">
                        {formatCurrency(employee.thirteenth_vacation)}
                      </TableCell>
                      
                      <TableCell className="text-gray-600 font-medium text-right w-[100px]">
                        {formatCurrency(employee.inss)}
                      </TableCell>
                      
                      <TableCell className="text-gray-600 text-right w-[100px]">
                        {formatCurrency(employee.store)}
                      </TableCell>
                      
                      <TableCell className="text-gray-600 text-right w-[100px]">
                        {formatCurrency(employee.bistro)}
                      </TableCell>
                      
                      <TableCell className="text-gray-600 text-right w-[120px]">
                        {formatCurrency(employee.advance)}
                      </TableCell>
                      
                      <TableCell className="text-gray-600 text-right w-[100px]">
                        {formatCurrency(employee.discount)}
                      </TableCell>
                      
                      <TableCell className="font-bold text-blue-600 text-right w-[120px]">
                        {formatCurrency(employee.total)}
                      </TableCell>
                      
                      <TableCell className="text-sm w-[150px]">
                        {employee.cpf}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Summary Row in expanded view */}
            <div className="p-4 border-t border-white/20 bg-white/50 dark:bg-gray-800/50">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total Funcionários: </span>
                  <span className="text-blue-600">{employees.length}</span>
                </div>
                <div>
                  <span className="font-semibold">Total Salários: </span>
                  <span className="text-blue-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Total INSS: </span>
                  <span className="text-gray-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.inss, 0))}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Total Geral: </span>
                  <span className="text-blue-600 font-bold">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.total, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}