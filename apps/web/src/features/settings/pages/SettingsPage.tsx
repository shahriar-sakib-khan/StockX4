import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAuth } from '@/features/auth/hooks/useAuth';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const { deleteAccount } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
        Settings
        <InfoTooltip content="Configure your account settings and preferences." />
      </h1>

      <div className="bg-card border border-border rounded-xl p-5 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Account Preferences</h2>
          <p className="text-sm sm:text-base text-muted-foreground">General settings will go here (Notifications, Theme, etc).</p>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-destructive mb-3 sm:mb-4 flex items-center">
              <Trash2 className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> Danger Zone
          </h2>
          <p className="text-sm sm:text-base text-destructive/80 mb-5 sm:mb-6">
              Permanently delete your account and all of your content. This action cannot be undone.
          </p>
          <Button
              onClick={() => setIsDeleteModalOpen(true)}
              variant="destructive"
              className="font-medium shadow-sm w-full sm:w-auto min-h-[48px] sm:min-h-0"
          >
              Delete Account
          </Button>
      </div>

      <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
              deleteAccount();
              setIsDeleteModalOpen(false);
          }}
          title="Delete Account?"
          description={(
              <p>
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
              </p>
          )}
          confirmLabel="Delete Account"
      />
    </div>
  );
};
