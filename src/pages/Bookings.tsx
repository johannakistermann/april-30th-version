import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const BOOKING_TYPES = [
  { title: "AI Coach Session", description: "1-on-1 bioenergetic coaching session with our AI", icon: Sparkles, duration: "30 min", color: "text-primary", bg: "bg-primary/10" },
  { title: "Lightbed Session", description: "NES Lightbed phototherapy for deep cellular repair", icon: Sun, duration: "45 min", color: "text-warning", bg: "bg-warning/10" },
  { title: "Clinic Appointment", description: "In-person session with a certified practitioner", icon: Users, duration: "60 min", color: "text-info", bg: "bg-info/10" },
];

const UPCOMING = [
  { title: "Lightbed Session", date: "Feb 18, 2026", time: "10:30 AM", location: "E4L Clinic, Austin TX" },
  { title: "Coach Follow-up", date: "Feb 22, 2026", time: "2:00 PM", location: "Virtual" },
];

const Bookings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Bookings</h1>
          <p className="text-[10px] text-muted-foreground">Coach, Lightbed & clinic appointments</p>
        </div>
      </div>

      {/* Book New */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Book a Session</h2>
        <div className="space-y-3">
          {BOOKING_TYPES.map((type) => (
            <button key={type.title} className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors">
              <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center`}>
                <type.icon className={`w-5 h-5 ${type.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-medium">{type.title}</p>
                <p className="text-[10px] text-muted-foreground">{type.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {type.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-6">
        <h2 className="text-sm font-display font-semibold mb-3">Upcoming</h2>
        {UPCOMING.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {UPCOMING.map((booking, i) => (
              <div key={i} className="glass-card p-4">
                <p className="text-sm font-display font-medium">{booking.title}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />{booking.location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Bookings;
