import React, { useRef, useEffect, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaCog,
  FaDownload,
} from "react-icons/fa";
import "./VideoPlayer.css";

const VideoPlayer = ({
  videoUrl,
  videoTitle = "",
  onCompleted = null,
  onProgress = null,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef(null);

  // Load video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Update current time and trigger progress callback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);

      if (onProgress) {
        onProgress(current);
      }

      // Call onCompleted when video ends
      if (
        current >= duration * 0.95 &&
        duration > 0 &&
        isPlaying &&
        onCompleted
      ) {
        onCompleted();
      }
    }
  };

  // Play/Pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute/Unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Seek
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {
        // Fallback for older browsers
        if (containerRef.current?.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        }
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Playback rate
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current) return;

      switch (e.key?.toLowerCase() || e.code?.toLowerCase()) {
        case " ":
        case "spacebar":
          e.preventDefault();
          togglePlayPause();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case ">":
          handlePlaybackRateChange(Math.min(playbackRate + 0.25, 2));
          break;
        case "<":
          handlePlaybackRateChange(Math.max(playbackRate - 0.25, 0.25));
          break;
        case "arrowleft":
          videoRef.current.currentTime = Math.max(0, currentTime - 5);
          break;
        case "arrowright":
          videoRef.current.currentTime = Math.min(duration, currentTime + 5);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isMuted, isFullscreen, playbackRate, currentTime, duration]);

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (!videoUrl) {
    return (
      <div className="video-player-container error">
        <div className="error-message">
          <FaPlay size={48} />
          <p>Video không tìm thấy hoặc bạn chưa đủ quyền truy cập</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${isFullscreen ? "fullscreen" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && (
        <div className="play-overlay" onClick={togglePlayPause}>
          <FaPlay size={64} />
        </div>
      )}

      {/* Controls */}
      <div className={`video-controls ${showControls ? "visible" : ""}`}>
        {/* Progress bar */}
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
            title={`Seek to ${formatTime(currentTime)}`}
          />
        </div>

        {/* Control buttons */}
        <div className="controls-bottom">
          {/* Left side */}
          <div className="controls-left">
            <button
              className="control-btn"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </button>

            <div className="volume-control">
              <button
                className="control-btn"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <FaVolumeMute size={16} />
                ) : (
                  <FaVolumeUp size={16} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                title="Volume"
              />
            </div>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Center - title */}
          {videoTitle && <div className="video-title">{videoTitle}</div>}

          {/* Right side */}
          <div className="controls-right">
            {/* Playback speed */}
            <div className="playback-speed-control">
              <button className="control-btn playback-btn">
                {playbackRate}x
              </button>
              <div className="speed-menu">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <button
                    key={rate}
                    className={`speed-option ${rate === playbackRate ? "active" : ""}`}
                    onClick={() => handlePlaybackRateChange(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Settings - placeholder */}
            <button className="control-btn" title="Settings">
              <FaCog size={16} />
            </button>

            {/* Fullscreen */}
            <button
              className="control-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
