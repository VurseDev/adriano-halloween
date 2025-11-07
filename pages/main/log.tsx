/**
 * Logs Page component for viewing system activity logs.
 * 
 * This component displays a comprehensive log of all system activities including
 * product changes, user actions, and system events.
 * 
 * @component
 * @returns {JSX.Element} The rendered Logs Page component.
 */

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DatePicker,
  addToast,
  Spinner,
} from "@heroui/react";
import { Search, RefreshCw, Download, Filter, Calendar, User, Package, Trash2, Eye, Info, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { parseDate } from "@internationalized/date";

interface LogEntry {
  id: number;
  action: string;
  description: string;
  user_id?: number;
  user_email?: string;
  product_code?: string;
  product_name?: string;
  created_at: string;
  ip_address?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface Filters {
  action: string;
  user: string;
  product: string;
  startDate: string;
  endDate: string;
}

interface Product {
  code: string;
  p_name: string;
  description: string;
  p_type: string;
  quantity: number;
  image?: string | null;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  const [filters, setFilters] = React.useState<Filters>({
    action: "",
    user: "",
    product: "",
    startDate: "",
    endDate: ""
  });

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [popoverOpen, setPopoverOpen] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    fetchLogs();
    fetchProducts();
  }, [pagination.currentPage]);

  const fetchLogs = async (filtersToApply?: Filters) => {
    setIsLoading(true);
    try {
      const currentFilters = filtersToApply || filters;
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...currentFilters
      });

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        addToast({
          title: "Erro",
          description: data.error || "Falha ao carregar logs",
          color: "danger",
          timeout: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      addToast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao servidor",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/regprods");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchLogs(filters);
  };

  const clearFilters = () => {
    const emptyFilters: Filters = {
      action: "",
      user: "",
      product: "",
      startDate: "",
      endDate: ""
    };
    setFilters(emptyFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchLogs(emptyFilters);
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      const res = await fetch(`/api/logs?id=${logId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast({
          title: "Log Excluído",
          description: "Entrada de log removida com sucesso",
          color: "success",
          timeout: 3000,
        });
        fetchLogs();
      } else {
        const errorData = await res.json();
        addToast({
          title: "Erro",
          description: errorData.error || "Não foi possível excluir o log",
          color: "danger",
          timeout: 5000,
        });
      }
    } catch (err) {
      addToast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao servidor",
        color: "danger",
        timeout: 5000,
      });
    }
  };

  const handleViewProductDetails = (log: LogEntry) => {
    if (log.product_code) {
      const product = products.find(p => p.code === log.product_code);
      if (product) {
        setSelectedProduct(product);
        setPopoverOpen(log.id);
      } else {
        addToast({
          title: "Produto Não Encontrado",
          description: `Produto com código ${log.product_code} não foi encontrado`,
          color: "warning",
          timeout: 4000,
        });
      }
    } else {
      addToast({
        title: "Sem Informações do Produto",
        description: "Esta entrada de log não possui informações de produto",
        color: "warning",
        timeout: 4000,
      });
    }
  };

const exportToPDF = () => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Relatório de Logs - Atlas", 14, 22);
    
    // Date and filters info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
    doc.text(`Total de registros: ${pagination.totalItems}`, 14, 38);
    
    // Simple table without autoTable
    let yPosition = 45;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Ação", 14, yPosition);
    doc.text("Descrição", 40, yPosition);
    doc.text("Usuário", 100, yPosition);
    doc.text("Produto", 140, yPosition);
    doc.text("Data/Hora", 180, yPosition);
    doc.text("IP", 230, yPosition);
    
    yPosition += lineHeight;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, 280, yPosition);
    yPosition += lineHeight;
    
    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    logs.forEach((log, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(log.action.replace('_', ' '), 14, yPosition);
      doc.text(log.description.length > 30 ? log.description.substring(0, 30) + '...' : log.description, 40, yPosition);
      doc.text(log.user_email || '-', 100, yPosition);
      doc.text(log.product_name || '-', 140, yPosition);
      doc.text(formatDate(log.created_at), 180, yPosition);
      doc.text(log.ip_address || '-', 230, yPosition);
      
      yPosition += lineHeight;
      
      // Add separator line every few rows
      if (index < logs.length - 1) {
        doc.setDrawColor(240, 240, 240);
        doc.line(14, yPosition, 280, yPosition);
        yPosition += lineHeight;
      }
    });

    // Save the PDF
    doc.save(`logs-atlas-${new Date().toISOString().split('T')[0]}.pdf`);

    addToast({
      title: "PDF Exportado",
      description: "Relatório de logs exportado com sucesso",
      color: "success",
      timeout: 3000,
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    addToast({
      title: "Erro na Exportação",
      description: "Falha ao gerar o PDF",
      color: "danger",
      timeout: 5000,
    });
  }
};
  const getActionColor = (action: string) => {
    const actionColors: Record<string, "success" | "warning" | "danger" | "primary" | "default"> = {
      'PRODUCT_CREATE': 'success',
      'PRODUCT_UPDATE': 'warning',
      'PRODUCT_DELETE': 'danger',
      'USER_LOGIN': 'primary',
      'USER_LOGOUT': 'default',
      'CSV_IMPORT': 'success',
      'CSV_EXPORT': 'primary'
    };
    return actionColors[action] || 'default';
  };

  const getActionIcon = (action: string) => {
    const actionIcons: Record<string, string> = {
      'PRODUCT_CREATE': '➕',
      'PRODUCT_UPDATE': '✏️',
      'PRODUCT_DELETE': '',
      'USER_LOGIN': '🔐',
      'USER_LOGOUT': '🚪',
      'CSV_IMPORT': '📥',
      'CSV_EXPORT': '📤'
    };
    return actionIcons[action] || '📄';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const parseToCalendarDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return parseDate(date.toISOString().split('T')[0]);
    } catch (error) {
      return null;
    }
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: any) => {
    const dateString = value ? value.toString() : '';
    setFilters(prev => ({ ...prev, [key]: dateString }));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-divider bg-content1/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Image
                  src="./logo.png"
                  alt="Company Logo"
                  width={50}
                  height={35}
                  isBlurred
                />
                <h1 className="text-xl font-bold text-foreground">Atlas</h1>
              </div>
              <div className="hidden lg:flex gap-1">
                <Button variant="light" onPress={() => router.push("/main/index")}>Produtos</Button>
                <Button variant="light" onPress={() => router.push("/main/estoque")}>Estoque</Button>
                <Button variant="light" onPress={() => router.push("/main/logs")}>Relatórios</Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                color="primary" 
                startContent={<FileText size={18} />} 
                onPress={exportToPDF}
                isDisabled={logs.length === 0}
              >
                Exportar PDF
              </Button>
              <Button 
                color="primary" 
                startContent={<RefreshCw size={18} />} 
                onPress={() => fetchLogs()}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Relatórios do Sistema</h2>
          <p className="text-default-500">Monitoramento de todas as atividades do sistema</p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-primary">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Total de Logs</p>
              <p className="text-2xl font-bold">{pagination.totalItems}</p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-success">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Ações Hoje</p>
              <p className="text-2xl font-bold">
                {logs.filter(log => {
                  const today = new Date().toDateString();
                  const logDate = new Date(log.created_at).toDateString();
                  return today === logDate;
                }).length}
              </p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-warning">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Usuários Ativos</p>
              <p className="text-2xl font-bold">
                {new Set(logs.filter(log => log.user_email).map(log => log.user_email)).size}
              </p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-danger">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Produtos Modificados</p>
              <p className="text-2xl font-bold">
                {new Set(logs.filter(log => log.product_code).map(log => log.product_code)).size}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                label="Ação"
                placeholder="Filtrar por ação"
                selectedKeys={filters.action ? [filters.action] : []}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <SelectItem key="PRODUCT_CREATE">Criação de Produto</SelectItem>
                <SelectItem key="PRODUCT_UPDATE">Atualização de Produto</SelectItem>
                <SelectItem key="PRODUCT_DELETE">Exclusão de Produto</SelectItem>
                <SelectItem key="USER_LOGIN">Login de Usuário</SelectItem>
                <SelectItem key="USER_LOGOUT">Logout de Usuário</SelectItem>
                <SelectItem key="CSV_IMPORT">Importação CSV</SelectItem>
                <SelectItem key="CSV_EXPORT">Exportação CSV</SelectItem>
              </Select>

              <Input
                label="Usuário"
                placeholder="Filtrar por usuário"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                startContent={<User size={18} />}
              />

              <Input
                label="Produto"
                placeholder="Filtrar por produto"
                value={filters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                startContent={<Package size={18} />}
              />

              <DatePicker
                label="Data Início"
                value={parseToCalendarDate(filters.startDate)}
                onChange={(value) => handleDateChange('startDate', value)}
                granularity="day"
              />

              <DatePicker
                label="Data Fim"
                value={parseToCalendarDate(filters.endDate)}
                onChange={(value) => handleDateChange('endDate', value)}
                granularity="day"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                color="primary"
                startContent={<Filter size={18} />}
                onPress={applyFilters}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="bordered"
                onPress={clearFilters}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Table aria-label="Tabela de logs do sistema" className="min-w-full">
                  <TableHeader>
                    <TableColumn>AÇÃO</TableColumn>
                    <TableColumn>DESCRIÇÃO</TableColumn>
                    <TableColumn>USUÁRIO</TableColumn>
                    <TableColumn>PRODUTO</TableColumn>
                    <TableColumn>DATA/HORA</TableColumn>
                    <TableColumn>IP</TableColumn>
                    <TableColumn>AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Chip 
                            color={getActionColor(log.action)} 
                            variant="flat"
                            startContent={<span className="text-sm">{getActionIcon(log.action)}</span>}
                          >
                            {log.action.replace('_', ' ')}
                          </Chip>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <Tooltip content={log.description}>
                            <span className="truncate block">{log.description}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {log.user_email ? (
                            <Chip variant="flat" color="primary" size="sm">
                              {log.user_email}
                            </Chip>
                          ) : (
                            <span className="text-default-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.product_name ? (
                            <div>
                              <div className="font-medium">{log.product_name}</div>
                              <div className="text-xs text-default-500">{log.product_code}</div>
                            </div>
                          ) : (
                            <span className="text-default-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(log.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-default-500">
                            {log.ip_address || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Popover 
                              placement="bottom" 
                              showArrow 
                              offset={10}
                              isOpen={popoverOpen === log.id}
                              onOpenChange={(isOpen) => setPopoverOpen(isOpen ? log.id : null)}
                            >
                              <PopoverTrigger>
                                <Button 
                                  isIconOnly 
                                  size="sm" 
                                  variant="light"
                                  onPress={() => handleViewProductDetails(log)}
                                  isDisabled={!log.product_code}
                                >
                                  <Eye size={16} />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="px-1 py-2">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Info size={18} className="text-primary" />
                                    <h3 className="text-lg font-bold">Detalhes do Produto</h3>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm font-semibold">Nome:</p>
                                      <p className="text-default-600">{selectedProduct?.p_name}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-semibold">Descrição:</p>
                                      <p className="text-default-600 text-sm">{selectedProduct?.description}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-semibold">Código:</p>
                                      <p className="text-default-600 font-mono">{selectedProduct?.code}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-semibold">Tipo/Fornecedor:</p>
                                      <p className="text-default-600">{selectedProduct?.p_type}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-semibold">Quantidade em Estoque:</p>
                                      <p className={`font-bold ${
                                        (selectedProduct?.quantity || 0) > 10 ? 'text-success-600' : 
                                        (selectedProduct?.quantity || 0) > 0 ? 'text-warning-600' : 
                                        'text-danger-600'
                                      }`}>
                                        {selectedProduct?.quantity} unidades
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mt-4 pt-3 border-t border-default-200">
                                    <Button
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                      className="flex-1"
                                      onPress={() => router.push("/main/index")}
                                    >
                                      Ir para Produtos
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Tooltip content="Excluir log">
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                color="danger"
                                onPress={() => handleDeleteLog(log.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center p-4 border-t border-divider">
                    <Pagination
                      total={pagination.totalPages}
                      page={pagination.currentPage}
                      onChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}