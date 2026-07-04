"use client";
import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useFavouritesStore } from "@/store/favourites";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/auth.store";
import type { User } from "@/types/auth";
import { useCartStore } from "@/store/cart";
import { MenuCategoryNav } from "@/features/menu/components/MenuCategoryNav";
import {
  MenuSections,
  buildMenuSections,
  sectionDomId,
  ALL_SECTION_ID
} from "@/features/menu/components/MenuSections";
import { ProductList } from "@/features/menu/components/ProductList";
import { CartDrawer } from "@/features/menu/components/CartDrawer";
import { MenuHeader } from "@/features/menu/components/MenuHeader";
import { MiniCartStrip } from "@/features/menu/components/MiniCartStrip";
import { CartBottomBar } from "@/features/menu/components/CartBottomBar";
import { SearchBar } from "@/features/menu/components/SearchBar";
import { RestaurantBanner } from "@/features/menu/components/RestaurantBanner";
import { AddToOrderBanner } from "@/features/menu/components/AddToOrderBanner";
import { ActiveOrderRecoveryBanner } from "@/features/menu/components/ActiveOrderRecoveryBanner";
import { FavouritesRail } from "@/features/menu/components/FavouritesRail";
import { OrderSummary } from "@/features/menu/components/OrderSummary";
import { TableConfirmModal } from "@/features/menu/components/TableConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import type { Product, Combo, ComboRaw, Category } from "@/types/product";

