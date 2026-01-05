import { useSocket } from '@/hooks/use-socket';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Loader2, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const { status, qr } = useSocket();

  console.log('Login component state:', { status, hasQR: !!qr, qrLength: qr?.length });

  return (
    <div className="min-h-screen w-full bg-[#111b21] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-32 bg-[#00a884] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl z-10 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[600px]"
      >
        {/* Left Side: Instructions */}
        <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8 text-[#41525d]">
              <Smartphone className="w-8 h-8" />
              <h1 className="text-3xl font-light">Use WhatsApp on your computer</h1>
            </div>
            
            <ol className="list-decimal pl-6 space-y-6 text-lg text-[#3b4a54]">
              <li>Open WhatsApp on your phone</li>
              <li>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></li>
              <li>Tap on <strong>Link a Device</strong></li>
              <li>Point your phone to this screen to capture the code</li>
            </ol>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-[#00a884] font-medium hover:underline cursor-pointer">Need help to get started?</p>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="p-8 md:p-12 md:w-1/3 border-l border-border flex flex-col items-center justify-center bg-white relative">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00a884] to-[#00a884]/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-white p-2 rounded-lg shadow-sm">
              {qr ? (
                <div className="relative">
                  <QRCodeSVG value={qr} size={256} level="L" includeMargin={true} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm">
                    <p className="font-bold text-[#00a884]">Scan Me</p>
                  </div>
                </div>
              ) : status === 'connecting' ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-lg">
                  <Loader2 className="w-12 h-12 text-[#00a884] animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Generating QR Code...</p>
                </div>
              ) : status === 'disconnected' ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-lg">
                  <ShieldCheck className="w-16 h-16 text-[#00a884]" />
                  <p className="font-semibold text-foreground">Click to Reconnect</p>
                  <button 
                    onClick={async () => {
                      try {
                        console.log('User clicked reconnect button');
                        const response = await fetch('/api/reconnect', { method: 'POST' });
                        if (response.ok) {
                          console.log('Reconnect request successful');
                        } else {
                          console.error('Reconnect request failed');
                        }
                      } catch (error) {
                        console.error('Error reconnecting:', error);
                      }
                    }}
                    className="px-4 py-2 bg-[#00a884] text-white rounded-lg hover:bg-[#00a884]/90 transition-colors"
                  >
                    Reconnect WhatsApp
                  </button>
                </div>
              ) : (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-lg">
                  <ShieldCheck className="w-16 h-16 text-[#00a884]" />
                  <p className="font-semibold text-foreground">Secure Connection</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
             <div className="flex gap-1 items-center">
               <div className={`w-2 h-2 rounded-full ${status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
               <span className="capitalize">{status}</span>
             </div>
             {qr && (
               <span className="ml-4 text-xs text-green-600">QR Ready</span>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
