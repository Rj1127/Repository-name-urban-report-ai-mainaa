import { User, FileText, Edit, Key, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const menuItems = [
    { icon: User, label: 'Personal Details', action: () => toast.info('Personal Details feature coming soon.') },
    { icon: FileText, label: 'Sent Application', action: () => toast.info('Sent Application feature coming soon.') },
    { icon: Edit, label: 'Modify Application', action: () => toast.info('Modify Application feature coming soon.') },
    { icon: Key, label: 'Forgotten Password', action: () => toast.info('Password Reset feature coming soon.') },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-border/50 bg-secondary/10 shadow-inner h-[calc(100vh-64px)] overflow-y-auto sticky top-0 relative z-10">
      <div className="p-5 space-y-6 h-full flex flex-col">
        <div className="flex-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2 opacity-70">Account Nav</h3>
          <nav className="space-y-1.5">
            {menuItems.map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="w-full justify-start text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors h-11"
                onClick={item.action}
              >
                <item.icon className="mr-3 h-[18px] w-[18px]" />
                <span className="font-semibold text-sm">{item.label}</span>
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
