import { useSocket } from '@/hooks/use-socket';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, RefreshCw, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { status, qr } = useSocket();
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  console.log('Login component state:', { status, hasQR: !!qr, qrLength: qr?.length });

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e3e1de]">
      {/* Header with WhatsApp logo */}
      <header className="bg-white py-3 px-6 flex items-center gap-2">
        <svg viewBox="0 0 39 39" width="39" height="39">
          <path fill="#00E676" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path>
          <path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5s-1.6-.7-2.6-1.2c-.1 0-.2-.1-.3-.1-.3 0-.5.1-.7.2 0 0-.1.1-1.5 1.7-.1.2-.3.3-.5.3h-.1c-.1 0-.3-.1-.4-.2l-.5-.2c-1.1-.5-2.1-1.1-2.9-1.9-.2-.2-.5-.4-.7-.6-.7-.7-1.4-1.5-1.9-2.4l-.1-.2c-.1-.1-.1-.2-.2-.4 0-.2 0-.4.1-.5 0 0 .4-.5.7-.8.2-.2.3-.5.5-.7.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.2 0-.4.1-.6.1l-.1.1c-.2.1-.4.3-.6.4-.2.2-.3.4-.5.6-.7.9-1.1 2-1.1 3.1 0 .8.2 1.6.5 2.3l.1.3c.9 1.9 2.1 3.6 3.7 5.1l.4.4c.3.3.6.5.8.8 2.1 1.8 4.5 3.1 7.2 3.8.3.1.7.1 1 .2h1c.5 0 1.1-.2 1.5-.4.3-.2.5-.2.7-.4l.2-.2c.2-.2.4-.3.6-.5s.3-.4.5-.6c.2-.4.3-.9.4-1.4v-.7s-.1-.1-.3-.2z"></path>
        </svg>
        <span className="text-[#00A884] text-xl font-medium">WhatsApp</span>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {/* Main card */}
        <div className="bg-white shadow-lg w-full max-w-[980px] flex min-h-[480px]">
          
          {/* Left Side: Instructions */}
          <div className="flex-1 p-12 flex flex-col">
            <div>
              <h1 className="text-[26px] font-semibold text-[#41525d] mb-8">Langkah untuk login</h1>
              
              {/* Instructions list */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#8696a0] flex items-center justify-center text-[13px] text-[#8696a0]">1</span>
                  <p className="text-[15px] text-[#41525d] pt-0.5">
                    Buka WhatsApp <svg viewBox="0 0 39 39" width="18" height="18" className="inline-block mx-1 align-middle"><path fill="#25D366" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path><path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9z"></path></svg> di telepon
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#8696a0] flex items-center justify-center text-[13px] text-[#8696a0]">2</span>
                  <p className="text-[15px] text-[#41525d] pt-0.5">
                    Di Android ketuk Menu <span className="inline-flex items-center justify-center w-5 h-5 bg-[#54656f] rounded text-white text-xs mx-1">⋮</span> · Di iPhone ketuk Pengaturan <span className="inline-flex items-center justify-center w-5 h-5 bg-[#54656f] rounded-full mx-1"><svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path></svg></span>
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#8696a0] flex items-center justify-center text-[13px] text-[#8696a0]">3</span>
                  <p className="text-[15px] text-[#41525d] pt-0.5">
                    Ketuk <strong className="font-semibold">Perangkat tertaut</strong>, lalu <strong className="font-semibold">Tautkan perangkat</strong>
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#8696a0] flex items-center justify-center text-[13px] text-[#8696a0]">4</span>
                  <p className="text-[15px] text-[#41525d] pt-0.5">
                    Pindai kode QR untuk mengonfirmasi
                  </p>
                </div>
              </div>
            </div>

            {/* Stay logged in checkbox */}
            <div className="mt-8 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${stayLoggedIn ? 'bg-[#00A884]' : 'border-2 border-[#8696a0]'}`}
                  onClick={() => setStayLoggedIn(!stayLoggedIn)}
                  data-testid="checkbox-stay-logged-in"
                >
                  {stayLoggedIn && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>
                <span className="text-[14px] text-[#41525d]">Tetap masuk di browser ini</span>
              </label>
              
              <a 
                href="#" 
                className="text-[#008069] text-[14px] hover:underline flex items-center gap-1"
                data-testid="link-phone-login"
              >
                Login dengan nomor telepon <span className="text-lg">›</span>
              </a>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="w-[340px] p-12 flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center">
              {/* QR Code Container */}
              <div className="relative">
                {qr ? (
                  <div className="relative" data-testid="qr-code-container">
                    <QRCodeSVG 
                      value={qr} 
                      size={240} 
                      level="L" 
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                    {/* WhatsApp logo in center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded">
                      <svg viewBox="0 0 39 39" width="36" height="36">
                        <path fill="#25D366" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path>
                        <path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5s-1.6-.7-2.6-1.2c-.1 0-.2-.1-.3-.1-.3 0-.5.1-.7.2 0 0-.1.1-1.5 1.7-.1.2-.3.3-.5.3h-.1c-.1 0-.3-.1-.4-.2l-.5-.2c-1.1-.5-2.1-1.1-2.9-1.9-.2-.2-.5-.4-.7-.6-.7-.7-1.4-1.5-1.9-2.4l-.1-.2c-.1-.1-.1-.2-.2-.4 0-.2 0-.4.1-.5 0 0 .4-.5.7-.8.2-.2.3-.5.5-.7.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.2 0-.4.1-.6.1l-.1.1c-.2.1-.4.3-.6.4-.2.2-.3.4-.5.6-.7.9-1.1 2-1.1 3.1 0 .8.2 1.6.5 2.3l.1.3c.9 1.9 2.1 3.6 3.7 5.1l.4.4c.3.3.6.5.8.8 2.1 1.8 4.5 3.1 7.2 3.8.3.1.7.1 1 .2h1c.5 0 1.1-.2 1.5-.4.3-.2.5-.2.7-.4l.2-.2c.2-.2.4-.3.6-.5s.3-.4.5-.6c.2-.4.3-.9.4-1.4v-.7s-.1-.1-.3-.2z"></path>
                      </svg>
                    </div>
                  </div>
                ) : status === 'connecting' ? (
                  <div className="w-[240px] h-[240px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="loading-container">
                    <Loader2 className="w-10 h-10 text-[#00a884] animate-spin" />
                    <p className="text-[14px] text-[#667781]">Memuat...</p>
                  </div>
                ) : status === 'disconnected' ? (
                  <div className="w-[240px] h-[240px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="disconnected-container">
                    <RefreshCw className="w-10 h-10 text-[#667781]" />
                    <p className="text-[14px] text-[#667781] text-center">Koneksi terputus</p>
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
                      Hubungkan Ulang
                    </button>
                  </div>
                ) : (
                  <div className="w-[240px] h-[240px] flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" data-testid="connected-container">
                    <svg viewBox="0 0 24 24" width="48" height="48" className="text-[#00a884]">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    <p className="text-[14px] text-[#667781]">Terhubung</p>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="mt-4 flex items-center gap-2 text-[14px] text-[#667781]">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'connecting' ? 'bg-[#f5c33b]' : 
                  status === 'connected' ? 'bg-[#00a884]' : 'bg-[#ea4335]'
                }`} />
                <span>{status === 'connecting' ? 'Menghubungkan' : status === 'connected' ? 'Terhubung' : 'Terputus'}</span>
                {qr && (
                  <span className="ml-3 text-[#00a884] font-medium" data-testid="text-qr-ready">QR Siap</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[14px] text-[#667781] mb-2">
          Tidak punya akun WhatsApp? <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener noreferrer" className="text-[#008069] hover:underline" data-testid="link-signup">Mulai ↗</a>
        </p>
        <p className="text-[13px] text-[#8696a0] flex items-center justify-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          Pesan pribadi Anda terenkripsi secara end-to-end
        </p>
      </footer>
    </div>
  );
}
