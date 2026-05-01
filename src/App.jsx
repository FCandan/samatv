import React, { useState, useEffect } from 'react'
import { Home, Compass, Play, Settings, Search, Bell, User, LayoutGrid, X, Loader2, Plus, Tv, Heart, Trash2, Info, Palette, Languages } from 'lucide-react'
import VideoPlayer from './components/VideoPlayer'
import ScraperService from './services/ScraperService'
import IPTVService from './services/IPTVService'
import './App.css'

const translations = {
  en: {
    home: 'Home',
    iptv: 'IPTV',
    browse: 'Browse',
    library: 'Library',
    settings: 'Settings',
    search: 'Search movies, channels...',
    featured: 'Featured Content',
    watchNow: 'Watch Now',
    details: 'Details',
    trending: 'HDFilm Trending',
    action: 'Action Blockbusters',
    channels: 'IPTV Channels',
    loadSample: 'Load Sample (TR)',
    addPlaylist: 'Add Playlist',
    noChannels: 'No channels loaded. Add a playlist to get started.',
    explore: 'Explore Content',
    myLibrary: 'My Library',
    itemsSaved: 'items saved',
    emptyLibrary: 'Your library is empty. Heart items to save them here.',
    appearance: 'Appearance',
    accentColor: 'Accent Color',
    playlists: 'IPTV & Playlists',
    managePlaylists: 'Manage your imported M3U playlists and channels.',
    currentPlaylist: 'Current Playlist:',
    noPlaylist: 'No playlist loaded',
    changePlaylist: 'Change Playlist',
    clear: 'Clear',
    libraryMgmt: 'Library Management',
    manageFavorites: 'Manage your saved movies and favorite channels.',
    totalFavorites: 'Total Favorites',
    clearLibrary: 'Clear Library',
    appInfo: 'App Information',
    version: 'Version',
    engine: 'Engine',
    developer: 'Developer',
    language: 'Language',
    closePlayer: 'Close Player',
    decrypting: 'Decrypting stream...',
    importPlaylist: 'Import Playlist',
    enterUrl: 'Enter the URL of your .m3u playlist to import channels.',
    scanning: 'Scanning sectors for content...',
    confirmClearFavs: 'Are you sure you want to clear all favorites?',
    confirmClearChannels: 'Are you sure you want to clear loaded channels?'
  },
  tr: {
    home: 'Ana Sayfa',
    iptv: 'IPTV',
    browse: 'Göz At',
    library: 'Kütüphane',
    settings: 'Ayarlar',
    search: 'Film, kanal ara...',
    featured: 'Öne Çıkan İçerik',
    watchNow: 'Şimdi İzle',
    details: 'Detaylar',
    trending: 'HDFilm Trendler',
    action: 'Aksiyon Filmleri',
    channels: 'IPTV Kanalları',
    loadSample: 'Örnek Yükle (TR)',
    addPlaylist: 'Liste Ekle',
    noChannels: 'Kanal yüklenmedi. Başlamak için bir liste ekleyin.',
    explore: 'İçeriği Keşfet',
    myLibrary: 'Kütüphanem',
    itemsSaved: 'öğe kaydedildi',
    emptyLibrary: 'Kütüphaneniz boş. Beğendiğiniz içerikleri buraya kaydedin.',
    appearance: 'Görünüm',
    accentColor: 'Vurgu Rengi',
    playlists: 'IPTV ve Listeler',
    managePlaylists: 'İçe aktarılan M3U listelerini ve kanalları yönetin.',
    currentPlaylist: 'Mevcut Liste:',
    noPlaylist: 'Liste yüklenmedi',
    changePlaylist: 'Listeyi Değiştir',
    clear: 'Temizle',
    libraryMgmt: 'Kütüphane Yönetimi',
    manageFavorites: 'Kaydedilen filmleri ve favori kanalları yönetin.',
    totalFavorites: 'Toplam Favori',
    clearLibrary: 'Kütüphaneyi Temizle',
    appInfo: 'Uygulama Bilgisi',
    version: 'Versiyon',
    engine: 'Motor',
    developer: 'Geliştirici',
    language: 'Dil',
    closePlayer: 'Oynatıcıyı Kapat',
    decrypting: 'Yayın çözülüyor...',
    importPlaylist: 'Listeyi İçe Aktar',
    enterUrl: 'Kanalları içe aktarmak için .m3u listesinin URL\'sini girin.',
    scanning: 'İçerik için sektörler taranıyor...',
    confirmClearFavs: 'Tüm favorileri temizlemek istediğinize emin misiniz?',
    confirmClearChannels: 'Yüklü kanalları temizlemek istediğinize emin misiniz?'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movies, setMovies] = useState([])
  const [iptvChannels, setIptvChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [playerLoading, setPlayerLoading] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState(() => {
    return localStorage.getItem('gravity_playlist') || '';
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('gravity_favorites');
    return saved ? JSON.parse(saved) : [];
  })
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('gravity_accent') || '#00f3ff';
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gravity_lang') || 'tr';
  })

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem('gravity_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('gravity_accent', accentColor);
    document.documentElement.style.setProperty('--accent-cyan', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('gravity_lang', language);
  }, [language]);

  useEffect(() => {
    if (playlistUrl) {
      localStorage.setItem('gravity_playlist', playlistUrl);
    }
  }, [playlistUrl]);

  useEffect(() => {
    const autoLoadIPTV = async () => {
      const savedUrl = localStorage.getItem('gravity_playlist');
      if (savedUrl) {
        setLoading(true);
        try {
          const channels = await IPTVService.fetchPlaylist(savedUrl);
          setIptvChannels(channels);
        } catch (error) {
          console.error("Failed to autoload IPTV:", error);
        }
        setLoading(false);
      }
    };
    autoLoadIPTV();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true)
      const data = await ScraperService.getTrendingMovies()
      setMovies(data)
      setLoading(false)
    }
    loadMovies()
  }, [])

  const handleMovieSelect = async (movie) => {
    if (movie.sourceUrl) {
      setPlayerLoading(true)
      setSelectedMovie(movie)
      const realStream = await ScraperService.getStreamUrl(movie.sourceUrl)
      if (realStream) {
        setSelectedMovie(prev => ({ ...prev, streamUrl: realStream }))
      }
      setPlayerLoading(false)
    } else {
      setSelectedMovie(movie)
    }
  }

  const sidebarItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'iptv', icon: Tv, label: t('iptv') },
    { id: 'browse', icon: Compass, label: t('browse') },
    { id: 'library', icon: LayoutGrid, label: t('library') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ]

  const handleAddPlaylist = async () => {
    if (!playlistUrl) return;
    setLoading(true);
    const channels = await IPTVService.fetchPlaylist(playlistUrl);
    setIptvChannels(channels);
    setLoading(false);
    setShowPlaylistModal(false);
    setActiveTab('iptv');
  }

  const loadSampleIPTV = async () => {
    setLoading(true);
    // Sample public M3U for testing
    const sampleUrl = 'https://iptv-org.github.io/iptv/countries/tr.m3u';
    const channels = await IPTVService.fetchPlaylist(sampleUrl);
    setIptvChannels(channels);
    setPlaylistUrl(sampleUrl);
    setLoading(false);
    setActiveTab('iptv');
  }

  const handleClearFavorites = () => {
    if (window.confirm(t('confirmClearFavs'))) {
      setFavorites([]);
    }
  }

  const handleClearChannels = () => {
    if (window.confirm(t('confirmClearChannels'))) {
      setIptvChannels([]);
      setPlaylistUrl('');
      localStorage.removeItem('gravity_playlist');
    }
  }

  const colorPresets = [
    { name: 'Cyan', color: '#00f3ff' },
    { name: 'Purple', color: '#bc13fe' },
    { name: 'Pink', color: '#ff00ff' },
    { name: 'Green', color: '#39ff14' },
    { name: 'Orange', color: '#ffae00' }
  ];

  const categoriesList = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Documentary', 'News', 'Sports']

  const toggleFavorite = (item) => {
    const itemKey = item.url || item.streamUrl || item.id;
    const isFav = favorites.some(f => (f.url || f.streamUrl || f.id) === itemKey);
    if (isFav) {
      setFavorites(favorites.filter(f => (f.url || f.streamUrl || f.id) !== itemKey));
    } else {
      setFavorites([...favorites, item]);
    }
  }

  const isFavorite = (item) => {
    const itemKey = item.url || item.streamUrl || item.id;
    return favorites.some(f => (f.url || f.streamUrl || f.id) === itemKey);
  }

  const filteredMovies = movies.filter(m => 
    (selectedCategory === 'All' || m.category === selectedCategory) &&
    (m.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredChannels = iptvChannels.filter(c =>
    (selectedCategory === 'All' || (c.group && c.group.includes(selectedCategory))) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo">
          <span className="logo-icon">S</span>
          <span className="logo-text">SaMa<span>TV</span></span>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="navbar">
          <div className="search-bar glass">
            <Search size={18} />
            <input type="text" placeholder={t('search')} />
          </div>
          <div className="nav-actions">
            <button className="nav-btn"><Bell size={20} /></button>
            <button className="nav-btn"><User size={20} /></button>
          </div>
        </header>

        {selectedMovie ? (
          <section className="player-view fade-in">
            <div className="player-header">
              <button className="back-btn" onClick={() => setSelectedMovie(null)}>
                <X size={24} /> {t('closePlayer')}
              </button>
              <div className="player-title-group">
                <h2>{selectedMovie.title || selectedMovie.name}</h2>
                <button 
                  className={`fav-btn ${isFavorite(selectedMovie) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(selectedMovie)}
                >
                  <Heart fill={isFavorite(selectedMovie) ? "var(--accent-red)" : "none"} />
                </button>
              </div>
            </div>
            {playerLoading ? (
              <div className="player-loader glass">
                <Loader2 className="spinner" />
                <span>{t('decrypting')}</span>
              </div>
            ) : (
              <VideoPlayer 
                src={selectedMovie.url || selectedMovie.streamUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"} 
                poster={selectedMovie.poster || selectedMovie.logo} 
              />
            )}
            <div className="movie-details glass">
              <div className="details-info">
                <h1>{selectedMovie.title || selectedMovie.name}</h1>
                <p className="meta">{selectedMovie.year || 'Live'} • {selectedMovie.category || selectedMovie.group || 'Broadcast'}</p>
              </div>
            </div>
          </section>
        ) : activeTab === 'iptv' ? (
          <section className="iptv-view fade-in">
            <div className="section-header">
              <h1>{t('channels')} ({iptvChannels.length})</h1>
              <div className="header-btns">
                <button className="btn-secondary" onClick={loadSampleIPTV}>{t('loadSample')}</button>
                <button className="btn-neon" onClick={() => setShowPlaylistModal(true)}>
                  <Plus size={18} /> {t('addPlaylist')}
                </button>
              </div>
            </div>
            
            <div className="channel-grid">
              {iptvChannels.length === 0 ? (
                <div className="empty-state glass">
                  <Tv size={48} />
                  <p>{t('noChannels')}</p>
                </div>
              ) : (
                iptvChannels.map((channel, idx) => (
                  <div key={idx} className="channel-card glass" onClick={() => setSelectedMovie(channel)}>
                    <div className="channel-logo">
                      {channel.logo ? <img src={channel.logo} alt={channel.name} /> : <Tv size={24} />}
                    </div>
                    <div className="channel-info">
                      <h3>{channel.name}</h3>
                      <span>{channel.group}</span>
                      <button 
                        className={`card-fav-btn ${isFavorite(channel) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(channel); }}
                      >
                        <Heart size={14} fill={isFavorite(channel) ? "var(--accent-red)" : "none"} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : activeTab === 'browse' ? (
          <section className="browse-view fade-in">
            <div className="section-header">
              <h1>{t('explore')}</h1>
              <div className="search-box glass">
                <Search size={20} />
                <input 
                  type="text" 
                  placeholder={t('search')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="category-chips">
              {categoriesList.map(cat => (
                <button 
                  key={cat} 
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="browse-results">
              {filteredMovies.length > 0 && (
                <div className="result-section">
                  <h2>{translations[language].trending.split(' ')[1]}</h2>
                  <div className="channel-grid">
                    {filteredMovies.map((m, i) => (
                      <div key={i} className="movie-card glass" onClick={() => handleMovieSelect(m)}>
                        <div className="card-media" style={{ backgroundImage: `url(${m.poster})`, height: '220px' }}>
                          <button 
                            className={`card-fav-btn ${isFavorite(m) ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(m); }}
                          >
                            <Heart size={18} fill={isFavorite(m) ? "var(--accent-red)" : "none"} />
                          </button>
                        </div>
                        <div className="card-info">
                          <h3>{m.title}</h3>
                          <p>{m.category} • {m.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredChannels.length > 0 && (
                <div className="result-section" style={{ marginTop: '40px' }}>
                  <h2>IPTV Channels</h2>
                  <div className="channel-grid">
                    {filteredChannels.slice(0, 50).map((c, i) => (
                      <div key={i} className="channel-card glass" onClick={() => setSelectedMovie(c)}>
                        <div className="channel-logo">
                          {c.logo ? <img src={c.logo} alt={c.name} /> : <Tv size={24} />}
                        </div>
                        <div className="channel-info">
                          <h3>{c.name}</h3>
                          <span>{c.group}</span>
                          <button 
                            className={`card-fav-btn ${isFavorite(c) ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(c); }}
                          >
                            <Heart size={14} fill={isFavorite(c) ? "var(--accent-red)" : "none"} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredMovies.length === 0 && filteredChannels.length === 0 && (
                <div className="empty-state glass">
                  <Search size={48} />
                  <p>{t('noChannels')}</p>
                </div>
              )}
            </div>
          </section>
        ) : activeTab === 'settings' ? (
          <section className="settings-view fade-in">
            <div className="section-header">
              <h1>{t('settings')}</h1>
              <p>{translations[language].managePlaylists.split('.')[0]}</p>
            </div>

            <div className="settings-grid">
              <div className="settings-card glass">
                <div className="settings-card-header">
                  <Palette size={20} className="icon-accent" />
                  <h2>{t('appearance')}</h2>
                </div>
                <p>{t('managePlaylists').split('.')[0]}</p>
                <div className="theme-selector">
                  <div className="lang-selector">
                     <span className="setting-label">{t('language')}</span>
                     <div className="lang-btns">
                        <button className={`lang-btn ${language === 'tr' ? 'active' : ''}`} onClick={() => setLanguage('tr')}>TR</button>
                        <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
                     </div>
                  </div>
                  <span className="setting-label">{t('accentColor')}</span>
                  <div className="color-options">
                    {colorPresets.map(preset => (
                      <div 
                        key={preset.color}
                        className={`color-swatch ${accentColor === preset.color ? 'active' : ''}`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => setAccentColor(preset.color)}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="settings-card glass">
                <div className="settings-card-header">
                  <Tv size={20} className="icon-accent" />
                  <h2>{t('playlists')}</h2>
                </div>
                <p>{t('managePlaylists')}</p>
                <div className="settings-actions">
                  <div className="playlist-status">
                    <span className="setting-label">{t('currentPlaylist')}</span>
                    <p className="url-text">{playlistUrl || t('noPlaylist')}</p>
                  </div>
                  <div className="btn-group">
                    <button className="btn-secondary" onClick={() => setShowPlaylistModal(true)}>
                      {playlistUrl ? t('changePlaylist') : t('addPlaylist')}
                    </button>
                    <button className="btn-danger-outline" onClick={handleClearChannels}>
                      <Trash2 size={16} /> {t('clear')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-card glass">
                <div className="settings-card-header">
                  <Heart size={20} className="icon-accent" />
                  <h2>{t('libraryMgmt')}</h2>
                </div>
                <p>{t('manageFavorites')}</p>
                <div className="settings-actions">
                   <div className="library-stats">
                     <span className="setting-label">{t('totalFavorites')}</span>
                     <span className="stats-badge">{favorites.length}</span>
                   </div>
                   <button className="btn-danger-outline" onClick={handleClearFavorites}>
                     <Trash2 size={16} /> {t('clearLibrary')}
                   </button>
                </div>
              </div>

              <div className="settings-card glass">
                <div className="settings-card-header">
                  <Info size={20} className="icon-accent" />
                  <h2>{t('appInfo')}</h2>
                </div>
                <p>{t('appInfo')}</p>
                <div className="about-info">
                  <div className="info-item">
                    <span>{t('version')}</span>
                    <span className="info-val">1.0.4-beta</span>
                  </div>
                  <div className="info-item">
                    <span>{t('engine')}</span>
                    <span className="info-val">SaMa Engine v2.0</span>
                  </div>
                  <div className="info-item">
                    <span>{t('developer')}</span>
                    <span className="info-val">Antigravity AI</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === 'library' ? (
          <section className="library-view fade-in">
            <div className="section-header">
              <h1>{t('myLibrary')}</h1>
              <p>{favorites.length} {t('itemsSaved')}</p>
            </div>

            {favorites.length === 0 ? (
              <div className="empty-state glass">
                <Heart size={48} />
                <p>{t('emptyLibrary')}</p>
              </div>
            ) : (
              <div className="channel-grid">
                {favorites.map((item, i) => (
                   <div key={i} className="movie-card glass" onClick={() => handleMovieSelect(item)}>
                    <div className="card-media" style={{ backgroundImage: `url(${item.poster || item.logo})`, height: '220px' }}>
                      <button 
                        className={`card-fav-btn ${isFavorite(item) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                      >
                        <Heart size={18} fill={isFavorite(item) ? "var(--accent-red)" : "none"} />
                      </button>
                    </div>
                    <div className="card-info">
                      <h3>{item.title || item.name}</h3>
                      <p>{item.category || item.group || 'Live'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="hero fade-in">
              <div className="hero-content">
                <span className="badge">{t('featured')}</span>
                <h1>Quantum Paradox</h1>
                <p>Journey through the fabric of space and time in this mind-bending sci-fi epic. Available now in 4K HDR.</p>
                <div className="hero-btns">
                  <button className="btn-neon" onClick={() => setSelectedMovie({title: 'Quantum Paradox', poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=2070'})}>
                    {t('watchNow')}
                  </button>
                  <button className="btn-secondary">{t('details')}</button>
                </div>
              </div>
              <div className="hero-gradient"></div>
            </section>

            {loading ? (
              <div className="loader-container">
                <Loader2 className="spinner" size={48} />
                <p>Scanning sectors for content...</p>
              </div>
            ) : (
              <section className="content-rows">
                <Row title={t('trending')} movies={movies} onMovieSelect={handleMovieSelect} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                <Row title={t('action')} movies={movies.filter(m => m.category === 'Action')} onMovieSelect={handleMovieSelect} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
              </section>
            )}
          </>
        )}

        {showPlaylistModal && (
          <div className="modal-overlay">
            <div className="modal glass">
              <div className="modal-header">
                <h2>{t('importPlaylist')}</h2>
                <button className="close-modal" onClick={() => setShowPlaylistModal(false)}><X /></button>
              </div>
              <div className="modal-body">
                <p>{t('enterUrl')}</p>
                <input 
                  type="text" 
                  className="modal-input glass" 
                  placeholder="https://example.com/playlist.m3u" 
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                />
                <button className="btn-neon" onClick={handleAddPlaylist}>{t('importPlaylist')}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ title, movies, onMovieSelect, isFavorite, toggleFavorite }) {
  if (!movies || movies.length === 0) return null;
  
  return (
    <div className="row">
      <h2 className="row-title">{title}</h2>
      <div className="row-cards">
        {movies.map((movie, index) => (
          <div 
            key={movie.id || index} 
            className="movie-card glass fade-in" 
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onMovieSelect(movie)}
          >
             <div className="card-media" style={{ backgroundImage: `url(${movie.poster})` }}>
               <div className="card-overlay">
                  <Play fill="white" size={32} />
               </div>
               <button 
                className={`card-fav-btn ${isFavorite(movie) ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}
              >
                <Heart size={18} fill={isFavorite(movie) ? "var(--accent-red)" : "none"} />
              </button>
            </div>
            <div className="card-info">
              <h3>{movie.title}</h3>
              <p>{movie.category} • {movie.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
