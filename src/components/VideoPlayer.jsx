import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, Maximize, RotateCcw, SkipForward, Settings } from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let hls;
    if (videoRef.current && src) {
      if (src.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = src;
        }
      } else if (!src.includes('rplayer') && !src.includes('iframe')) {
        videoRef.current.src = src;
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = (e.target.value / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const isIframe = src && (src.includes('/rplayer/') || src.includes('iframe') || src.includes('embed'));

  if (isIframe) {
    return (
      <div className="player-container glass">
        <iframe 
          src={src} 
          className="video-element" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  return (
    <div className="player-container glass" onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="video-element"
      />
      
      <div className={`player-controls ${showControls ? 'visible' : ''}`}>
        <div className="progress-bar-container">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="progress-bar"
          />
        </div>

        <div className="controls-main">
          <div className="controls-left">
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
            </button>
            <button className="control-btn"><RotateCcw size={20} /></button>
            <button className="control-btn"><SkipForward size={20} /></button>
            <div className="volume-control">
              <Volume2 size={20} />
              <div className="volume-slider glass"></div>
            </div>
          </div>

          <div className="controls-right">
            <button className="control-btn"><Settings size={20} /></button>
            <button className="control-btn" onClick={() => videoRef.current.requestFullscreen()}>
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
