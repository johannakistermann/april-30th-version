import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, ThumbsUp, Users } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const THREADS = [
  { author: "Sarah M.", time: "2h ago", title: "Anyone tried the ED3 Cell Driver for chronic fatigue?", replies: 12, likes: 24 },
  { author: "James K.", time: "5h ago", title: "My 30-day GEM Wearable results — incredible HRV improvement", replies: 8, likes: 31 },
  { author: "Dr. Anna L.", time: "1d ago", title: "miHealth protocol for lower back pain — what's working for you?", replies: 15, likes: 19 },
  { author: "Mike T.", time: "2d ago", title: "Premier Research Labs Max B-ND vs standard B vitamins", replies: 6, likes: 11 },
  { author: "Dana P.", time: "3d ago", title: "Lightbed session tips for first-timers", replies: 9, likes: 16 },
];

const Community = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Community</h1>
          <p className="text-[10px] text-muted-foreground">Discussions & support</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-lg font-display font-bold">2.4k</p>
            <p className="text-[10px] text-muted-foreground">Members</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-display font-bold">142</p>
            <p className="text-[10px] text-muted-foreground">Active Today</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-display font-bold">38</p>
            <p className="text-[10px] text-muted-foreground">New Posts</p>
          </div>
        </div>
      </div>

      {/* Discussion Threads */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-semibold">Recent Discussions</h2>
        {THREADS.map((thread, i) => (
          <button key={i} className="glass-card p-4 w-full text-left hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-display font-medium">{thread.author}</span>
              <span className="text-[10px] text-muted-foreground">· {thread.time}</span>
            </div>
            <p className="text-sm font-medium leading-snug mb-2">{thread.title}</p>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{thread.replies}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
