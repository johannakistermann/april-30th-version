import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import BottomNav from "@/components/BottomNav";

const productsByCategory: Record<string, { name: string; price: string; description: string }[]> = {
  gem: [
    { name: "GEM Device", price: "$397", description: "The complete GEM bioenergetic scanning and correction device." },
    { name: "GEM Protect Subscription (Monthly)", price: "$24/mo", description: "Monthly access to GEM Protect features and updates." },
    { name: "GEM Protect Subscription (Yearly)", price: "$240/yr", description: "Annual access to GEM Protect — save $48 per year." },
  ],
  mihealth: [
    { name: "miHealth Device", price: "$5,000", description: "Handheld biofeedback device for targeted physical relief." },
  ],
  "feel-good": [
    { name: "Biocell Infoceutical", price: "$30", description: "Supports cellular health and regeneration." },
    { name: "CFI (ET-6) – Cold Flu Immunity", price: "$30", description: "Supports immune response during cold and flu season." },
    { name: "Chill (ES-8)", price: "$30", description: "Promotes calm and relaxation in stressful moments." },
    { name: "Day Infoceutical", price: "$30", description: "Optimizes daytime energy and alertness." },
    { name: "EMF – Electromagnetic Field", price: "$30", description: "Helps protect against electromagnetic field exposure." },
    { name: "Energy", price: "$30", description: "Supports overall energy and vitality throughout the day." },
    { name: "ESR – Emotional Stress Release", price: "$30", description: "Helps calm the mind and body from emotional stress." },
    { name: "Fat Metabolism", price: "$30", description: "Supports healthy fat metabolism and weight management." },
    { name: "Female (ES-12)", price: "$30", description: "Supports feminine hormonal balance and wellbeing." },
    { name: "Heart Driver (ED6)", price: "$30", description: "Supports heart energy and cardiovascular function." },
    { name: "Heart Imprinter (ED2)", price: "$30", description: "Supports emotional heart coherence and balance." },
    { name: "Male (ES-11)", price: "$30", description: "Supports masculine hormonal balance and wellbeing." },
    { name: "MB-7 Peace", price: "$30", description: "Promotes inner peace and mental tranquility." },
    { name: "MB-8 Love", price: "$30", description: "Nurtures heart-centered energy and emotional openness." },
    { name: "Nerve Driver (ED4)", price: "$30", description: "Supports nervous system function and resilience." },
    { name: "Night Infoceutical", price: "$30", description: "Promotes restful sleep and healthy circadian rhythm." },
    { name: "Polarity", price: "$30", description: "Helps correct body polarity and energy alignment." },
    { name: "Rejuv – Rejuvenation", price: "$30", description: "Supports cellular rejuvenation and anti-aging." },
    { name: "Sleep", price: "$30", description: "Promotes deep, restorative sleep." },
    { name: "Youth", price: "$30", description: "Supports youthful vitality and cellular renewal." },
  ],
  packages: [
    { name: "Mental Clarity - Bye Bye Brain Fog", price: "$90", description: "Support mental sharpness and clear thinking." },
    { name: "Energy - Get Up & Go!", price: "$90", description: "Boost your natural energy levels throughout the day." },
    { name: "Immunity - Supermunity", price: "$90", description: "Strengthen your body's natural immune defenses." },
    { name: "Sleep - Night Cap", price: "$90", description: "Promote deep, restful sleep and healthy sleep cycles." },
    { name: "Weight Loss - New Year's Resolutions", price: "$90", description: "Support healthy metabolism and weight management." },
    { name: "Travel - Anchors Away", price: "$90", description: "Stay balanced and energized while traveling." },
    { name: "Digestion - Keep It Moving", price: "$90", description: "Support healthy digestion and gut function." },
    { name: "Detox - Purify", price: "$90", description: "Support your body's natural detoxification pathways." },
    { name: "Anti-Aging - Forever Young - Youth 4 Me", price: "$90", description: "A curated set of infoceuticals for cellular rejuvenation." },
    { name: "Stress Relief - You Can Do It!", price: "$90", description: "Targeted support for managing everyday stress." },
    { name: "Female Balance", price: "$90", description: "Support hormonal balance and feminine wellbeing." },
    { name: "Male Balance", price: "$90", description: "Support hormonal balance and masculine wellbeing." },
    { name: "Emotional Balance & Love Bundle", price: "$90", description: "Nurture emotional harmony and heart-centered energy." },
  ],
};

const categoryTitles: Record<string, string> = {
  gem: "GEM",
  mihealth: "miHealth",
  "feel-good": "Feel Good Infoceuticals",
  packages: "Infoceutical Packages",
};

const ShopCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { addItem, itemCount, totalPrice } = useCart();
  const products = productsByCategory[category || ""] || [];
  const title = categoryTitles[category || ""] || "Products";

  const handleAddToBasket = (product: { name: string; price: string; description: string }) => {
    addItem(product);
    toast({ title: "Added to basket", description: `${product.name} has been added to your basket.` });
  };

  return (
    <div className={`min-h-screen bg-background ${itemCount > 0 ? "pb-36" : "pb-24"}`}>
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/shop")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">{title}</h1>
      </div>

      <div className="px-6 space-y-3">
        {products.map((product) => (
          <div key={product.name} className="glass-card p-4">
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{product.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-display font-bold text-primary">{product.price}</span>
              <button
                onClick={() => handleAddToBasket(product)}
                className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground py-1.5 px-3 text-xs font-medium"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Basket
              </button>
            </div>
          </div>
        ))}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-6 pb-3">
          <button
            onClick={() => navigate("/basket")}
            className="w-full flex items-center justify-between rounded-2xl bg-primary text-primary-foreground py-4 px-5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-semibold">View Basket ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            </div>
            <span className="text-sm font-bold">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ShopCategory;