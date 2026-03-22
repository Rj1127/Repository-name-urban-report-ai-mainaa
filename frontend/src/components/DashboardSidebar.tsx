import { User, FileText, Edit, Key, LogOut, LayoutDashboard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', action: () => navigate('/dashboard?tab=dashboard') },
    { icon: FileText, label: 'Report Civic Issues', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', action: () => navigate('/dashboard?tab=report') },
    { icon: FileText, label: 'Track application', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', action: () => navigate('/applications/sent') },
    { icon: Building2, label: 'Nearest Municipality', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', action: () => navigate('/municipality/nearest') },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-border/50 bg-secondary/10 shadow-inner h-[calc(100vh-64px)] overflow-y-auto sticky top-0 relative z-10">
      <div className="p-5 space-y-6 h-full flex flex-col">
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground mb-6 pl-2">Account</h3>
          <nav className="space-y-3">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-foreground/90 hover:text-foreground hover:bg-secondary/60 transition-all h-14 shadow-sm border border-transparent hover:border-border/40 rounded-xl"
                onClick={item.action}
              >
                <div className={`mr-2.5 shadow-sm rounded-lg p-2 ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="font-bold text-[15px]">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-border/50 mt-auto">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive h-11 font-bold"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
