import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, RefreshCw, CheckCircle, X, AlertCircle } from 'lucide-react';

export const AudioRecorder = ({ onCapture, onCancel }) => {
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingState, setRecordingState] = useState('IDLE'); // 'IDLE', 'RECORDING', 'PAUSED', 'RECORDED'
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [mimeType, setMimeType] = useState('audio/webm');
  const [micError, setMicError] = useState('');

  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
      'audio/wav',
    ];

    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    setMicError('');
    chunksRef.current = [];
    setRecordingTime(0);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

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
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
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
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access permission was denied. Please allow microphone access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No microphone hardware detected on this device.');
      } else {
        setMicError(err.message || 'Failed to initialize microphone stream.');
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
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    setRecordingState('IDLE');
    startRecording();
  };

  const handleConfirm = () => {
    if (!audioBlob) return;

    let extension = 'webm';
    if (mimeType.includes('mp4') || mimeType.includes('aac')) extension = 'mp4';
    else if (mimeType.includes('ogg')) extension = 'ogg';
    else if (mimeType.includes('wav')) extension = 'wav';

    const filename = `recorded_statement_${Date.now()}.${extension}`;
    const file = new File([audioBlob], filename, { type: mimeType });

    onCapture(file, 'AUDIO');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      {micError ? (
        <div style={{ padding: '24px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', borderRadius: '6px', textAlign: 'center', width: '100%' }}>
          <AlertCircle size={36} style={{ marginBottom: '8px' }} />
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Microphone Access Failed</div>
          <div style={{ fontSize: '0.85rem' }}>{micError}</div>
          <button className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.8rem' }} onClick={startRecording}>
            <RefreshCw size={14} /> Retry Microphone Access
          </button>
        </div>
      ) : recordingState === 'IDLE' ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', border: '2px dashed var(--border-color)', borderRadius: '8px', width: '100%', background: '#f8fafc' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: 'var(--govt-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mic size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--govt-navy)' }}>Audio Statement Recorder</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Record verbal testimony, witness statements, or officer voice notes directly.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onCancel}>
              <X size={14} /> Cancel
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', gap: '8px' }} onClick={startRecording}>
              <Mic size={16} /> Start Recording
            </button>
          </div>
        </div>
      ) : recordingState === 'RECORDING' || recordingState === 'PAUSED' ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', border: '2px solid var(--border-color)', borderRadius: '8px', width: '100%', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: recordingState === 'RECORDING' ? '#ef4444' : '#f59e0b', animation: recordingState === 'RECORDING' ? 'pulse 1.5s infinite' : 'none' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {recordingState === 'RECORDING' ? 'Recording Live Audio...' : 'Recording Paused'}
            </span>
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--govt-navy)', marginBottom: '20px' }}>
            {formatTime(recordingTime)}
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
        <div style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%', background: '#ffffff' }}>
          <span className="badge badge-success" style={{ marginBottom: '16px' }}>
            <CheckCircle size={12} style={{ marginRight: '4px' }} /> Audio Recording Completed ({formatTime(recordingTime)})
          </span>

          <div style={{ width: '100%', margin: '16px 0' }}>
            <audio src={audioUrl} controls style={{ width: '100%' }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Format: {mimeType} • Size: {(audioBlob?.size / 1024).toFixed(1)} KB
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleRerecord}>
              <RefreshCw size={14} /> Re-record
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={handleConfirm}>
              <CheckCircle size={16} /> Use Audio as Evidence
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
