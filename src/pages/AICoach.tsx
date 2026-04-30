import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Paperclip, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import HealthSummary from "@/components/ai-coach/HealthSummary";
import { trackInteraction } from "@/hooks/useInteractionTracker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-lab-upload`;

const AICoach = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [labText, setLabText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({ title: "Sign in required", description: "Please sign in to upload labs.", variant: "destructive" });
        return;
      }
      const ext = file.name.split(".").pop() || "bin";
      const path = `${userData.user.id}/labs/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("lab-uploads").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ filePath: path, fileName: file.name, mimeType: file.type }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Parse failed");
      setLabText(json.parsedText || "");
      const preview = (json.parsedText || "").split("\n").slice(0, 4).join(" · ");
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `I've read your lab report **${file.name}**.\n\n${preview}${preview.length ? "\n\n" : ""}Want me to summarize the highlights?`,
      }]);
      toast({ title: "Lab report parsed", description: "Aria can now reference your results." });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    trackInteraction();

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...(labText ? [{ role: "system", content: `User's most recent uploaded lab report (parsed):\n\n${labText.slice(0, 4000)}` }] : []),
            ...allMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          model: "google/gemini-3-flash-preview",
          stream: true,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errText = resp.status === 429
          ? "Rate limit reached — please wait a moment and try again."
          : resp.status === 402
          ? "AI credits exhausted. Please top up in Settings."
          : "Something went wrong. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: errText }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-3 flex items-center gap-2.5 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <Sparkles className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-semibold">Your Health Coach</h1>
      </div>

      {/* Scrollable chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col justify-start min-h-full space-y-4">
          {messages.length === 0 && (
            <HealthSummary onAskCoach={send} onPopulateInput={(q) => setInput(q)} />
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-2.5"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className={msg.role === "assistant" ? "flex-1 min-w-0" : ""}>
                {msg.role === "assistant" && (
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Aria</p>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md ml-auto"
                    : "bg-muted/60 rounded-bl-md"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1 font-medium">Aria</p>
                <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-breathe" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-breathe" style={{ animationDelay: "0.3s" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-breathe" style={{ animationDelay: "0.6s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Input Bar */}
      <div className="sticky bottom-16 z-20 px-4 py-3 border-t border-border/40 bg-card/80 backdrop-blur-xl">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="relative flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
            title="Upload lab report (PDF or photo)"
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary disabled:opacity-30 flex-shrink-0"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </button>
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labText ? "Ask about your labs…" : "Ask your health coach..."}
              className="w-full bg-muted rounded-xl pl-4 pr-12 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none focus:ring-1 focus:ring-primary/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-primary disabled:opacity-30 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default AICoach;
