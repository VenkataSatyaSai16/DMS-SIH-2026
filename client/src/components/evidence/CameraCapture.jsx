import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, X, AlertCircle } from 'lucide-react';

export const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    setCameraError('');
    try {
      let mediaStream;
      try {
        // Try environment-facing (rear) camera first for mobile devices
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else {
        setCameraError(err.message || 'Failed to initialize camera device.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      'image/jpeg',
      0.92
    );

    // Pause video preview
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedBlob && !capturedImage) return;

    let blob = capturedBlob;
    if (!blob && capturedImage) {
      // Fallback conversion from dataURL
      const byteString = atob(capturedImage.split(',')[1]);
      const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mimeString });
    }

    const filename = `camera_photo_${Date.now()}.jpg`;
    const file = new File([blob], filename, { type: 'image/jpeg' });

    onCapture(file, 'PHOTOGRAPH');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {cameraError ? (
        <div style={{ padding: '24px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', borderRadius: '6px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <AlertCircle size={36} style={{ marginBottom: '8px' }} />
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Camera Initialization Failed</div>
          <div style={{ fontSize: '0.85rem' }}>{cameraError}</div>
          <button className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.8rem' }} onClick={startCamera}>
            <RefreshCw size={14} /> Retry Camera Access
          </button>
        </div>
      ) : capturedImage ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '520px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#000' }}>
            <img src={capturedImage} alt="Captured Evidence Preview" style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }} />
            <span className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <CheckCircle size={12} style={{ marginRight: '4px' }} /> Photo Captured
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleRetake}>
              <RefreshCw size={14} /> Retake Photo
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={handleConfirm}>
              <CheckCircle size={16} /> Use Photo as Evidence
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '520px', height: '340px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!cameraActive && (
              <div style={{ position: 'absolute', color: '#94a3b8', fontSize: '0.9rem' }}>Initializing camera preview...</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onCancel}>
              <X size={14} /> Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', gap: '8px' }}
              onClick={handleCapture}
              disabled={!cameraActive}
            >
              <Camera size={18} /> Capture Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
