import { useSettings, useUpdateSettings } from '@/hooks/use-wa';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Loader2, Save, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function SettingsDialog() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const [open, setOpen] = useState(false);
  
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('');

  // Sync state when data loads
  useEffect(() => {
    if (settings) {
      setAutoReplyEnabled(settings.autoReplyEnabled);
      setAutoReplyMessage(settings.autoReplyMessage);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(
      { 
        autoReplyEnabled, 
        autoReplyMessage 
      },
      {
        onSuccess: () => {
          toast({ title: "Settings saved", description: "Your auto-reply preferences have been updated." });
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Bot className="w-6 h-6 text-primary" />
            Bot Settings
          </DialogTitle>
          <DialogDescription>
            Configure how your bot handles incoming messages automatically.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-xl bg-secondary/20">
              <Label htmlFor="auto-reply" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-semibold">Auto Reply</span>
                <span className="font-normal text-xs text-muted-foreground">Automatically respond to new messages</span>
              </Label>
              <Switch
                id="auto-reply"
                checked={autoReplyEnabled}
                onCheckedChange={setAutoReplyEnabled}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Auto Reply Message</Label>
              <Textarea
                id="message"
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
                className="min-h-[100px] resize-none rounded-xl focus-visible:ring-primary/20"
                placeholder="Hello! I am currently away..."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={isPending} className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
