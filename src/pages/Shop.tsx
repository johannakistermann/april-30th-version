import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Gem, Zap, Droplets, Package, ShoppingCart, Users } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";

const CATEGORIES = [
  { title: "GEM", slug: "gem", icon: Gem, description: "The ultimate bioenergetic system for cellular resonance and balance" },
  { title: "miHealth", slug: "mihealth", icon: Zap, description: "Targeted biofeedback for immediate physical relief" },
  { title: "Feel Good Infoceuticals", slug: "feel-good", icon: Droplets, description: "Specific energetic support for daily emotional and physical stressors" },
  { title: "Infoceutical Packages", slug: "packages", icon: Package, description: "Curated sets designed by experts for specific wellness journeys" },
];

const Shop = () => {
  const navigate = useNavigate();
  const { itemCount, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Shop</h1>
          <p className="text-[10px] text-muted-foreground">Devices, supplements & education</p>
        </div>
      </div>

      {itemCount > 0 && (
        <div className="px-6 mb-4">
          <button
            onClick={() => navigate("/basket")}
            className="w-full flex items-center justify-between rounded-2xl bg-primary text-primary-foreground py-3 px-5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-semibold">View Basket ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            </div>
            <span className="text-sm font-bold">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className="px-6 space-y-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => navigate(`/shop/${cat.slug}`)}
            className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <cat.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{cat.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{cat.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <div className="glass-card p-6 space-y-4 text-center mt-4">
          <Users className="w-7 h-7 mx-auto text-primary" />
          <h3 className="text-sm font-display font-semibold">Become a Coach</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Join our global network of E4L Coaches and help others transform their energy and wellbeing.
          </p>
          <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2.5 px-4 text-sm font-medium">
            Join Now
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Shop;