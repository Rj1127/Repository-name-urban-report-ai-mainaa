import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export default function KpiCard({ title, value, icon: Icon, color }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="border-border/30 bg-card/50 shadow-card transition-all duration-300 hover:shadow-glow">
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`flex h-13 w-13 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
