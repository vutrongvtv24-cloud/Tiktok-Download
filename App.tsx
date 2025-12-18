import React, { useState, useEffect, useRef } from 'react';
import { analyzeTikTokLink, fetchChannelVideos, extractUsername } from './services/geminiService';
import { TikTokVideo, DownloadHistoryItem, DownloadType } from './types';
import { HistoryList } from './components/HistoryList';

// --- Translations ---
const TRANSLATIONS = {
  en: {
    title: "TikTok Downloader",
    home: "Home",
    terms: "Terms",
    privacy: "Privacy",
    authorTitle: "Author Information",
    heroTitle1: "The Best TikTok Downloader",
    heroTitle2: "Without Watermark",
    heroDesc: "The fastest way to download TikTok videos in MP4 format without logos. Simply paste the link below to get started.",
    placeholderSingle: "Paste TikTok link here...",
    placeholderChannel: "Paste channel link (@username)...",
    placeholderList: "Paste multiple TikTok links here (one per line)...",
    btnDownload: "Download",
    processing: "Processing",
    typeSingle: "Single Video",
    typeChannel: "Full Channel",
    typeList: "Batch List",
    errorInvalidUrl: "Please enter valid TikTok URL(s)",
    errorNotFound: "Video not found",
    errorPrivate: "Could not fetch video. Link might be invalid or private.",
    errorGeneric: "An error occurred while processing the request.",
    successFound: "Video found successfully!",
    successScan: (count: number) => `Found ${count} videos.`,
    scanStop: "Scanning stopped.",
    batchStart: "Starting batch download... Please keep this tab open.",
    batchFinish: (count: number, total: number) => `Batch finished. Saved ${count}/${total} videos.`,
    confirmClear: "Are you sure you want to clear your download history? This action cannot be undone.",
    historyCleared: "History cleared",
    loadedHistory: "Loaded from history",
    downloaded: "Downloaded",
    downloadHD: "Download HD",
    downloadMP3: "Download MP3",
    downloadAgain: "Download Again",
    downloadAll: "Download All",
    scanAll: "Scan All",
    stopScan: "Stop Scan",
    loadMore: "Load more videos...",
    scanning: "Scanning...",
    waiting: "Waiting",
    saving: "Saving...",
    saved: "Saved",
    failed: "Failed",
    features: {
      fast: "Super Fast",
      secure: "Secure",
      unlimited: "Unlimited"
    },
    seo: {
        title: "Best TikTok Downloader 2025",
        desc: "Looking for the best <strong>TikTok Downloader</strong>? Our tool allows you to save videos from TikTok without the watermark. Whether you want to keep funny clips, tutorials, or music videos, our TikTok Downloader is the fastest and easiest solution. It works on all devices—Android, iOS, Windows, and Mac.",
        featuresTitle: "Key Features",
        feat1: "<strong>No Watermark:</strong> Download TikTok videos clean, without the TikTok logo.",
        feat2: "<strong>HD Quality:</strong> Get the highest resolution available (HD/Full HD).",
        feat3: "<strong>TikTok to MP3:</strong> Easily convert and download TikTok audio/music.",
        feat4: "<strong>Free & Unlimited:</strong> No costs, no download limits."
    }
  },
  vi: {
    title: "TikTok Downloader",
    home: "Trang chủ",
    terms: "Điều khoản",
    privacy: "Bảo mật",
    authorTitle: "Thông tin tác giả",
    heroTitle1: "Trình Tải TikTok Tốt Nhất",
    heroTitle2: "Không Có Logo",
    heroDesc: "Cách nhanh nhất để tải video TikTok định dạng MP4 không có hình mờ. Chỉ cần dán liên kết bên dưới để bắt đầu.",
    placeholderSingle: "Dán liên kết TikTok vào đây...",
    placeholderChannel: "Dán liên kết kênh (@username)...",
    placeholderList: "Dán nhiều liên kết (mỗi dòng một link)...",
    btnDownload: "Tải xuống",
    processing: "Đang xử lý",
    typeSingle: "Video Lẻ",
    typeChannel: "Toàn bộ Kênh",
    typeList: "Danh sách",
    errorInvalidUrl: "Vui lòng nhập liên kết TikTok hợp lệ",
    errorNotFound: "Không tìm thấy video",
    errorPrivate: "Không thể lấy video. Liên kết có thể không hợp lệ hoặc riêng tư.",
    errorGeneric: "Đã xảy ra lỗi khi xử lý yêu cầu.",
    successFound: "Đã tìm thấy video!",
    successScan: (count: number) => `Tìm thấy ${count} video.`,
    scanStop: "Đã dừng quét.",
    batchStart: "Bắt đầu tải hàng loạt... Vui lòng giữ tab này mở.",
    batchFinish: (count: number, total: number) => `Hoàn tất. Đã lưu ${count}/${total} video.`,
    confirmClear: "Bạn có chắc chắn muốn xóa lịch sử tải xuống? Hành động này không thể hoàn tác.",
    historyCleared: "Đã xóa lịch sử",
    loadedHistory: "Đã tải từ lịch sử",
    downloaded: "Đã tải",
    downloadHD: "Tải HD",
    downloadMP3: "Tải MP3",
    downloadAgain: "Tải lại",
    downloadAll: "Tải tất cả",
    scanAll: "Quét tất cả",
    stopScan: "Dừng quét",
    loadMore: "Tải thêm video...",
    scanning: "Đang quét...",
    waiting: "Đang chờ",
    saving: "Đang lưu...",
    saved: "Đã lưu",
    failed: "Lỗi",
    features: {
      fast: "Siêu Tốc",
      secure: "An Toàn",
      unlimited: "Không Giới Hạn"
    },
    seo: {
        title: "Tải Video TikTok Tốt Nhất 2025",
        desc: "Bạn đang tìm kiếm <strong>Trình tải xuống TikTok</strong> tốt nhất? Công cụ của chúng tôi cho phép bạn lưu video từ TikTok mà không có hình mờ (logo). Cho dù bạn muốn lưu clip hài hước, hướng dẫn hay video âm nhạc, đây là giải pháp nhanh nhất và dễ dàng nhất. Hoạt động trên mọi thiết bị—Android, iOS, Windows và Mac.",
        featuresTitle: "Tính năng nổi bật",
        feat1: "<strong>Không Logo:</strong> Tải video TikTok sạch, không dính logo TikTok.",
        feat2: "<strong>Chất lượng HD:</strong> Lấy độ phân giải cao nhất có sẵn (HD/Full HD).",
        feat3: "<strong>TikTok sang MP3:</strong> Dễ dàng chuyển đổi và tải xuống âm thanh/nhạc TikTok.",
        feat4: "<strong>Miễn phí & Không giới hạn:</strong> Không tốn phí, không giới hạn lượt tải."
    }
  }
};

