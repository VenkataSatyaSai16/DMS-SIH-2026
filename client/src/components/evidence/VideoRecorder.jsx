import { useState, useRef, useEffect } from 'react';
import { Video, Square, Pause, Play, RefreshCw, CheckCircle, X, AlertCircle } from 'lucide-react';

export const VideoRecorder = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingState, setRecordingState] = useState('IDLE'); // 'IDLE', 'RECORDING', 'PAUSED', 'RECORDED'
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [mimeType, setMimeType] = useState('video/webm');
  const [videoError, setVideoError] = useState('');

  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
    ];

    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/webm';
  };

  const startCameraAndRecord = async () => {
    setVideoError('');
    chunksRef.current = [];
    setRecordingTime(0);

    try {
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: true,
        });
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const selectedMime = getSupportedMimeType();
      setMimeType(selectedMime);

      const recorder = new MediaRecorder(mediaStream, { mimeType: selectedMime });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMime });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setRecordingState('RECORDED');

        // Stop stream tracks
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setRecordingState('RECORDING');

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Camera/mic access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVideoError('Camera and microphone permissions were denied. Please check browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setVideoError('No camera or microphone hardware found on this device.');
      } else {
        setVideoError(err.message || 'Failed to initialize video recording stream.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingState('PAUSED');
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingState('RECORDING');
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.stop();
      clearInterval(timerRef.current);
    }
  };

  const handleRerecord = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl('');
    setRecordingTime(0);
    setRecordingState('IDLE');
    startCameraAndRecord();
  };

  const handleConfirm = () => {
    if (!videoBlob) return;

    let extension = 'webm';
    if (mimeType.includes('mp4')) extension = 'mp4';

    const filename = `recorded_video_${Date.now()}.${extension}`;
    const file = new File([videoBlob], filename, { type: mimeType });

    onCapture(file, 'VIDEO');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      {videoError ? (
        <div style={{ padding: '24px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', borderRadius: '6px', textAlign: 'center', width: '100%' }}>
          <AlertCircle size={36} style={{ marginBottom: '8px' }} />
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Video Access Failed</div>
          <div style={{ fontSize: '0.85rem' }}>{videoError}</div>
          <button className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.8rem' }} onClick={startCameraAndRecord}>
            <RefreshCw size={14} /> Retry Device Access
          </button>
        </div>
      ) : recordingState === 'IDLE' ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', border: '2px dashed var(--border-color)', borderRadius: '8px', width: '100%', background: '#f8fafc' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: 'var(--govt-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Video size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--govt-navy)' }}>Video Evidence Recorder</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Record video evidence, crime scene walkthroughs, or CCTV playback streams.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onCancel}>
              <X size={14} /> Cancel
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', gap: '8px' }} onClick={startCameraAndRecord}>
              <Video size={16} /> Start Video Recording
            </button>
          </div>
        </div>
      ) : recordingState === 'RECORDING' || recordingState === 'PAUSED' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.65)', padding: '4px 10px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: recordingState === 'RECORDING' ? '#ef4444' : '#f59e0b' }} />
              {formatTime(recordingTime)} {recordingState === 'PAUSED' && '(PAUSED)'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {recordingState === 'RECORDING' ? (
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={pauseRecording}>
                <Pause size={14} /> Pause
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={resumeRecording}>
                <Play size={14} /> Resume
              </button>
            )}

            <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }} onClick={stopRecording}>
              <Square size={14} /> Stop Recording
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#000' }}>
            <video src={videoUrl} controls style={{ width: '100%', maxHeight: '340px', display: 'block' }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Duration: {formatTime(recordingTime)} • Format: {mimeType} • Size: {(videoBlob?.size / 1024 / 1024).toFixed(2)} MB
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleRerecord}>
              <RefreshCw size={14} /> Re-record
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={handleConfirm}>
              <CheckCircle size={16} /> Use Video as Evidence
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
