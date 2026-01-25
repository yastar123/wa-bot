import { useSocket } from '@/hooks/use-socket';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, RefreshCw, Lock, Download } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { status, qr } = useSocket();
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fcf5eb] dark:bg-[#111b21] font-sans">
      {/* Header */}
      <header className="bg-[#fcf5eb] dark:bg-[#202c33] py-4 px-6 md:px-12 flex items-center gap-3">
        <svg viewBox="0 0 39 39" width="39" height="39" className="flex-shrink-0">
          <path fill="#00E676" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path>
          <path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5s-1.6-.7-2.6-1.2c-.1 0-.2-.1-.3-.1-.3 0-.5.1-.7.2 0 0-.1.1-1.5 1.7-.1.2-.3.3-.5.3h-.1c-.1 0-.3-.1-.4-.2l-.5-.2c-1.1-.5-2.1-1.1-2.9-1.9-.2-.2-.5-.4-.7-.6-.7-.7-1.4-1.5-1.9-2.4l-.1-.2c-.1-.1-.1-.2-.2-.4 0-.2 0-.4.1-.5 0 0 .4-.5.7-.8.2-.2.3-.5.5-.7.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.2 0-.4.1-.6.1l-.1.1c-.2.1-.4.3-.6.4-.2.2-.3.4-.5.6-.7.9-1.1 2-1.1 3.1 0 .8.2 1.6.5 2.3l.1.3c.9 1.9 2.1 3.6 3.7 5.1l.4.4c.3.3.6.5.8.8 2.1 1.8 4.5 3.1 7.2 3.8.3.1.7.1 1 .2h1c.5 0 1.1-.2 1.5-.4.3-.2.5-.2.7-.4l.2-.2c.2-.2.4-.3.6-.5s.3-.4.5-.6c.2-.4.3-.9.4-1.4v-.7s-.1-.1-.3-.2z"></path>
        </svg>
        <span className="text-[#00A884] text-xl font-semibold tracking-tight">WhatsApp</span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-[#202c33] border border-[#e9edef] dark:border-[#2a3942] rounded-[24px] w-full max-w-[1020px] flex flex-col md:flex-row shadow-sm min-h-[440px]">
          
          {/* Left Side: Instructions */}
          <div className="flex-1 p-8 md:p-14 flex flex-col">
            <h1 className="text-[28px] font-light text-[#41525d] dark:text-[#e9edef] mb-10">Langkah untuk login</h1>
            
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-[26px] h-[26px] rounded-full border border-[#d1d7db] dark:border-[#3b4a54] flex items-center justify-center text-[15px] text-[#667781] dark:text-[#8696a0]">1</div>
                <p className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db] pt-0.5">
                  Buka WhatsApp <svg viewBox="0 0 39 39" width="20" height="20" className="inline-block mx-1 align-middle"><path fill="#25D366" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path><path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9z"></path></svg> di telepon
                </p>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-[26px] h-[26px] rounded-full border border-[#d1d7db] dark:border-[#3b4a54] flex items-center justify-center text-[15px] text-[#667781] dark:text-[#8696a0]">2</div>
                <p className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db] pt-0.5 leading-relaxed">
                  Di Android ketuk Menu <span className="inline-flex items-center justify-center w-5 h-5 bg-[#f0f2f5] dark:bg-[#111b21] border border-[#d1d7db] dark:border-[#3b4a54] rounded text-[#667781] dark:text-[#8696a0] text-xs font-bold mx-1">⋮</span> · Di iPhone ketuk Pengaturan <span className="inline-flex items-center justify-center w-5 h-5 bg-[#f0f2f5] dark:bg-[#111b21] border border-[#d1d7db] dark:border-[#3b4a54] rounded-full mx-1"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-[#667781] dark:text-[#8696a0]"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path></svg></span>
                </p>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-[26px] h-[26px] rounded-full border border-[#d1d7db] dark:border-[#3b4a54] flex items-center justify-center text-[15px] text-[#667781] dark:text-[#8696a0]">3</div>
                <p className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db] pt-0.5">
                  Ketuk <strong className="font-semibold text-[#111b21] dark:text-[#e9edef]">Perangkat tertaut</strong>, lalu <strong className="font-semibold text-[#111b21] dark:text-[#e9edef]">Tautkan perangkat</strong>
                </p>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-[26px] h-[26px] rounded-full border border-[#d1d7db] dark:border-[#3b4a54] flex items-center justify-center text-[15px] text-[#667781] dark:text-[#8696a0]">4</div>
                <p className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db] pt-0.5">
                  Pindai kode QR untuk mengonfirmasi
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={`w-[18px] h-[18px] rounded border transition-colors flex items-center justify-center ${stayLoggedIn ? 'bg-[#00A884] border-[#00A884]' : 'border-[#adb5bb] dark:border-[#3b4a54] group-hover:border-[#8696a0]'}`}
                  onClick={() => setStayLoggedIn(!stayLoggedIn)}
                  data-testid="checkbox-stay-logged-in"
                >
                  {stayLoggedIn && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>
                <span className="text-[14px] text-[#667781] dark:text-[#8696a0]">Tetap masuk di browser ini</span>
              </label>
              
              <button 
                className="text-[#008069] dark:text-[#00a884] text-[14px] font-medium hover:underline flex items-center gap-1 self-start sm:self-auto"
                data-testid="link-phone-login"
              >
                Login dengan nomor telepon <span className="text-xl leading-none">›</span>
              </button>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="w-full md:w-[380px] p-8 md:p-14 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#e9edef] dark:border-[#2a3942]">
            <div className="relative p-2 bg-white rounded-lg shadow-sm border border-[#e9edef]">
              {qr ? (
                <div className="relative group" data-testid="qr-code-container">
                  <QRCodeSVG 
                    value={qr} 
                    size={264} 
                    level="H" 
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  {/* Logo in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                    <svg viewBox="0 0 39 39" width="42" height="42">
                      <path fill="#25D366" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"></path>
                      <path fill="#FFF" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5s-1.6-.7-2.6-1.2c-.1 0-.2-.1-.3-.1-.3 0-.5.1-.7.2 0 0-.1.1-1.5 1.7-.1.2-.3.3-.5.3h-.1c-.1 0-.3-.1-.4-.2l-.5-.2c-1.1-.5-2.1-1.1-2.9-1.9-.2-.2-.5-.4-.7-.6-.7-.7-1.4-1.5-1.9-2.4l-.1-.2c-.1-.1-.1-.2-.2-.4 0-.2 0-.4.1-.5 0 0 .4-.5.7-.8.2-.2.3-.5.5-.7.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.2 0-.4.1-.6.1l-.1.1c-.2.1-.4.3-.6.4-.2.2-.3.4-.5.6-.7.9-1.1 2-1.1 3.1 0 .8.2 1.6.5 2.3l.1.3c.9 1.9 2.1 3.6 3.7 5.1l.4.4c.3.3.6.5.8.8 2.1 1.8 4.5 3.1 7.2 3.8.3.1.7.1 1 .2h1c.5 0 1.1-.2 1.5-.4.3-.2.5-.2.7-.4l.2-.2c.2-.2.4-.3.6-.5s.3-.4.5-.6c.2-.4.3-.9.4-1.4v-.7s-.1-.1-.3-.2z"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-[264px] h-[264px] flex flex-col items-center justify-center gap-4 bg-[#f9f9f9] dark:bg-[#111b21] rounded" data-testid="loading-container">
                  {status === 'connecting' ? (
                    <>
                      <Loader2 className="w-10 h-10 text-[#00a884] animate-spin" />
                      <p className="text-[14px] text-[#667781] font-medium">Memuat kode QR...</p>
                    </>
                  ) : (
                    <button 
                      onClick={() => window.location.reload()}
                      className="flex flex-col items-center gap-3 text-[#667781] hover:text-[#00a884] transition-colors"
                      data-testid="button-reconnect"
                    >
                      <RefreshCw className="w-10 h-10" />
                      <p className="text-[14px] font-medium text-center px-4">Koneksi terputus. Klik untuk memuat ulang.</p>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center flex flex-col items-center gap-3">
          <p className="text-[14px] text-[#667781] dark:text-[#8696a0]">
            Tidak punya akun WhatsApp? <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener noreferrer" className="text-[#008069] dark:text-[#00a884] hover:underline font-medium" data-testid="link-signup">Mulai ↗</a>
          </p>
          <p className="text-[12px] text-[#8696a0] dark:text-[#667781] flex items-center justify-center gap-1.5 opacity-80">
            <Lock className="w-3.5 h-3.5" />
            Pesan pribadi Anda terenkripsi secara end-to-end
          </p>
        </footer>
      </main>
    </div>
  );
}
