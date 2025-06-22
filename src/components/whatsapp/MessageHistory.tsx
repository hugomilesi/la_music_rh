
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Calendar as CalendarIcon, Download, MessageSquare, Eye } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { format } from 'date-fns';

export const MessageHistory: React.FC = () => {
  const { messages, getMessageHistory } = useWhatsApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [recipientFilter, setRecipientFilter] = useState('');

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      const matchesType = typeFilter === 'all' || message.type === typeFilter;
      const matchesRecipient = !recipientFilter || message.recipientName.toLowerCase().includes(recipientFilter.toLowerCase());
      
      const messageDate = new Date(message.createdAt);
      const matchesDateFrom = !dateFrom || messageDate >= dateFrom;
      const matchesDateTo = !dateTo || messageDate <= dateTo;
      
      return matchesSearch && matchesStatus && matchesType && matchesRecipient && matchesDateFrom && matchesDateTo;
    });
  }, [messages, searchTerm, statusFilter, typeFilter, recipientFilter, dateFrom, dateTo]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'sent': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'read': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const exportData = () => {
    const csvData = filteredMessages.map(msg => ({
      'Data/Hora': format(new Date(msg.createdAt), 'dd/MM/yyyy HH:mm'),
      'Destinatário': msg.recipientName,
      'Telefone': msg.recipient,
      'Mensagem': msg.message,
      'Tipo': msg.type,
      'Status': msg.status,
      'Enviado': msg.sentAt ? format(new Date(msg.sentAt), 'dd/MM/yyyy HH:mm') : '',
      'Entregue': msg.deliveredAt ? format(new Date(msg.deliveredAt), 'dd/MM/yyyy HH:mm') : '',
      'Lido': msg.readAt ? format(new Date(msg.readAt), 'dd/MM/yyyy HH:mm') : ''
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messages-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="read">Lido</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="media">Mídia</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por destinatário..."
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Data inicial'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Data final'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredMessages.length} mensagens encontradas
            </p>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Histórico de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{message.recipientName}</span>
                      <span className="text-sm text-gray-500">{message.recipient}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{message.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Criado: {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      {message.sentAt && (
                        <span>Enviado: {format(new Date(message.sentAt), 'dd/MM/yyyy HH:mm')}</span>
                      )}
                      {message.deliveredAt && (
                        <span>Entregue: {format(new Date(message.deliveredAt), 'dd/MM/yyyy HH:mm')}</span>
                      )}
                      {message.readAt && (
                        <span>Lido: {format(new Date(message.readAt), 'dd/MM/yyyy HH:mm')}</span>
                      )}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalhes da Mensagem</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Destinatário</label>
                          <p>{message.recipientName} ({message.recipient})</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Mensagem</label>
                          <p className="bg-gray-50 p-3 rounded">{message.message}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Tipo</label>
                            <p>{message.type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge className={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                          </div>
                        </div>
                        {message.templateId && (
                          <div>
                            <label className="text-sm font-medium">Template ID</label>
                            <p>{message.templateId}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