// Canh (soup) is never a normal menu card — it is chosen only via the OrderSummary
// stepper, which the stall always serves with any order (individual dishes or combo).
const isSoupName = (name: string) =>
  name.toLowerCase().includes("canh") || name.toLowerCase().includes("nước dùng");

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToOrderId = searchParams.get("add_to_order") ?? undefined;
  const [activeSection, setActiveSection] = useState<string>(ALL_SECTION_ID);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [canhShakeKey, setCanhShakeKey] = useState(0);

  const { tableId, items } = useCartStore();

  // Anonymous online flow: no table + not authenticated → auto-mint an online-guest
  // token so the visitor can add items and reach /checkout to place a source=online
  // order without being bounced to /login. Runs once (guarded by mintedRef).
  const mintedRef = useRef(false);
  useEffect(() => {
    if (tableId) return; // QR/table guests already authenticate via /auth/guest
    if (useAuthStore.getState().accessToken) return; // already authenticated
    if (mintedRef.current) return;
    mintedRef.current = true;
    api
      .post("/auth/guest/online")
      .then((res) => {
        const guestUser: User = {
          id: "",
          username: "guest",
          full_name: "Khách online",
          role: "customer",
          is_active: true
        };
        useAuthStore.getState().setAuth(guestUser, res.data.data.access_token);
      })
      .catch(() => {
        mintedRef.current = false; // allow retry on a later render
      });
  }, [tableId]);

  // Canh is always required: any order must have at least 1 bowl before checkout.
  // Canh lives as CartItems with ids starting 'canh_*'; missing = no such item in the cart.
  const canhMissing = !items.some((i) => i.id.startsWith("canh_"));
  const { items: favItems } = useFavouritesStore();

  const handleCheckout = () => {
    if (canhMissing) {
      setCanhShakeKey((k) => k + 1);
      toast.error("Vui lòng chọn số bát canh trước khi thanh toán");
      return;
    }
    tableId ? setConfirmOpen(true) : router.push("/checkout");
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000
  });

  // All products (unfiltered) for combo item name lookup + FavouritesRail
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products-all"],
    queryFn: () => api.get("/products").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    isError,
    refetch
  } = useQuery<Product[]>({
    queryKey: ["products", searchQuery],
    queryFn: () =>
      api
        .get("/products", {
          params: {
            ...(searchQuery.length >= 2 && { search: searchQuery }),
            is_available: true
          }
        })
        .then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    enabled: searchQuery.length === 0 || searchQuery.length >= 2
  });

  const { data: rawCombos = [] } = useQuery<ComboRaw[]>({
    queryKey: ["combos"],
    queryFn: () => api.get("/combos").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000
  });

  // Enrich combos: map combo_items → items with product_name + unit_price resolved
  const combos = useMemo<Combo[]>(() => {
    const productMap = new Map(
      allProducts.map((p) => [
        p.id,
        { name: p.name, price: p.price, toppings: p.toppings }
      ])
    );
    return rawCombos.map((raw) => ({
      id: raw.id,
      category_id: raw.category_id,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      image_path: raw.image_path,
      sort_order: raw.sort_order,
      is_available: raw.is_available,
      items: (raw.combo_items ?? []).map((ci) => ({
        product_id: ci.product_id,
        product_name: productMap.get(ci.product_id)?.name ?? ci.product_id,
        unit_price: productMap.get(ci.product_id)?.price,
        quantity: ci.quantity,
        toppings: productMap.get(ci.product_id)?.toppings ?? []
      }))
    }));
  }, [rawCombos, allProducts]);

  // Canh is stepper-only: keep its products out of the browsable menu (cards + search),
  // and resolve the two real canh products (có rau / không rau) for the OrderSummary stepper.
  const menuProducts = useMemo(
    () => products.filter((p) => !isSoupName(p.name)),
    [products]
  );
  const canhProducts = useMemo(
    () => allProducts.filter((p) => isSoupName(p.name)),
    [allProducts]
  );
  const canhKhongRau =
    canhProducts.find((p) => p.name.toLowerCase().includes("không")) ?? null;
  const canhCoRau =
    canhProducts.find((p) => p !== canhKhongRau) ?? null;

  // Search overrides the scroll-spy sections: a query shows a flat filtered list
  // (no tabs / favourites rail); clearing it restores the full sectioned menu.
  const searching = searchQuery.length >= 2;
  const showFavs = !searching && favItems.length > 0;

  const sections = useMemo(
    () => buildMenuSections(menuProducts, combos, categories),
    [menuProducts, combos, categories]
  );
  const tabSections = useMemo(
    () => [{ id: ALL_SECTION_ID, label: "Tất cả" }, ...sections],
    [sections]
  );

  const scrollToSection = (id: string) => {
    document
      .getElementById(sectionDomId(id))
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewSummary = () =>
    document
      .getElementById("order-summary")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background">
      {/* Zone A — Header */}
      <MenuHeader />

      {/* Mini cart strip — sticky, shows when cart has items */}
      {/* <MiniCartStrip onClick={() => setCartOpen(true)} /> */}

      {/* Restaurant banner */}
      <RestaurantBanner />

      {/* Add-to-order mode banner (explicit: arrived via ?add_to_order=) */}
      {/* <AddToOrderBanner
        orderId={addToOrderId}
        onViewOrder={() => router.push(`/order/${addToOrderId}`)}
      /> */}

      {/* Recovery banner: persisted active order, but NOT in explicit add-to-order mode.
          Lets the customer resume their live order after navigating away (no QR re-scan). */}
      {/* <ActiveOrderRecoveryBanner suppressed={!!addToOrderId} /> */}

      {/* Zone B — SearchBar */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Zone C — MenuCategoryNav (scroll-spy nav; hidden while searching) */}
      {!searching && sections.length > 0 && (
        <MenuCategoryNav
          sections={tabSections}
          activeId={activeSection}
          onSelect={scrollToSection}
        />
      )}

      {/* Zone D — FavouritesRail */}
      {showFavs && <FavouritesRail products={allProducts} combos={combos} />}

      {/* Content */}
      <main className="px-4 py-4 pb-40">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-muted-fg text-sm">⚠ Kết nối mạng yếu</p>
            <Button
              onClick={() => refetch()}
              size="lg"
              className="min-h-[44px]"
            >
              Thử lại
            </Button>
          </div>
        ) : loadingProducts ? (
          <>
            {/* Mobile skeleton — 1 col */}
            <div className="flex flex-col gap-3 sm:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl h-24 animate-pulse"
                />
              ))}
            </div>
            {/* Tablet / Desktop skeleton — responsive grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl aspect-square animate-pulse"
                />
              ))}
            </div>
          </>
        ) : searching ? (
          menuProducts.length === 0 ? (
            <EmptyState message="Không tìm thấy món nào · Thử từ khóa khác nhé!" />
          ) : (
            <ProductList products={menuProducts} withComboHeading={false} />
          )
        ) : menuProducts.length === 0 && combos.length === 0 ? (
          <EmptyState message="Không có món nào trong danh mục này" />
        ) : (
          /* Zone E + F — all sections render; MenuCategoryNav scroll-spies them */
          <MenuSections
            products={menuProducts}
            combos={combos}
            sections={sections}
            onActiveChange={setActiveSection}
          />
        )}

        {/* Zone I — OrderSummary (includes note) */}
        <div id="order-summary">
          <OrderSummary
            shakeKey={canhShakeKey}
            canhCoRau={canhCoRau}
            canhKhongRau={canhKhongRau}
          />
        </div>
      </main>

      {/* Zone J — CartBottomBar */}
      <CartBottomBar
        dimmed={canhMissing}
        onCheckout={handleCheckout}
        onViewSummary={handleViewSummary}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        addToOrderId={addToOrderId}
        onTableCheckout={() => setConfirmOpen(true)}
      />

      {confirmOpen && (
        <TableConfirmModal onClose={() => setConfirmOpen(false)} />
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  );
}
