"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Image,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Plus, Search, User, LogOut, Settings, Minus, Package } from "lucide-react";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";

import NextLink from "next/link";
import clsx from "clsx";
import { link as linkStyles } from "@heroui/theme";


const siteConfig = {
  navItems: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Produtos", href: "/products" },
    { label: "Estoque", href: "/inventory" },
    { label: "Relatórios", href: "/reports" },
  ],
  navMenuItems: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Produtos", href: "/products" },
    { label: "Estoque", href: "/inventory" },
    { label: "Relatórios", href: "/reports" },
  ],
};

type Product = {
  code: string;
  p_name: string;
  description: string;
  p_type?: string;
  quantity: number;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/regprods");
      const data = await res.json();
      setProducts(data);
      const qtyMap: Record<string, number> = {};
      data.forEach((p: Product) => (qtyMap[p.code] = p.quantity));
      setQuantities(qtyMap);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  // Increment stock
  const handleIncrement = async (code: string) => {
    await updateStock(code, 1);
  };

  // Decrement stock
  const handleDecrement = async (code: string) => {
    await updateStock(code, -1);
  };

  // Call API to update stock
  const updateStock = async (code: string, delta: number) => {
    try {
      const res = await fetch("/api/updateStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, quantity: delta }),
      });
      const data = await res.json();
      if (res.ok) {

        // Update local quantity map immediately for responsiveness

        setQuantities(prev => ({
          ...prev,
          [code]: Math.max(0, (prev[code] || 0) + delta),
        }));
      } else {
        console.error("Error updating stock:", data.error);
      }
    } catch (err) {
      console.error(err);
    }
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
                <Button variant="light" onPress={() => router.push("/main")}>Produtos</Button>
                <Button variant="light" onPress={() => router.push("/main/estoque")}>Estoque</Button>
                <Button variant="light">Relatórios</Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button color="primary" startContent={<Plus size={18} />} className="hidden sm:flex">
                Novo Produto
              </Button>
              <Button color="primary" isIconOnly className="sm:hidden">
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Estoque</h2>
          <p className="text-default-500">Gerencie o estoque dos seus produtos</p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Buscar produtos no estoque..."
            startContent={<Search size={20} />}
            size="lg"
            classNames={{ base: "max-w-md" }}
          />
        </div>

        {loading ? (
          <p>Carregando produtos...</p>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl">
            {products.length === 0 ? (
              <Card className="border-2 border-dashed border-default-300">
                <CardBody className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <Package size={48} className="mx-auto mb-2 text-default-400" />
                    <p className="text-default-500">Nenhum produto no estoque</p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product.code} shadow="sm" className="border border-divider">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{product.p_name}</h3>
                          <Chip size="sm" variant="flat" color="default">{product.code}</Chip>
                          {quantities[product.code] === 0 && (
                            <Chip size="sm" color="danger" variant="flat">Sem estoque</Chip>
                          )}
                          {quantities[product.code] > 0 && quantities[product.code] < 10 && (
                            <Chip size="sm" color="warning" variant="flat">Estoque baixo</Chip>
                          )}
                        </div>
                        <p className="text-sm text-default-600 mb-1">{product.description}</p>
                        <p className="text-sm text-default-500">
                          Fornecedor: <span className="font-medium">{product.p_type || "—"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => handleDecrement(product.code)}
                          isDisabled={quantities[product.code] === 0}
                        >
                          <Minus size={16} />
                        </Button>
                        <div className="min-w-[60px] text-center">
                          <span className="text-2xl font-bold text-foreground">{quantities[product.code]}</span>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="success"
                          onPress={() => handleIncrement(product.code)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
