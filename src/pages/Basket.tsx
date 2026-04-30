import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Basket = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col items-center justify-center gap-4 px-6">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-display font-semibold">Your basket is empty</h2>
        <p className="text-sm text-muted-foreground text-center">Browse our shop and add items to get started.</p>
        <Button onClick={() => navigate("/shop")} className="mt-2">Continue Shopping</Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/shop")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Basket ({itemCount})</h1>
      </div>

      <div className="px-6 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.price}</p>
              </div>
              <button onClick={() => removeItem(item.name)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                <button onClick={() => updateQuantity(item.name, item.quantity - 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.name, item.quantity + 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-6">
        <div className="glass-card p-4 flex justify-between items-center">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-display font-bold text-primary">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="px-6 mt-4 flex flex-col gap-2">
        <Button onClick={() => navigate("/checkout")} className="w-full">Proceed to Checkout</Button>
        <Button variant="outline" onClick={() => navigate("/shop")} className="w-full">Continue Shopping</Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Basket;