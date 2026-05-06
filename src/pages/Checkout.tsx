import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  const handlePlaceOrder = () => {
    if (!form.name || !form.email || !form.address) {
      toast({ title: "Missing information", description: "Please fill in all fields." });
      return;
    }
    clearCart();
    toast({ title: "Order placed!", description: "Thank you for your order. We'll be in touch soon." });
    navigate("/shop");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <h2 className="text-lg font-display font-semibold">No items to checkout</h2>
        <Button onClick={() => navigate("/shop")}>Go to Shop</Button>
      </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/basket")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Checkout</h1>
      </div>

      <div className="px-6 space-y-4">
        <div className="glass-card p-4">
          <h2 className="text-sm font-medium mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.name} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span className="font-medium">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-display font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h2 className="text-sm font-medium">Shipping Information</h2>
          <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Shipping Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <Button onClick={handlePlaceOrder} className="w-full">Place Order</Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Checkout;