"use client";

import { useEffect, useState } from "react";
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
  CheckCircle2,
  Trash2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductType } from "@/types/product";

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
        {
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
        },
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
          {
            headers: {
              Authorization: `Bearer ${user.jwt}`,
            },
          },
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
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
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
    <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-sky-950 uppercase italic">
            Perfil
          </h1>
          <p className="text-sky-600 font-bold flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-pulse" />
            Hola,{" "}
            {!isProfileComplete
              ? user.username
              : `${profileData.firstName} ${profileData.lastName || ""}`.trim()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="rounded-full border-sky-200 text-sky-800 font-black uppercase text-[10px] tracking-wider hover:bg-sky-50 transition-all shadow-sm"
            >
              <Settings2 className="w-4 h-4 mr-2" /> Editar Cuenta
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="ghost"
            className="rounded-full text-red-600 font-black uppercase text-[10px] tracking-wider hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="flex w-fit bg-slate-100/80 p-1 mb-10 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto">
          <TabsTrigger
            value="info"
            className="px-8 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <UserCircle size={16} /> Perfil
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="px-8 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <MapPin size={16} /> Direcciones
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="px-8 py-3 gap-2 font-black uppercase text-[11px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-md rounded-xl transition-all"
          >
            <Package size={16} /> Mis Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="info"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="shadow-2xl shadow-sky-100/50 border-none overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-gradient-to-br from-sky-50 to-white border-b border-sky-100 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="relative group">
                  <div className="absolute inset-0 bg-sky-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative bg-white p-2 rounded-full border-4 border-white shadow-xl">
                    <UserCircle className="w-24 h-24 text-sky-800" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <CardTitle className="text-3xl font-black text-sky-950 uppercase tracking-tighter italic">
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
                    value={`${profileData.firstName} ${profileData.lastName} ${
                      profileData.motherLastName || ""
                    }`.trim()}
                    icon={<User size={18} />}
                  />
                  <InfoBlock
                    label="Teléfono"
                    value={profileData.phone || "No asignado"}
                    icon={<Phone size={18} />}
                  />
                  <InfoBlock
                    label="Fecha de Nacimiento"
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
            <Link href="/profile/edit" className="md:col-span-2">
              <Button className="w-full md:w-fit rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase text-[10px] tracking-widest px-6 py-6 shadow-lg shadow-sky-200 transition-all">
                <Plus className="w-4 h-4 mr-2" /> Agregar Nueva Dirección
              </Button>
            </Link>

            {loadingAddresses ? (
              <div className="md:col-span-2 py-10 text-center">
                <Loader2 className="animate-spin mx-auto text-sky-500" />
              </div>
            ) : addresses.length > 0 ? (
              addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onDelete={() =>
                    handleDeleteAddress(addr.documentId || addr.id)
                  }
                />
              ))
            ) : (
              <div className="md:col-span-2 text-center py-10 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  No hay direcciones registradas
                </p>
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
                  className="h-28 w-full bg-slate-50 animate-pulse rounded-3xl border border-slate-100"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-4">
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

function AddressCard({
  address,
  onDelete,
}: {
  address: any;
  onDelete: () => void;
}) {
  const data = address.attributes || address;
  const targetId = address.documentId || address.id;

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 transition-all group bg-white p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <MapPin size={18} />
          </div>
          <span className="font-black text-sky-950 uppercase text-xs tracking-tighter italic">
            {data.alias || "Dirección"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {data.isDefault && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 mr-2">
              <CheckCircle2 size={10} /> Principal
            </span>
          )}
          <Link href={`/profile/edit?addressId=${targetId}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            >
              <Pencil size={14} />
            </Button>
          </Link>
          <Button
            onClick={onDelete}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
          {data.street}
        </p>
        <p className="text-[11px] text-slate-500 font-bold uppercase">
          {data.neighborhood}, {data.city}
        </p>
        <p className="text-[11px] text-slate-500 font-bold uppercase">
          {data.state}, CP {data.postalCode}
        </p>
      </div>
    </Card>
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

  const totalItems =
    data.products?.reduce(
      (acc: number, p: any) => acc + (p.quantity || 1),
      0,
    ) || 0;

  const handleReorder = async () => {
    if (!data.products || data.products.length === 0) return;

    setIsReordering(true);
    try {
      cart.removeAll();

      data.products.forEach((p: any) => {
        const productToCart: ProductType = {
          id: p.id,
          productName: p.productName || p.name || "Producto",
          price: Number(p.price || 0),
          slug: p.slug || "",
          code: p.code || "N/A",
          description: p.description || "",
          department: p.department || "",
          brand: p.brand || "N/A",
          images: p.images || { data: [] },
          productType: p.productType || "",
          series: p.series || "",
          subDepartment: p.subDepartment || "",
          stock: p.stock ?? 0,
          active: p.active ?? true,
          isFeatured: p.isFeatured ?? false,
        };

        cart.addItem(productToCart);
      });

      router.push("/cart");
    } catch (error) {
      console.error("Error al reordenar:", error);
      setIsReordering(false);
    }
  };

  return (
    <Card className="group hover:border-sky-300 transition-all duration-200 border-slate-200 overflow-hidden rounded-2xl shadow-sm bg-white">
      <div className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
        <div className="flex justify-between items-start lg:items-center lg:gap-6 lg:min-w-fit border-b lg:border-b-0 pb-3 lg:pb-0 border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Pedido
            </span>
            <span className="text-lg font-black text-sky-950 uppercase">
              #{order.id}
            </span>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5 uppercase">
              {dateValue}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full border font-black text-[10px] uppercase tracking-wider ${currentStatus.color}`}
          >
            {currentStatus.label}
          </span>
        </div>

        <div className="flex-1 space-y-2 lg:border-l lg:px-6 border-slate-100">
          <div className="flex flex-col gap-1.5">
            {data.products?.map((p: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-2 text-slate-700"
              >
                <span className="text-[11px] font-black text-sky-600 shrink-0">
                  {p.quantity || 1}x
                </span>
                <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">
                  {p.productName || p.name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
            Items: {totalItems}
          </p>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 mt-2 lg:mt-0 lg:pl-6 lg:border-l border-slate-100 bg-slate-50 lg:bg-transparent -m-5 p-5 lg:m-0 lg:p-0">
          <div className="text-left lg:text-right">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Total
            </span>
            <p className="text-xl font-black text-sky-900 tracking-tighter leading-none">
              {formatPrice(data.total)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleReorder}
              disabled={isReordering}
              variant="outline"
              className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-sky-200 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl transition-all shadow-sm bg-white"
            >
              {isReordering ? (
                <Loader2 className="animate-spin w-3 h-3" />
              ) : (
                "Reordenar"
              )}
            </Button>

            <Link href={`/profile/orders/${order.documentId || order.id}`}>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl hover:bg-sky-100 text-sky-600 border border-sky-100 lg:border-transparent transition-all"
              >
                <Printer size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Package size={32} className="text-slate-300" />
      </div>
      <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-2">
        Historial Vacío
      </p>
      <p className="text-slate-400 text-sm italic max-w-xs mx-auto">
        Las mejores refacciones te están esperando. Haz tu primer pedido hoy
        mismo.
      </p>
    </div>
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
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 group">
      <div className="text-sky-500 mb-4 bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-sky-950 uppercase truncate">
        {value || "---"}
      </p>
    </div>
  );
}

function NoProfileBox() {
  return (
    <div className="text-center py-12 px-6 rounded-[2.5rem] border-2 border-dashed border-sky-200 bg-sky-50/50">
      <AlertCircle size={40} className="mx-auto text-sky-400 mb-4" />
      <p className="text-sky-900 font-bold mb-6 italic">
        Tu perfil está incompleto. Agrega tus datos para agilizar tus compras.
      </p>
      <Link href="/profile/edit">
        <Button className="rounded-full bg-sky-800 hover:bg-sky-950 text-white font-black uppercase text-[10px] tracking-[0.2em] px-8 py-6 shadow-xl shadow-sky-900/20">
          Completar mis datos
        </Button>
      </Link>
    </div>
  );
}
