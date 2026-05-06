import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Play, Clock, Lock, Heart, Headphones, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const SELF_HEALTH = [
  { title: "What is Your Body-Field?", emoji: "🚀", video: true },
  { title: "How the GEM Reads Your Energy", emoji: "💎", video: true },
  { title: "TCM & the Five Elements Explained", emoji: "🔥", video: true },
  { title: "Understanding Biosignatures", emoji: "🔬", video: false },
  { title: "Mastering Your Health with FIELD", emoji: "⚡", video: true },
  { title: "The Science of Infoceuticals", emoji: "🧪", video: true },
  { title: "Emotional Freedom & NES Health", emoji: "💖", video: false },
  { title: "Your Circadian Rhythm & Energy", emoji: "🌙", video: true },
];

const MEDITATIONS = [
  { title: "Morning Energy Activation", emoji: "🌅", duration: "10 min" },
  { title: "Heart Coherence Breathing", emoji: "💚", duration: "8 min" },
  { title: "Five Element Balance", emoji: "🐢", duration: "15 min" },
  { title: "Deep Sleep Preparation", emoji: "🌙", duration: "20 min" },
  { title: "Stress Release & Grounding", emoji: "🌿", duration: "12 min" },
  { title: "Chakra Alignment Flow", emoji: "🔮", duration: "18 min" },
];

const Learn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Learn</h1>
          <p className="text-[10px] text-muted-foreground">Master your energy, health & life</p>
        </div>
      </div>

      <Tabs defaultValue="self-health" className="px-6">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="self-health" className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Heart className="w-3.5 h-3.5" /> Self-Health
          </TabsTrigger>
          <TabsTrigger value="meditations" className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Headphones className="w-3.5 h-3.5" /> Meditations
          </TabsTrigger>
          <TabsTrigger value="gist" className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GraduationCap className="w-3.5 h-3.5" /> GIST Course
          </TabsTrigger>
        </TabsList>

        <TabsContent value="self-health" className="space-y-2">
          {SELF_HEALTH.map((item) => (
            <button key={item.title} className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                {item.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                {item.video && (
                  <p className="text-[10px] text-primary mt-0.5 flex items-center gap-1">
                    <Play className="w-2.5 h-2.5" /> Video included
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </TabsContent>

        <TabsContent value="meditations" className="space-y-2">
          {MEDITATIONS.map((item) => (
            <button key={item.title} className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                {item.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {item.duration}
                </p>
              </div>
              <Play className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </TabsContent>

        <TabsContent value="gist" className="mt-4">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <Lock className="w-10 h-10 text-muted-foreground mb-4" />
            <h2 className="text-lg font-display font-semibold mb-2">GIST Course</h2>
            <p className="text-xs text-muted-foreground max-w-md mb-4">
              The complete guide to understanding and mastering your body-field, energy systems, and holistic health through the NES Health framework.
            </p>
            <p className="text-sm font-semibold mb-1">Course Locked</p>
            <p className="text-[10px] text-muted-foreground mb-4">Purchase the GIST course to unlock all modules</p>
            <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-display font-semibold hover:opacity-90 transition-opacity">
              Purchase Course
            </button>
          </div>
        </TabsContent>
      </Tabs>

      </div>
      <BottomNav />
    </div>
  );
};

export default Learn;
