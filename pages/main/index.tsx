/**
 * MainPage component for managing products and inventory.
 * 
 * This component fetches products and suppliers from the API, allows users to add new products,
 * and provides functionality to import and export product data in CSV format.
 * 
 * @component
 * @returns {JSX.Element} The rendered MainPage component.
 */

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  addToast,
} from "@heroui/react";
import { Plus, Upload, Package, X, Search, Download as DownloadIcon, FileText, Edit, Trash, Eye, Info, RefreshCw } from "lucide-react";
import Papa from "papaparse";

interface Product {
  p_id?: number;
  code: string;
  p_name: string;
  description: string;
  p_type: string;
  quantity: number;
  image?: string | null;
}

interface Supplier {
  value: string;
  label: string;
}

export default function MainPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    supplier: "",
    code: "",
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/regprods");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/regforn");
        const data = await res.json();

        const formattedSuppliers: Supplier[] = data.map((supplier: any) => ({
          value: supplier.s_id.toString(),
          label: supplier.s_name
        }));
        
        setSuppliers(formattedSuppliers);
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    };

    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Open modal for adding new product
  const handleAddProduct = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      supplier: "",
      code: "",
    });
    setImagePreview(null);
    setErrors({});
    onOpen();
  };

  // Open modal for editing existing product
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      name: product.p_name,
      description: product.description,
      supplier: product.p_type,
      code: product.code,
    });
    setImagePreview(product.image || null);
    setErrors({});
    
    // Close the popover
    setOpenPopoverId(null);
    
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.supplier || !formData.code) {
      setErrors({ api: "Preencha todos os campos obrigatórios." });
      return;
    }

    const data = {
      p_name: formData.name,
      description: formData.description,
      code: formData.code,
      p_type: formData.supplier,
      quantity: isEditing && editingProduct ? editingProduct.quantity : 0,
      image: imagePreview,
    };

    try {
      let res;
      if (isEditing && editingProduct) {
        // Update existing product
        res = await fetch(`/api/regprods?code=${editingProduct.code}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Create new product
        res = await fetch("/api/regprods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        addToast({
          title: "Erro",
          description: result.error || `Erro ao ${isEditing ? 'atualizar' : 'registrar'} produto`,
          color: "danger",
          timeout: 5000,
        });
        return;
      }

      // Success toast
      addToast({
        title: "Sucesso!",
        description: `Produto ${isEditing ? 'atualizado' : 'registrado'} com sucesso`,
        color: "success",
        timeout: 3000,
      });

      // Update products list
      if (isEditing && editingProduct) {
        setProducts(prev => prev.map(p => 
          p.code === editingProduct.code ? { ...p, ...data } : p
        ));
      } else {
        setProducts((prev) => [result, ...prev]);
      }

      // Reset form and close modal
      setFormData({ name: "", description: "", supplier: "", code: "" });
      setImagePreview(null);
      setErrors({});
      onOpenChange();
      
    } catch (err) {
      addToast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao servidor",
        color: "danger",
        timeout: 5000,
      });
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const csvData = products.map(p => ({
      Nome: p.p_name,
      Descrição: p.description,
      Código: p.code,
      Tipo: p.p_type,
      Quantidade: p.quantity
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: "CSV Exportado",
      description: `${products.length} produtos exportados com sucesso`,
      color: "success",
      timeout: 3000,
    });
  };

  // Handle CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        try {
          const importedProducts = results.data.map((row: any) => ({
            p_name: row.Nome || row.name || '',
            description: row.Descrição || row.description || '',
            code: row.Código || row.code || '',
            p_type: row.Tipo || row.type || '',
            quantity: parseInt(row.Quantidade || row.quantity || '0'),
            image: null
          }));

          let successCount = 0;
          for (const product of importedProducts) {
            if (product.p_name && product.code) {
              const res = await fetch("/api/regprods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
              });

              if (res.ok) {
                const result = await res.json();
                setProducts((prev) => [...prev, result]);
                successCount++;
              }
            }
          }

          addToast({
            title: "Importação Concluída",
            description: `${successCount} produtos importados com sucesso!`,
            color: "success",
            timeout: 5000,
          });

        } catch (err) {
          console.error("Erro ao importar CSV:", err);
          addToast({
            title: "Erro na Importação",
            description: "Erro ao importar CSV",
            color: "danger",
            timeout: 5000,
          });
        }
      },
      error: (error: any) => {
        console.error("Erro ao ler CSV:", error);
        addToast({
          title: "Erro no Arquivo",
          description: "Erro ao ler arquivo CSV",
          color: "danger",
          timeout: 5000,
        });
      }
    });

    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (product: Product) => {
    try {
      const res = await fetch(`/api/regprods?code=${product.code}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.code !== product.code));
        addToast({
          title: "Produto Excluído",
          description: `${product.p_name} foi removido com sucesso`,
          color: "success",
          timeout: 3000,
        });
      } else {
        const errorData = await res.json();
        addToast({
          title: "Erro",
          description: errorData.error || "Não foi possível excluir o produto",
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

  if (!mounted) return null;

  const filteredProducts = products.filter((p) =>
    p.p_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Skeleton loader
  const ProductSkeleton = () => (
    <Card>
      <CardBody className="flex flex-col items-center text-center gap-2">
        <div className="w-32 h-32 bg-default-200 rounded-lg animate-pulse" />
        <div className="h-4 bg-default-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-default-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-default-200 rounded w-1/2 animate-pulse" />
      </CardBody>
    </Card>
  );

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
                <Button variant="light" onPress={() => router.push("/main")}>Produtos</Button>
                <Button variant="light" onPress={() => router.push("/main/estoque")}>Estoque</Button>
                <Button variant="light">Relatórios</Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button color="primary" startContent={<Plus size={18} />} onPress={handleAddProduct} className="hidden sm:flex">
                Novo Produto
              </Button>
              <Button color="primary" isIconOnly onPress={handleAddProduct} className="sm:hidden">
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Produtos</h2>
          <p className="text-default-500">Gerencie seus produtos e estoque</p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-primary">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Total Produtos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-success">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Em Estoque</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.quantity > 0).length}
              </p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-warning">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Estoque Baixo</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.quantity > 0 && p.quantity <= 10).length}
              </p>
            </CardBody>
          </Card>
          
          <Card className="border-l-4 border-l-danger">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Sem Estoque</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Search Bar and CSV Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            placeholder="Buscar produtos..."
            startContent={<Search size={20} />}
            size="lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              base: "max-w-md",
            }}
          />
          
          <div className="flex gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              id="csv-upload"
            />
            <Button
              as="label"
              htmlFor="csv-upload"
              variant="bordered"
              startContent={<Upload size={18} />}
              className="cursor-pointer"
            >
              Importar CSV
            </Button>
            <Button
              variant="bordered"
              startContent={<DownloadIcon size={18} />}
              onPress={handleExportCSV}
              isDisabled={products.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="flat"
              color="primary"
              startContent={<RefreshCw size={18} />}
              onPress={() => window.location.reload()}
            >
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <Popover 
                key={p.code} 
                placement="bottom" 
                showArrow 
                offset={10}
                isOpen={openPopoverId === p.code}
                onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? p.code : null)}
              >
                <PopoverTrigger>
                  <Card 
                    className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    isPressable
                  >
                    <CardBody className="flex flex-col items-center text-center gap-2 p-4">
                      <Image
                        src={p.image || "/placeholder.png"}
                        alt={p.p_name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                      <h3 className="font-semibold text-sm">{p.p_name}</h3>
                      <p className="text-xs text-default-500 line-clamp-2">{p.description}</p>
                      <span className="text-xs text-default-400">Código: {p.code}</span>
                      
                      {/* Stock status */}
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        p.quantity > 10 ? 'bg-success-100 text-success-800' : 
                        p.quantity > 0 ? 'bg-warning-100 text-warning-800' : 
                        'bg-danger-100 text-danger-800'
                      }`}>
                        {p.quantity > 10 ? 'Em estoque' : p.quantity > 0 ? 'Estoque baixo' : 'Sem estoque'} ({p.quantity})
                      </div>
                    </CardBody>
                  </Card>
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
                        <p className="text-default-600">{p.p_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold">Descrição:</p>
                        <p className="text-default-600 text-sm">{p.description}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold">Código:</p>
                        <p className="text-default-600 font-mono">{p.code}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold">Tipo/Fornecedor:</p>
                        <p className="text-default-600">{p.p_type}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold">Quantidade em Estoque:</p>
                        <p className={`font-bold ${
                          p.quantity > 10 ? 'text-success-600' : 
                          p.quantity > 0 ? 'text-warning-600' : 
                          'text-danger-600'
                        }`}>
                          {p.quantity} unidades
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t border-default-200">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Edit size={16} />}
                        className="flex-1"
                        onPress={() => handleEditProduct(p)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash size={16} />}
                        onPress={() => handleDeleteProduct(p)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))
          ) : (
            <Card className="border-2 border-dashed border-default-300 col-span-full">
              <CardBody className="flex flex-col items-center justify-center h-48">
                <Package size={48} className="text-default-400 mb-2" />
                <p className="text-default-500">
                  {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="mt-2"
                    onPress={handleAddProduct}
                  >
                    Adicionar Produto
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </main>

      {/* Registration/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  {isEditing ? 'Editar Produto' : 'Registrar Novo Produto'}
                </h3>
                <p className="text-sm text-default-500 font-normal">
                  {isEditing ? 'Atualize as informações do produto' : 'Preencha as informações do produto'}
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {errors.api && (
                    <p className="text-danger text-sm bg-danger-50 p-2 rounded-md">
                      {errors.api}
                    </p>
                  )}

                  <Input
                    isRequired
                    label="Nome do Produto"
                    labelPlacement="outside"
                    name="name"
                    placeholder="Digite o nome do produto"
                    variant="bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <Textarea
                    isRequired
                    label="Descrição"
                    labelPlacement="outside"
                    name="description"
                    placeholder="Descreva o produto"
                    variant="bordered"
                    minRows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <Select
                    isRequired
                    label="Fornecedor"
                    labelPlacement="outside"
                    name="supplier"
                    placeholder="Selecione um fornecedor"
                    variant="bordered"
                    selectedKeys={[formData.supplier]}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  >
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.value} textValue={supplier.label}>
                        {supplier.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    isRequired
                    label="Código do Produto"
                    labelPlacement="outside"
                    name="code"
                    placeholder="Digite o código manualmente"
                    variant="bordered"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    isDisabled={isEditing}
                    description={isEditing ? "O código do produto não pode ser alterado" : ""}
                  />

                  <div className="flex flex-col gap-2">
                    <label htmlFor="image-upload" className="text-sm font-medium text-foreground">
                        Imagem do Produto
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        variant="bordered"
                        startContent={<Upload size={20} />}
                        className="cursor-pointer"
                      >
                        Carregar Imagem
                      </Button>
                    ) : (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="solid"
                          className="absolute top-2 right-2"
                          onPress={removeImage}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? 'Atualizar Produto' : 'Registrar Produto'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
