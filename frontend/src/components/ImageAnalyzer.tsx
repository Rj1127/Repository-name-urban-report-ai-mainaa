import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, CheckCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { IssueType } from '@/types/database';

interface Props {
  onAnalysisComplete: (result: {
    issueType: IssueType | string;
    confidence: number;
    description: string;
    imageUrl: string;
  }) => void;
}

export default function ImageAnalyzer({ onAnalysisComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [rejected, setRejected] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setRejected(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const analyzeImage = async () => {
    if (!file || !preview) return;
    setAnalyzing(true);
    setRejected(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/complaints/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: preview })
      });

      const data = await res.json();

      if (!res.ok) {
        setRejected(data.error || "Failed to analyze image with AI.");
        setAnalyzing(false);
        return;
      }

      if (data.issueType === 'other' || data.confidence < 0.5) {
        setRejected('Deep Analysis Warning: Image lacks clear evidence of a civic issue. Please upload a clearer photograph.');
        setAnalyzing(false);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setResult(data);
      onAnalysisComplete({ ...data, imageUrl });
      setAnalyzing(false);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Network error during deep AI analysis.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {preview ? (
          <div className="group relative overflow-hidden rounded-xl border border-border/50 shadow-card">
            <img src={preview} alt="Issue preview" className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        ) : (
          <label className="flex h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/20 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-glow group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 transition-colors group-hover:bg-primary/20"
            >
              <Camera className="h-10 w-10 text-primary" />
            </motion.div>
            <span className="text-base font-bold text-foreground">Upload Issue Evidence</span>
            <span className="mt-1.5 text-xs text-muted-foreground font-medium">UrbanShield AI will detect the problem automatically</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        )}
      </div>

      {preview && !result && !rejected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={analyzeImage} disabled={analyzing} className="w-full h-14 gradient-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all duration-300 hover:shadow-glow translate-y-2">
            {analyzing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing Environment…</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />Generate AI Report</>
            )}
          </Button>
        </motion.div>
      )}

      {preview && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setPreview(null); setFile(null); setResult(null); setRejected(null); }}
          className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors pt-4"
        >
          Choose Different Image
        </Button>
      )}
    </div>
  );
}
