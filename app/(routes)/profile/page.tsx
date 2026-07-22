"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/formatPrice";
import {
  User,
  Phone,
  Calendar,
  UserCircle,
  LogOut,
  Settings2,
  LayoutDashboard,
  Package,
  AlertCircle,
  Loader2,
  Printer,
  MapPin,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visibleOrders, setVisibleOrders] = useState(5);
  const ITEMS_PER_PAGE = 5;

  const activeTab = searchParams.get("tab") || "info";

  const sortedAddresses = useMemo(() => {
    if (!addresses) return [];
    return [...addresses].sort((a, b) => {
      const aDefault = a.attributes?.isDefault ?? a.isDefault;
      const bDefault = b.attributes?.isDefault ?? b.isDefault;
      return aDefault === bDefault ? 0 : aDefault ? -1 : 1;
    });
  }, [addresses]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchAddresses = async () => {
    if (!user || !user.jwt) return;
    setLoadingAddresses(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses?filters[users_permissions_user][id][$eq]=${user.id}`,
        { headers: { Authorization: `Bearer ${user.jwt}` } },
      );
      const { data } = await response.json();
      setAddresses(data || []);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.jwt) return;
      setLoadingOrders(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders?filters[user][id][$eq]=${user.id}&sort[0]=createdAt:desc&pagination[limit]=100`,
          { headers: { Authorization: `Bearer ${user.jwt}` } },
        );
        const { data } = await response.json();
        setOrders(data || []);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoadingOrders(false);
      }
      fetchAddresses();
    };
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = document.querySelector(
        '[data-state="active"][role="tab"]',
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLoadMore = () => {
    setVisibleOrders((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleDeleteAddress = async (id: string | number) => {
    if (!user || !confirm("¿Estás seguro de eliminar esta dirección?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.jwt}` },
        },
      );
      if (res.ok) {
        setAddresses((prev) =>
          prev.filter((addr) => (addr.documentId || addr.id) !== id),
        );
      }
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse italic text-sky-700 dark:text-sky-400 font-bold uppercase tracking-widest">
        Cargando perfil...
      </div>
    );
  if (!user) return null;

  const profileData = user.profile;
  const isProfileComplete = !!profileData?.firstName;

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-8 md:space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-sky-950 dark:text-sky-300 uppercase italic">
            Mi perfil
          </h1>
          <p className="text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center md:justify-start gap-2 text-sm">
            <span className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-pulse" />
            Hola,{" "}
            {!isProfileComplete
              ? user.username
              : `${profileData.firstName} ${profileData.lastName || ""} ${profileData.motherLastName || ""}`}
          </p>
        </div>
        <div className="flex justify-center md:justify-end gap-3">
          {user?.role?.name === "Admin" && (
            <Link href="/admin">
              <Button
                className="rounded-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-[#0071b1] dark:text-sky-400 font-black uppercase text-[10px] tracking-wider px-6 shadow-md hover:bg-sky-200 dark:hover:bg-sky-900/40 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
                <span className="md:hidden">Dashboard</span>
              </Button>
            </Link>
          )}
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="rounded-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-[#0071b1] dark:text-sky-400 font-black uppercase text-[10px] tracking-wider px-6 shadow-md hover:bg-sky-200 dark:hover:bg-sky-900/40 transition-colors"
            >
              <Settings2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Editar Perfil</span>
              <span className="md:hidden">Editar Perfil</span>
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="ghost"
            className="rounded-full text-red-600 dark:text-red-400 font-black uppercase text-[10px] tracking-wider px-6 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span>Salir</span>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="w-full mb-10 px-1">
          <TabsList className="grid grid-cols-3 gap-2 bg-transparent p-0 h-auto w-full border-none shadow-none overflow-visible">
            <TabsTrigger
              value="info"
              className="flex flex-col items-center justify-center py-4 px-2 gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-400 data-[state=active]:border-sky-300 dark:data-[state=active]:border-sky-700 data-[state=active]:shadow-xl data-[state=active]:ring-1 data-[state=active]:ring-sky-100 dark:data-[state=active]:ring-sky-900"
            >
              <UserCircle size={20} />
              <span className="font-black uppercase text-[9px] tracking-tighter">
                Perfil
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="addresses"
              className="flex flex-col items-center justify-center py-4 px-2 gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-400 data-[state=active]:border-sky-300 dark:data-[state=active]:border-sky-700 data-[state=active]:shadow-xl data-[state=active]:ring-1 data-[state=active]:ring-sky-100 dark:data-[state=active]:ring-sky-900"
            >
              <MapPin size={20} />
              <span className="font-black uppercase text-[9px] tracking-tighter">
                Direcciones
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="flex flex-col items-center justify-center py-4 px-2 gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-400 data-[state=active]:border-sky-300 dark:data-[state=active]:border-sky-700 data-[state=active]:shadow-xl data-[state=active]:ring-1 data-[state=active]:ring-sky-100 dark:data-[state=active]:ring-sky-900"
            >
              <Package size={20} />
              <span className="font-black uppercase text-[9px] tracking-tighter">
                Pedidos
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="info"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="shadow-2xl shadow-sky-100/50 dark:shadow-none border-none overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
            <CardHeader className="bg-gradient-to-br from-sky-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-sky-100 dark:border-slate-700 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                <div className="relative bg-white dark:bg-slate-800 p-2 rounded-full border-4 border-white dark:border-slate-700 shadow-xl">
                  <UserCircle className="w-16 h-16 md:w-24 md:h-24 text-sky-800 dark:text-sky-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <CardTitle className="text-2xl md:text-3xl font-black text-sky-950 dark:text-sky-300 uppercase tracking-tighter italic">
                      {user.username}
                    </CardTitle>
                    {profileData?.type === "b2b" && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Cliente Preferente
                      </span>
                    )}
                  </div>
                  <p className="text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/40 px-3 py-1 rounded-full inline-block border border-sky-100 dark:border-sky-900 uppercase text-[10px] tracking-widest">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12 bg-white dark:bg-slate-900">
              {!isProfileComplete ? (
                <NoProfileBox />
              ) : (
                <div className="divide-y divide-slate-300 dark:divide-slate-700">
                  <InfoRow label="Nombre(s)" value={profileData.firstName} />
                  <InfoRow label="Apellido Paterno" value={profileData.lastName} />
                  <InfoRow label="Apellido Materno" value={profileData.motherLastName} />
                  <InfoRow label="Teléfono" value={profileData.phone} />
                  <InfoRow
                    label="Fecha de nacimiento"
                    value={profileData.birthDate
                      ? (() => { const [y, m, d] = profileData.birthDate.split("T")[0].split("-"); return new Date(+y, +m - 1, +d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }); })()
                      : null}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="addresses"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/profile/edit?new=true" className="md:col-span-2">
              <Button className="w-full md:w-fit rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase text-[10px] tracking-widest px-8 py-7 shadow-lg shadow-sky-200 dark:shadow-none transition-all">
                <Plus className="w-4 h-4 mr-2" /> Agregar Nueva Dirección
              </Button>
            </Link>
            {loadingAddresses ? (
              <div className="md:col-span-2 py-10 text-center">
                <Loader2 className="animate-spin mx-auto text-sky-500" />
              </div>
            ) : sortedAddresses.length > 0 ? (
              sortedAddresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onDelete={() =>
                    handleDeleteAddress(addr.documentId || addr.id)
                  }
                />
              ))
            ) : (
              <div className="md:col-span-2 text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 uppercase text-[10px] font-black text-slate-400 dark:text-slate-500">
                No hay direcciones registradas
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="orders"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 w-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-3xl border border-slate-100 dark:border-slate-700"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.slice(0, visibleOrders).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}

              {visibleOrders < orders.length && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="rounded-2xl border-2 border-sky-100 dark:border-sky-800 text-sky-700 dark:text-sky-400 font-black uppercase text-[10px] tracking-widest px-10 py-6 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all shadow-sm"
                  >
                    Cargar pedidos anteriores
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyOrders />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderStepper({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { id: "pending", label: "Pendiente" },
    { id: "paid", label: "Pagado" },
    { id: "shipped", label: "En Camino" },
    { id: "delivered", label: "Entregado" },
  ];
  const currentIndex = steps.findIndex((s) => s.id === currentStatus);
  if (currentStatus === "cancelled") return null;

  return (
    <div className="w-full py-6 md:py-8 px-2 md:px-10">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-100 dark:bg-slate-700" />
        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-1000"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`h-3 w-3 md:h-4 md:w-4 rounded-full border-2 transition-all duration-500 ${isCompleted ? "bg-sky-600 border-white dark:border-slate-900 ring-4 ring-sky-50 dark:ring-sky-950/40" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"} ${isCurrent ? "scale-125 bg-sky-500 shadow-md shadow-sky-200 dark:shadow-none" : ""}`}
              />
              <span
                className={`absolute -bottom-6 text-[7px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${isCompleted ? "text-sky-900 dark:text-sky-400" : "text-slate-300 dark:text-slate-600"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const data = order.attributes || order;
  const cart = useCart();
  const [isReordering, setIsReordering] = useState(false);
  const router = useRouter();

  const dateValue = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "---";

  const statusMap: Record<string, { label: string; color: string }> = {
    paid: {
      label: "Pagado",
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
    },
    pending: {
      label: "Pendiente",
      color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900",
    },
    shipped: {
      label: "En Camino",
      color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900",
    },
    delivered: {
      label: "Entregado",
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900",
    },
  };

  const currentStatus = statusMap[data.orderStatus] || {
    label: data.orderStatus,
    color: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  };

  const handleReorder = async () => {
    if (!data.products) return;
    setIsReordering(true);
    cart.removeAll();
    data.products.forEach((p: any) => cart.addItem({ ...p, id: p.id }));
    router.push("/cart");
  };

  return (
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800">
      <div className="p-6 md:p-8 space-y-6">
        {/* ID, Fecha y Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-2xl">
              <Package className="text-sky-600 dark:text-sky-400" size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Pedido
              </span>
              <h3 className="text-2xl font-black text-sky-950 dark:text-sky-300 italic">
                #{order.id}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              {dateValue}
            </p>
            <span
              className={`px-4 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-widest ${currentStatus.color}`}
            >
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* PRODUCTS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
          {data.products?.map((p: any, i: number) => (
            <div
              key={i}
              className="flex gap-3 items-center text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300"
            >
              <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-sky-600 dark:text-sky-400 font-black shrink-0">
                {p.quantity || 1}x
              </span>
              <span className="truncate">{p.productName || p.name}</span>
            </div>
          ))}
        </div>

        {/* PROGRESS STEPPER */}
        <OrderStepper currentStatus={data.orderStatus} />

        {/* FOOTER: Total & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total del Pedido
            </p>
            <p className="text-3xl font-black text-sky-950 dark:text-sky-300 tracking-tighter">
              {formatPrice(data.total)}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleReorder}
              disabled={isReordering}
              className="flex-1 md:flex-none h-14 px-8 rounded-2xl
           bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-100 dark:border-sky-800 text-[#0055a4] dark:text-sky-400
           hover:bg-[#0055a4] hover:text-white hover:border-[#0055a4]
           text-[11px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              {isReordering ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Volver a Comprar"
              )}
            </Button>
            <Link
              href={`/profile/orders/${order.documentId || order.id}`}
              className="flex-none"
            >
              <Button className="h-14 px-6 rounded-2xl bg-sky-950 hover:bg-sky-700 text-white shadow-lg shadow-sky-100 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                <Printer size={18} />
                <span className="hidden md:inline">Imprimir</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AddressCard({
  address,
  onDelete,
}: {
  address: any;
  onDelete: () => void;
}) {
  const data = address.attributes || address;
  const targetId = address.documentId || address.id;
  const isDefault = data.isDefault;

  return (
    <Card
      className={`relative overflow-hidden rounded-[2.5rem] p-6 md:p-8 border-2 transition-all bg-white dark:bg-slate-800 ${isDefault ? "border-sky-400 dark:border-sky-600 shadow-xl shadow-sky-50 dark:shadow-none" : "border-slate-100 dark:border-slate-700"}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${isDefault ? "bg-sky-600 text-white shadow-lg shadow-sky-100 dark:shadow-none" : "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"}`}
          >
            <MapPin size={20} />
          </div>
          <div>
            <span className="font-black uppercase text-sm tracking-tighter italic text-sky-950 dark:text-sky-300 block">
              {data.alias || "Dirección"}
            </span>
            {isDefault && (
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Principal
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/profile/edit?addressId=${targetId}`}>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl h-10 px-4 gap-2 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            >
              <Pencil size={14} />{" "}
              <span className="text-[10px] font-black uppercase">Editar</span>
            </Button>
          </Link>
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="rounded-xl h-10 px-4 gap-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 size={14} />{" "}
            <span className="text-[10px] font-black uppercase">Eliminar</span>
          </Button>
        </div>
      </div>
      <div className="space-y-1 font-bold uppercase text-slate-600 dark:text-slate-300">
        <p className="text-sm font-black text-sky-950 dark:text-sky-300">{data.street}</p>
        <p className="text-xs">
          {data.neighborhood}, {data.city}
        </p>
        <p className="text-xs">
          {data.state}, CP {data.postalCode}
        </p>
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
        {label}
      </span>
      <span className={`text-sm font-semibold text-right ${value ? "text-slate-800 dark:text-slate-200" : "text-slate-300 dark:text-slate-600 italic"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-24 px-6 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
      <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
      <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
        No se encontraron pedidos
      </p>
      <p className="text-slate-400 dark:text-slate-500 text-sm italic">
        Comienza a explorar nuestro catálogo ahora.
      </p>
    </div>
  );
}

function NoProfileBox() {
  return (
    <div className="text-center py-16 px-6 rounded-[2.5rem] border-2 border-dashed border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20">
      <AlertCircle size={40} className="mx-auto text-sky-400 dark:text-sky-500 mb-4" />
      <p className="text-sky-900 dark:text-sky-300 font-bold mb-8 italic">
        Información de perfil incompleta.
      </p>
      <Link href="/profile/edit">
        <Button className="rounded-full bg-sky-800 text-white font-black uppercase text-[10px] tracking-widest px-10 h-14 shadow-xl shadow-sky-900/20 dark:shadow-none">
          Completar Datos
        </Button>
      </Link>
    </div>
  );
}
