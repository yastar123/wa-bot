import { useSocket } from '@/hooks/use-socket';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, RefreshCw } from 'lucide-react';

export default function Login() {
  const { status, qr } = useSocket();

  console.log('Login component state:', { status, hasQR: !!qr, qrLength: qr?.length });

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Top green bar */}
      <div className="h-[222px] bg-[#00a884]" />
      
      {/* Main content area */}
      <div className="flex-1 bg-[#d1d7db] -mt-[100px] flex items-start justify-center px-4 pb-8">
        {/* Main card */}
        <div className="bg-white shadow-lg w-full max-w-[1000px] flex min-h-[500px]">
          
          {/* Left Side: Instructions */}
          <div className="flex-1 p-[64px] flex flex-col justify-between">
            <div>
              {/* Header with phone icon */}
              <div className="flex items-center gap-4 mb-10">
                <svg viewBox="0 0 53 53" width="39" height="39" className="text-[#41525d]">
                  <path fill="currentColor" d="M26.5,4 C37.925,4 47.25,13.325 47.25,24.75 C47.25,36.175 37.925,45.5 26.5,45.5 L26.5,49 C14.245,49 4.25,39.005 4.25,26.75 C4.25,14.495 14.245,4.5 26.5,4.5 L26.5,4 Z M26.5,8 C16.455,8 8.25,16.205 8.25,26.25 C8.25,36.295 16.455,44.5 26.5,44.5 C36.545,44.5 44.75,36.295 44.75,26.25 C44.75,16.205 36.545,8 26.5,8 Z" />
                  <rect fill="currentColor" x="24" y="14" width="5" height="16" rx="2.5" />
                  <rect fill="currentColor" x="16" y="22" width="21" height="5" rx="2.5" transform="rotate(-45 26.5 24.5)" />
                </svg>
                <h1 className="text-[28px] font-normal text-[#41525d]">Use WhatsApp on your computer</h1>
              </div>
              
              {/* Instructions list */}
              <ol className="list-decimal pl-[30px] space-y-4 text-[18px] text-[#41525d] leading-[26px]">
                <li>Open WhatsApp on your phone</li>
                <li className="leading-[26px]">
                  Tap <strong className="font-semibold">Menu</strong> or <strong className="font-semibold">Settings</strong> and select <strong className="font-semibold">Linked Devices</strong>
                </li>
                <li>Tap on <strong className="font-semibold">Link a Device</strong></li>
                <li>Point your phone to this screen to capture the code</li>
              </ol>
            </div>

            {/* Help link */}
            <div className="mt-12 pt-8 border-t border-[#e9edef]">
              <a 
                href="https://faq.whatsapp.com/web/download-and-installation/how-to-link-a-device" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#008069] text-[14px] hover:underline cursor-pointer"
                data-testid="link-help"
              >
                Need help to get started?
              </a>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="w-[370px] p-[64px] flex flex-col items-center justify-center bg-white border-l border-[#e9edef]">
            <div className="flex flex-col items-center">
              {/* QR Code Container */}
              <div className="relative">
                {qr ? (
                  <div className="relative" data-testid="qr-code-container">
                    <QRCodeSVG 
                      value={qr} 
                      size={264} 
                      level="L" 
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                ) : status === 'connecting' ? (
                  <div className="w-[264px] h-[264px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="loading-container">
                    <Loader2 className="w-10 h-10 text-[#00a884] animate-spin" />
                    <p className="text-[14px] text-[#667781]">Loading...</p>
                  </div>
                ) : status === 'disconnected' ? (
                  <div className="w-[264px] h-[264px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="disconnected-container">
                    <RefreshCw className="w-10 h-10 text-[#667781]" />
                    <p className="text-[14px] text-[#667781] text-center">Connection lost</p>
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
                      className="px-6 py-2.5 bg-[#00a884] text-white text-[14px] rounded-full hover:bg-[#008069] transition-colors"
                      data-testid="button-reconnect"
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <div className="w-[264px] h-[264px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="connected-container">
                    <svg viewBox="0 0 24 24" width="48" height="48" className="text-[#00a884]">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    <p className="text-[14px] text-[#667781]">Connected</p>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="mt-6 flex items-center gap-2 text-[14px] text-[#667781]">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'connecting' ? 'bg-[#f5c33b]' : 
                  status === 'connected' ? 'bg-[#00a884]' : 'bg-[#ea4335]'
                }`} />
                <span className="capitalize">{status === 'connecting' ? 'Connecting' : status === 'connected' ? 'Connected' : 'Disconnected'}</span>
                {qr && (
                  <span className="ml-3 text-[#00a884] font-medium" data-testid="text-qr-ready">QR Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
