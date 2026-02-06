"use client";

import { useEffect, useState, useMemo } from "react";
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
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/addresses?filters[users_permissions_user][id][$eq]=${user.id}`,
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
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders?sort[0]=createdAt:desc`,
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

  const handleDeleteAddress = async (id: string | number) => {
    if (!user || !confirm("¿Estás seguro de eliminar esta dirección?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/addresses/${id}`,
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
      <div className="p-20 text-center animate-pulse italic text-sky-700 font-bold uppercase tracking-widest">
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-sky-950 uppercase italic">
            Mi perfil
          </h1>
          <p className="text-sky-600 font-bold flex items-center justify-center md:justify-start gap-2 text-sm">
            <span className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-pulse" />
            Hola,{" "}
            {!isProfileComplete
              ? user.username
              : `${profileData.firstName} ${profileData.lastName || ""} ${profileData.motherLastName || ""}`}
          </p>
        </div>
        <div className="flex justify-center md:justify-end gap-3">
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="rounded-full border-sky-200 text-sky-800 font-black uppercase text-[10px] tracking-wider px-6 shadow-sm hover:bg-sky-50"
            >
              <Settings2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Configuración</span>
              <span className="md:hidden">Editar</span>
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="ghost"
            className="rounded-full text-red-600 font-black uppercase text-[10px] tracking-wider px-6 hover:bg-red-50"
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
        <TabsList className="flex w-full md:w-fit bg-slate-100/80 p-1 mb-8 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="info"
            className="flex-1 md:flex-none px-6 md:px-10 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <UserCircle size={16} /> <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="flex-1 md:flex-none px-6 md:px-10 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <MapPin size={16} /> <span>Direcciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex-1 md:flex-none px-6 md:px-10 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <Package size={16} /> <span>Pedidos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="info"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="shadow-2xl shadow-sky-100/50 border-none overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
            <CardHeader className="bg-gradient-to-br from-sky-50 to-white border-b border-sky-100 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                <div className="relative bg-white p-2 rounded-full border-4 border-white shadow-xl">
                  <UserCircle className="w-16 h-16 md:w-24 md:h-24 text-sky-800" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <CardTitle className="text-2xl md:text-3xl font-black text-sky-950 uppercase tracking-tighter italic">
                      {user.username}
                    </CardTitle>
                    {profileData?.type === "b2b" && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Socio B2B
                      </span>
                    )}
                  </div>
                  <p className="text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full inline-block border border-sky-100 uppercase text-[10px] tracking-widest">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12 bg-white">
              {!isProfileComplete ? (
                <NoProfileBox />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoBlock
                    label="Nombre Completo"
                    value={`${profileData.firstName} ${profileData.lastName}`}
                    icon={<User size={18} />}
                  />
                  <InfoBlock
                    label="Teléfono de Contacto"
                    value={profileData.phone || "No asignado"}
                    icon={<Phone size={18} />}
                  />
                  <InfoBlock
                    label="Fecha Nacimiento"
                    value={profileData.birthDate || "No asignada"}
                    icon={<Calendar size={18} />}
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
              <Button className="w-full md:w-fit rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase text-[10px] tracking-widest px-8 py-7 shadow-lg shadow-sky-200 transition-all">
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
              <div className="md:col-span-2 text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 uppercase text-[10px] font-black text-slate-400">
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
                  className="h-32 w-full bg-slate-50 animate-pulse rounded-3xl border border-slate-100"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
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
        <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-100" />
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
                className={`h-3 w-3 md:h-4 md:w-4 rounded-full border-2 transition-all duration-500 ${isCompleted ? "bg-sky-600 border-white ring-4 ring-sky-50" : "bg-white border-slate-200"} ${isCurrent ? "scale-125 bg-sky-500 shadow-md shadow-sky-200" : ""}`}
              />
              <span
                className={`absolute -bottom-6 text-[7px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${isCompleted ? "text-sky-900" : "text-slate-300"}`}
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
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    pending: {
      label: "Pendiente",
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    shipped: {
      label: "En Camino",
      color: "bg-sky-50 text-sky-700 border-sky-100",
    },
    delivered: {
      label: "Entregado",
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-50 text-red-700 border-red-100",
    },
  };

  const currentStatus = statusMap[data.orderStatus] || {
    label: data.orderStatus,
    color: "bg-slate-50 text-slate-600",
  };

  const handleReorder = async () => {
    if (!data.products) return;
    setIsReordering(true);
    cart.removeAll();
    data.products.forEach((p: any) => cart.addItem({ ...p, id: p.id }));
    router.push("/cart");
  };

  return (
    <Card className="rounded-[2.5rem] border-slate-200 shadow-sm hover:border-sky-300 transition-all duration-300 overflow-hidden bg-white">
      <div className="p-6 md:p-8 space-y-6">
        {/* ID, Fecha y Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-sky-50 p-3 rounded-2xl">
              <Package className="text-sky-600" size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Pedido
              </span>
              <h3 className="text-2xl font-black text-sky-950 italic">
                #{order.id}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <p className="text-[11px] font-bold text-slate-500 uppercase">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
          {data.products?.map((p: any, i: number) => (
            <div
              key={i}
              className="flex gap-3 items-center text-[11px] font-bold uppercase text-slate-700"
            >
              <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-sky-600 font-black shrink-0">
                {p.quantity || 1}x
              </span>
              <span className="truncate">{p.productName || p.name}</span>
            </div>
          ))}
        </div>

        {/* PROGRESS STEPPER */}
        <OrderStepper currentStatus={data.orderStatus} />

        {/* FOOTER: Total & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total del Pedido
            </p>
            <p className="text-3xl font-black text-sky-950 tracking-tighter">
              {formatPrice(data.total)}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleReorder}
              disabled={isReordering}
              className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 hover:border-sky-500 hover:text-sky-600 text-[11px] font-black uppercase tracking-widest transition-all"
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

/* OTROS COMPONENTES SE MANTIENEN IGUAL PERO CON AJUSTES DE TEXTO */

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
      className={`relative overflow-hidden rounded-[2.5rem] p-6 md:p-8 border-2 transition-all ${isDefault ? "border-sky-400 shadow-xl shadow-sky-50" : "border-slate-100"}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${isDefault ? "bg-sky-600 text-white shadow-lg shadow-sky-100" : "bg-sky-50 text-sky-600"}`}
          >
            <MapPin size={20} />
          </div>
          <div>
            <span className="font-black uppercase text-sm tracking-tighter italic text-sky-950 block">
              {data.alias || "Dirección"}
            </span>
            {isDefault && (
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
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
              className="rounded-xl h-10 px-4 gap-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
            >
              <Pencil size={14} />{" "}
              <span className="text-[10px] font-black uppercase">Editar</span>
            </Button>
          </Link>
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="rounded-xl h-10 px-4 gap-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />{" "}
            <span className="text-[10px] font-black uppercase">Eliminar</span>
          </Button>
        </div>
      </div>
      <div className="space-y-1 font-bold uppercase text-slate-600">
        <p className="text-sm font-black text-sky-950">{data.street}</p>
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

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-5 hover:bg-white hover:shadow-xl hover:shadow-sky-500/5 transition-all group">
      <div className="bg-white p-4 rounded-2xl text-sky-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black text-sky-950 uppercase truncate">
          {value || "---"}
        </p>
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-24 px-6 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <Package size={48} className="mx-auto text-slate-300 mb-6" />
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
        No se encontraron pedidos
      </p>
      <p className="text-slate-400 text-sm italic">
        Comienza a explorar nuestro catálogo ahora.
      </p>
    </div>
  );
}

function NoProfileBox() {
  return (
    <div className="text-center py-16 px-6 rounded-[2.5rem] border-2 border-dashed border-sky-200 bg-sky-50/50">
      <AlertCircle size={40} className="mx-auto text-sky-400 mb-4" />
      <p className="text-sky-900 font-bold mb-8 italic">
        Información de perfil incompleta.
      </p>
      <Link href="/profile/edit">
        <Button className="rounded-full bg-sky-800 text-white font-black uppercase text-[10px] tracking-widest px-10 h-14 shadow-xl shadow-sky-900/20">
          Completar Datos
        </Button>
      </Link>
    </div>
  );
}
