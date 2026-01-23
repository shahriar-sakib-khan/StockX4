import { UserLayout } from '../components/layout/UserLayout';
import { useAuthStore } from '../features/auth/stores/auth.store';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <UserLayout>
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground">
            This is your dashboard. Access history and settings from the sidebar.
          </p>
          <div className="mt-4 p-4 bg-muted rounded border border-border font-mono text-sm text-primary inline-block">
             {JSON.stringify(user, null, 2)}
          </div>
        </div>
    </UserLayout>
  );
};