type Lang = 'en' | 'vi';

// --- Sub-components for different pages ---

const LegalSection = ({ title }: { title: string }) => (
  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="space-y-4 text-sm text-slate-400">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>This service is provided "as is" without warranty of any kind. We do not host any video content. All videos are hosted on TikTok's servers.</p>
      <p>Users are responsible for ensuring they have the right to download and use the content. This tool is for personal use only.</p>
      <p>We do not store your personal data or download history on our servers. All data is processed locally in your browser.</p>
    </div>
  </div>
);

const SEOContent = ({ lang }: { lang: Lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="mt-16 space-y-8 text-slate-400 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-8">
      <section>
        <h3 className="text-xl font-bold text-slate-200 mb-3">{t.seo.title}</h3>
        <p dangerouslySetInnerHTML={{ __html: t.seo.desc }}></p>
      </section>
      
      <div className="grid md:grid-cols-1 gap-8">
        <section>
          <h3 className="text-lg font-bold text-slate-200 mb-2">{t.seo.featuresTitle}</h3>
          <ul className="list-disc list-inside space-y-2">
            <li dangerouslySetInnerHTML={{ __html: t.seo.feat1 }}></li>
            <li dangerouslySetInnerHTML={{ __html: t.seo.feat2 }}></li>
            <li dangerouslySetInnerHTML={{ __html: t.seo.feat3 }}></li>
            <li dangerouslySetInnerHTML={{ __html: t.seo.feat4 }}></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/50 bg-red-500/10 text-red-400',
    info: 'border-[#25f4ee]/50 bg-[#25f4ee]/10 text-[#25f4ee]'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-full ${colors[type]}`}>
      <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle'}`}></i>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><i className="fa-solid fa-xmark"></i></button>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'terms' | 'privacy'>('home');
  const [lang, setLang] = useState<Lang>('en');
  const [url, setUrl] = useState('');
  
  // State for single video
  const [currentVideo, setCurrentVideo] = useState<TikTokVideo | null>(null);
  
  // State for channel/list
  const [channelVideos, setChannelVideos] = useState<TikTokVideo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCursor, setScanCursor] = useState<number>(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);
  const [scanningUsername, setScanningUsername] = useState<string | null>(null);
  const abortScanRef = useRef<boolean>(false);

  // General UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, 'waiting' | 'downloading' | 'success' | 'error'>>({});

  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [downloadType, setDownloadType] = useState<DownloadType>(DownloadType.SINGLE);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Helper for current translations
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const saved = localStorage.getItem('tiktok_history');
    if (saved) setHistory(JSON.parse(saved));
    
    // Check saved language
    const savedLang = localStorage.getItem('app_lang') as Lang;
    if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
        setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tiktok_history', JSON.stringify(history));
  }, [history]);

  const toggleLanguage = () => {
      const newLang = lang === 'en' ? 'vi' : 'en';
      setLang(newLang);
      localStorage.setItem('app_lang', newLang);
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
  };

  const validateUrl = (input: string) => {
    if (downloadType === DownloadType.SINGLE) return input.includes('tiktok.com');
    if (downloadType === DownloadType.CHANNEL) return input.includes('tiktok.com/@');
    // For List, check if at least one line has tiktok.com
    if (downloadType === DownloadType.LIST) return input.split(/\r?\n/).some(line => line.includes('tiktok.com'));
    return false;
  };

  const resetState = () => {
    setError(null);
    setChannelVideos([]);
    setCurrentVideo(null);
    setScanCursor(0);
    setHasMoreVideos(false);
    setScanningUsername(null);
    setDownloadProgress({});
    setLoadingProgress('');
    abortScanRef.current = false;
  };

  const handleDownload = async () => {
    resetState();
    setCurrentView('home'); 
    
    if (!url.trim()) return;
    if (!validateUrl(url)) {
      setError(t.errorInvalidUrl);
      showToast(t.errorInvalidUrl, 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (downloadType === DownloadType.SINGLE) {
        const videoData = await analyzeTikTokLink(url);
        
        if (videoData) {
          showToast(t.successFound, 'success');
          setCurrentVideo(videoData);
        } else {
          setError(t.errorPrivate);
          showToast(t.errorNotFound, 'error');
        }
        setIsLoading(false);
      } 
      else if (downloadType === DownloadType.CHANNEL) {
        // Channel Mode - Initial Fetch
        const username = extractUsername(url);
        if (!username) {
          setError('Could not find username in URL.');
          setIsLoading(false);
          return;
        }

        setScanningUsername(username);
        // Start recursive scan process
        await scanChannel(username, 0);
      }
      else if (downloadType === DownloadType.LIST) {
        // List Mode
        const lines = url.split(/\r?\n/).map(l => l.trim()).filter(l => l && l.includes('tiktok.com'));
        
        if (lines.length === 0) {
           setError('No valid TikTok links found in the list.');
           setIsLoading(false);
           return;
        }

        setScanningUsername('Custom Batch List');
        let foundCount = 0;
        
        // Process each link sequentially
        for (let i = 0; i < lines.length; i++) {
           setLoadingProgress(`${t.processing} ${i + 1}/${lines.length}...`);
           try {
             const videoData = await analyzeTikTokLink(lines[i]);
             if (videoData) {
               // Check duplicate in current batch
               setChannelVideos(prev => {
                  if (prev.find(p => p.id === videoData.id)) return prev;
                  return [...prev, videoData];
               });
               foundCount++;
             }
             // Small delay to prevent rate limit
             await new Promise(r => setTimeout(r, 500));
           } catch (e) {
             console.error(`Failed to analyze line ${i}`, e);
           }
        }

        setIsLoading(false);
        setLoadingProgress('');
        if (foundCount === 0) {
           setError('Could not fetch any videos from the list.');
           showToast(t.errorNotFound, 'error');
        } else {
           showToast(t.successScan(foundCount), 'success');
        }
      }
    } catch (err: any) {
      setError(t.errorGeneric);
      showToast('Connection error', 'error');
      console.error(err);
      setIsLoading(false);
    }
  };

  // Function to recursively scan channel
  const scanChannel = async (username: string, cursor: number) => {
    setIsScanning(true);
    // Don't set isLoading to false immediately, we want to show we are working
    
    try {
      const response = await fetchChannelVideos(username, cursor);
      
      // If we got videos
      if (response.videos.length > 0) {
        setChannelVideos(prev => {
          // Filter duplicates just in case
          const newVideos = response.videos.filter(v => !prev.some(p => p.id === v.id));
          return [...prev, ...newVideos];
        });
      }

      setScanCursor(response.nextCursor);
      setHasMoreVideos(response.hasMore);

      if (cursor === 0) {
        // First fetch complete
        setIsLoading(false); 
        if (response.videos.length === 0) {
           setError(t.errorPrivate);
        } else {
           showToast(t.successScan(response.videos.length), 'success');
        }
      }

    } catch (e) {
      console.error("Scan error", e);
      if (cursor === 0) {
         setError('Failed to fetch channel data.');
         setIsLoading(false);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadMore = async () => {
    if (!scanningUsername || !hasMoreVideos) return;
    await scanChannel(scanningUsername, scanCursor);
  };

  const handleScanAll = async () => {
    if (!scanningUsername) return;
    abortScanRef.current = false;
    setIsScanning(true);
    
    let currentCursor = scanCursor;
    let keepGoing = hasMoreVideos;

    // Safety limit: 1000 videos to prevent browser crash
    let safetyCounter = 0;
    const MAX_VIDEOS = 1000;

    while (keepGoing && !abortScanRef.current && channelVideos.length < MAX_VIDEOS && safetyCounter < 50) {
       safetyCounter++;
       try {
         const response = await fetchChannelVideos(scanningUsername, currentCursor);
         
         if (response.videos.length > 0) {
           setChannelVideos(prev => {
             const newVideos = response.videos.filter(v => !prev.some(p => p.id === v.id));
             return [...prev, ...newVideos];
           });
         }
         
         currentCursor = response.nextCursor;
         keepGoing = response.hasMore;
         
         // Small delay to be nice to proxies
         await new Promise(r => setTimeout(r, 1000));
       } catch (e) {
         console.error("Auto scan interrupted", e);
         break;
       }
    }
    
    setIsScanning(false);
    setHasMoreVideos(keepGoing);
    setScanCursor(currentCursor);
    showToast(t.successScan(channelVideos.length), 'success');
  };

  const stopScan = () => {
    abortScanRef.current = true;
    setIsScanning(false);
    showToast(t.scanStop, 'info');
  };

  const addToHistory = (video: TikTokVideo) => {
    const newHistoryItem: DownloadHistoryItem = {
      id: Date.now().toString(),
      video: video,
      timestamp: Date.now(),
      status: 'completed'
    };
    setHistory(prev => {
      const exists = prev.find(p => p.video.id === video.id);
      if (exists) return prev;
      return [newHistoryItem, ...prev];
    });
  };

  const handleFileDownload = async (fileUrl: string | undefined, type: 'video' | 'audio', filenamePrefix: string = 'ttdown') => {
    if (!fileUrl || fileUrl === '#') {
      // showToast("Link unavailable", 'error'); // Too noisy for batch
      return false;
    }

    const ext = type === 'video' ? 'mp4' : 'mp3';
    const filename = `${filenamePrefix}-${Date.now()}.${ext}`;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      return true;
      
    } catch (e) {
      console.log(`Direct download failed for ${filename}`);
      return false;
    }
  };

  const handleBatchDownload = async () => {
    if (channelVideos.length === 0) return;

    if (!window.confirm(`Start downloading ${channelVideos.length} videos?`)) {
      return;
    }

    setIsBatchDownloading(true);
    showToast(t.batchStart, 'info');
    
    // Initialize progress map
    const progressMap: Record<string, 'waiting' | 'downloading' | 'success' | 'error'> = {};
    channelVideos.forEach(v => progressMap[v.id] = 'waiting');
    setDownloadProgress(progressMap);

    let successCount = 0;
    
    // Process sequentially
    for (let i = 0; i < channelVideos.length; i++) {
      const video = channelVideos[i];
      setDownloadProgress(prev => ({ ...prev, [video.id]: 'downloading' }));
      
      try {
        const success = await handleFileDownload(video.downloadUrl, 'video', `${video.author.replace('@','')}-video-${i+1}`);
        if (success) {
            successCount++;
            setDownloadProgress(prev => ({ ...prev, [video.id]: 'success' }));
        } else {
            setDownloadProgress(prev => ({ ...prev, [video.id]: 'error' }));
        }
        
        // Add delay between downloads
        if (i < channelVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (e) {
        console.error(`Failed to download video ${video.id}`);
        setDownloadProgress(prev => ({ ...prev, [video.id]: 'error' }));
      }
    }

    setIsBatchDownloading(false);
    showToast(t.batchFinish(successCount, channelVideos.length), 'success');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'terms': return <LegalSection title={lang === 'vi' ? 'Điều khoản sử dụng' : "Terms of Service"} />;
      case 'privacy': return <LegalSection title={lang === 'vi' ? 'Chính sách bảo mật' : "Privacy Policy"} />;
      default: return (
        <>
        {/* Search Input Area */}
        <div className="bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm transition-all hover:border-slate-600 focus-within:ring-2 focus-within:ring-[#fe2c55]/50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              {downloadType === DownloadType.LIST ? (
                <>
                  <div className="absolute left-4 top-4 text-slate-500">
                    <i className="fa-solid fa-list-ul"></i>
                  </div>
                  <textarea
                    placeholder={t.placeholderList}
                    className="w-full bg-transparent border-0 pl-11 pr-4 py-4 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none custom-scrollbar"
                    rows={4}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input 
                    type="text"
                    placeholder={downloadType === DownloadType.SINGLE ? t.placeholderSingle : t.placeholderChannel}
                    className="w-full bg-transparent border-0 pl-11 pr-4 py-4 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                  />
                </>
              )}
              
              {url && (
                <button 
                  onClick={() => setUrl('')}
                  className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
            
            <button 
              onClick={handleDownload}
              disabled={isLoading || isScanning || !url}
              className={`px-8 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-lg shadow-[#fe2c55]/20 active:scale-95 flex-shrink-0 ${
                downloadType === DownloadType.LIST ? 'py-4' : 'py-3'
              } ${
                (isLoading || isScanning || !url)
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#fe2c55] to-[#f2295b] text-white hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs">{loadingProgress || t.processing}</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-down text-xl"></i>
                  <span>{t.btnDownload}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input 
              type="radio" 
              name="type" 
              className="hidden" 
              checked={downloadType === DownloadType.SINGLE} 
              onChange={() => setDownloadType(DownloadType.SINGLE)} 
              disabled={isLoading || isScanning}
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${downloadType === DownloadType.SINGLE ? 'border-[#fe2c55] bg-[#fe2c55]/20' : 'border-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#fe2c55] transition-all ${downloadType === DownloadType.SINGLE ? 'scale-100' : 'scale-0'}`}></div>
            </div>
            <span className={`text-sm ${downloadType === DownloadType.SINGLE ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>{t.typeSingle}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input 
              type="radio" 
              name="type" 
              className="hidden" 
              checked={downloadType === DownloadType.CHANNEL} 
              onChange={() => setDownloadType(DownloadType.CHANNEL)} 
              disabled={isLoading || isScanning}
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${downloadType === DownloadType.CHANNEL ? 'border-[#fe2c55] bg-[#fe2c55]/20' : 'border-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#fe2c55] transition-all ${downloadType === DownloadType.CHANNEL ? 'scale-100' : 'scale-0'}`}></div>
            </div>
            <span className={`text-sm ${downloadType === DownloadType.CHANNEL ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>{t.typeChannel}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input 
              type="radio" 
              name="type" 
              className="hidden" 
              checked={downloadType === DownloadType.LIST} 
              onChange={() => setDownloadType(DownloadType.LIST)} 
              disabled={isLoading || isScanning}
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${downloadType === DownloadType.LIST ? 'border-[#fe2c55] bg-[#fe2c55]/20' : 'border-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#fe2c55] transition-all ${downloadType === DownloadType.LIST ? 'scale-100' : 'scale-0'}`}></div>
            </div>
            <span className={`text-sm ${downloadType === DownloadType.LIST ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>{t.typeList}</span>
          </label>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <section className="space-y-6">
            {/* SINGLE VIDEO VIEW */}
            {currentVideo && !channelVideos.length && (
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700 p-6 animate-in zoom-in duration-300">
                <div className="flex gap-4 mb-6">
                  <div className="w-24 h-36 rounded-xl overflow-hidden shadow-xl bg-slate-900 flex-shrink-0 group relative">
                    <img src={currentVideo.thumbnail} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-play text-white"></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold line-clamp-2 leading-tight mb-2 text-slate-100">{currentVideo.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">By <span className="text-[#25f4ee] hover:underline cursor-pointer">{currentVideo.author}</span></p>
                    <div className="flex gap-2 text-xs text-slate-500">
                      <span className="bg-slate-700/50 px-2 py-1 rounded border border-slate-700">HD MP4</span>
                      <span className="bg-slate-700/50 px-2 py-1 rounded border border-slate-700">No Logo</span>
                    </div>
                  </div>
                </div>
                
                {(() => {
                   const isDownloaded = history.some(h => h.video.id === currentVideo.id && h.status === 'completed');
                   
                   return (
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                        {isDownloaded ? (
                             <button 
                                disabled
                                className="flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 py-3 rounded-xl font-bold cursor-not-allowed border border-emerald-500/20"
                              >
                                <i className="fa-solid fa-check"></i>
                                <span>{t.downloaded}</span>
                              </button>
                        ) : (
                              <button 
                                onClick={async () => {
                                   const success = await handleFileDownload(currentVideo.downloadUrl, 'video');
                                   if (success) addToHistory(currentVideo);
                                }}
                                className="flex items-center justify-center gap-2 bg-[#25f4ee] hover:bg-[#1fd9d4] text-slate-900 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_-5px_#25f4ee]"
                              >
                                <i className="fa-solid fa-download"></i>
                                <span>{t.downloadHD}</span>
                              </button>
                        )}
                          <button 
                            onClick={async () => {
                                const success = await handleFileDownload(currentVideo.musicUrl || currentVideo.downloadUrl, 'audio');
                                if (success && !isDownloaded) addToHistory(currentVideo);
                            }}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 py-3 rounded-xl font-bold transition-all active:scale-95 border border-slate-600"
                          >
                            <i className="fa-solid fa-music"></i>
                            <span>{t.downloadMP3}</span>
                          </button>
                        </div>
                        
                        {isDownloaded && (
                            <button 
                              onClick={() => handleFileDownload(currentVideo.downloadUrl, 'video')}
                              className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl font-medium text-sm transition-all border border-dashed border-slate-600"
                            >
                              <i className="fa-solid fa-rotate-right"></i>
                              <span>{t.downloadAgain}</span>
                            </button>
                        )}
                    </div>
                   );
                })()}
              </div>
            )}

            {/* CHANNEL / LIST RESULTS VIEW */}
            {channelVideos.length > 0 && (
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700 p-6 animate-in zoom-in duration-300 flex flex-col max-h-[600px]">
                 <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">
                            {downloadType === DownloadType.LIST ? "Batch List Results" : `Channel: ${scanningUsername}`}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                           {isScanning && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>}
                           {isScanning ? t.scanning : "Found"} {channelVideos.length} videos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isScanning ? (
                           <button 
                             onClick={stopScan}
                             className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-bold transition-colors"
                           >
                             {t.stopScan}
                           </button>
                        ) : hasMoreVideos && downloadType === DownloadType.CHANNEL && (
                           <button 
                             onClick={handleScanAll}
                             className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-bold transition-colors flex items-center gap-1"
                           >
                             <i className="fa-solid fa-magnifying-glass-plus"></i>
                             {t.scanAll}
                           </button>
                        )}
                        <button 
                          onClick={handleBatchDownload}
                          disabled={isBatchDownloading || isScanning}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                            (isBatchDownloading || isScanning) ? 'bg-slate-600 cursor-not-allowed text-slate-400' : 'bg-[#fe2c55] hover:bg-[#d61f43] text-white shadow-lg'
                          }`}
                        >
                          {isBatchDownloading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {t.saving}
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-layer-group"></i>
                              {t.downloadAll} ({channelVideos.length})
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {channelVideos.map((video, idx) => {
                      const status = downloadProgress[video.id];
                      return (
                      <div key={`${video.id}-${idx}`} className="flex gap-3 p-2 rounded-lg hover:bg-slate-700/40 transition-colors border border-transparent hover:border-slate-600">
                         <img src={video.thumbnail} className="w-16 h-20 rounded object-cover bg-slate-900" alt="thumb" loading="lazy" />
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 line-clamp-1">{video.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{video.duration}s • {video.author}</p>
                            <div className="flex gap-2 mt-2">
                               {isBatchDownloading && status ? (
                                   <div className={`text-xs px-2 py-1.5 rounded flex items-center gap-2 font-medium w-fit ${
                                      status === 'waiting' ? 'bg-slate-700 text-slate-400' :
                                      status === 'downloading' ? 'bg-blue-500/20 text-blue-400' :
                                      status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                      'bg-red-500/20 text-red-400'
                                   }`}>
                                       {status === 'waiting' && <><i className="fa-regular fa-clock"></i> {t.waiting}</>}
                                       {status === 'downloading' && <><i className="fa-solid fa-spinner fa-spin"></i> {t.saving}</>}
                                       {status === 'success' && <><i className="fa-solid fa-check"></i> {t.saved}</>}
                                       {status === 'error' && <><i className="fa-solid fa-xmark"></i> {t.failed}</>}
                                   </div>
                               ) : (
                                   <button 
                                     onClick={() => handleFileDownload(video.downloadUrl, 'video')}
                                     className="text-xs bg-[#25f4ee]/10 text-[#25f4ee] px-2 py-1 rounded hover:bg-[#25f4ee]/20 transition-colors"
                                   >
                                     {t.btnDownload}
                                   </button>
                               )}
                               {!isBatchDownloading && status === 'success' && (
                                   <span className="text-emerald-400 text-xs flex items-center px-1" title="Already downloaded in this session">
                                     <i className="fa-solid fa-check-double"></i>
                                   </span>
                               )}
                            </div>
                         </div>
                      </div>
                      );
                    })}
                    {hasMoreVideos && !isScanning && downloadType === DownloadType.CHANNEL && (
                      <button 
                        onClick={handleLoadMore} 
                        className="w-full py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg border border-dashed border-slate-700 transition-all"
                      >
                        {t.loadMore}
                      </button>
                    )}
                    {isScanning && (
                      <div className="text-center py-4 text-slate-500">
                        <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        {t.scanning}
                      </div>
                    )}
                 </div>
              </div>
            )}

            {/* EMPTY STATE / PLACEHOLDER */}
            {!currentVideo && channelVideos.length === 0 && (
              <div className="bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl h-[300px] flex flex-col items-center justify-center text-slate-500 hover:border-slate-600 transition-colors">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#fe2c55]/20 border-t-[#fe2c55] rounded-full animate-spin"></div>
                    <p className="animate-pulse">{loadingProgress || t.processing}</p>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-clapperboard text-4xl mb-4 opacity-20"></i>
                    <p className="text-sm">Video preview will appear here</p>
                  </>
                )}
              </div>
            )}
            
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 select-none">
              <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#fe2c55]/20 transition-colors">
                   <i className="fa-solid fa-bolt text-[#fe2c55]"></i>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.features.fast}</p>
              </div>
              <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#25f4ee]/20 transition-colors">
                   <i className="fa-solid fa-shield text-[#25f4ee]"></i>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.features.secure}</p>
              </div>
              <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#fe2c55]/20 transition-colors">
                   <i className="fa-solid fa-infinity text-[#fe2c55]"></i>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.features.unlimited}</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <HistoryList 
              items={history} 
              lang={lang}
              onClear={() => {
                if (window.confirm(t.confirmClear)) {
                  setHistory([]);
                  showToast(t.historyCleared, 'success');
                }
              }}
              onDownload={(video) => {
                setDownloadType(DownloadType.SINGLE);
                setCurrentVideo(video);
                setChannelVideos([]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(t.loadedHistory, 'info');
              }}
            />
            {/* Removed the 'How to Use' block here as requested (FAQ Removal) */}
          </section>
        </div>
        <SEOContent lang={lang} />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-[#fe2c55]/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fe2c55] to-[#f2295b] flex items-center justify-center shadow-lg shadow-[#fe2c55]/30">
              <i className="fa-brands fa-tiktok text-white text-lg"></i>
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">{t.title}</span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Language Switcher */}
             <div className="relative group">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all text-slate-300"
                >
                  <i className="fa-solid fa-globe"></i>
                  {lang.toUpperCase()}
                </button>
             </div>

             <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700 backdrop-blur-md">
                <button 
                  onClick={() => setCurrentView('home')} 
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currentView === 'home' ? 'bg-[#25f4ee]/20 text-[#25f4ee]' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.home}
                </button>
             </div>
          </div>
        </nav>

        {currentView === 'home' && (
            <div className="text-center mt-12 mb-10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm">
                        {t.heroTitle1}
                    </span>
                    <span className="block text-3xl md:text-5xl mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">
                        {t.heroTitle2}
                    </span>
                </h1>
                <p className="text-slate-400 mt-4 max-w-lg mx-auto">{t.heroDesc}</p>
            </div>
        )}

        {/* Content Render */}
        {renderContent()}

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-800 pt-8 pb-12 text-center">
            <p className="text-slate-500 mb-2">© 2025 {t.title}. All rights reserved.</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400 mb-6">
                <button onClick={() => setCurrentView('terms')} className="hover:text-[#25f4ee]">{t.terms}</button>
                <button onClick={() => setCurrentView('privacy')} className="hover:text-[#25f4ee]">{t.privacy}</button>
            </div>
            <div className="inline-block bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{t.authorTitle}</p>
                <p className="font-bold text-slate-200">Vũ Trọng</p>
                <p className="text-sm text-[#25f4ee]">Zalo: 0835.242.357</p>
            </div>
        </footer>
      </div>
      
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;