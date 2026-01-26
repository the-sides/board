import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Video,
  VideoOff,
  Camera,
  FlipHorizontal,
  Download,
  RefreshCw,
  Monitor,
  Trash2,
} from 'lucide-react'

export const Route = createFileRoute('/demo/webcam')({
  component: WebcamDemo,
})

interface CapturedPhoto {
  id: string
  dataUrl: string
  timestamp: Date
}

function WebcamDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isMirrored, setIsMirrored] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const [resolution, setResolution] = useState<{ width: number; height: number } | null>(null)

  // Get available video devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Need to request permission first to get device labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
        tempStream.getTracks().forEach((track) => track.stop())

        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = allDevices.filter((device) => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error('Error getting devices:', err)
      }
    }
    getDevices()
  }, [])

  const startWebcam = useCallback(async () => {
    try {
      setError(null)
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          const track = mediaStream.getVideoTracks()[0]
          const settings = track.getSettings()
          setResolution({
            width: settings.width || 0,
            height: settings.height || 0,
          })
        }
      }

      setIsStreaming(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access webcam'
      setError(errorMessage)
      console.error('Webcam error:', err)
    }
  }, [selectedDeviceId])

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setResolution(null)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Handle mirroring
    if (isMirrored) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date(),
    }
    setCapturedPhotos((prev) => [newPhoto, ...prev])
  }, [isMirrored])

  const downloadPhoto = useCallback((photo: CapturedPhoto) => {
    const link = document.createElement('a')
    link.href = photo.dataUrl
    link.download = `webcam-capture-${photo.timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.png`
    link.click()
  }, [])

  const deletePhoto = useCallback((id: string) => {
    setCapturedPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }, [])

  // Switch camera when device selection changes
  useEffect(() => {
    if (isStreaming && selectedDeviceId) {
      stopWebcam()
      startWebcam()
    }
  }, [selectedDeviceId])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Video className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Webcam Tester</h1>
          </div>
          <p className="text-slate-400">
            Test your webcam, capture photos, and verify camera settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Preview */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-400">
                  <div className="text-center p-6">
                    <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">Camera Error</p>
                    <p className="text-sm text-slate-500">{error}</p>
                  </div>
                </div>
              ) : !isStreaming ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Click "Start Camera" to begin</p>
                  </div>
                </div>
              ) : null}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''} ${isMirrored ? 'scale-x-[-1]' : ''}`}
              />
              {/* Resolution Badge */}
              {resolution && isStreaming && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  {resolution.width} × {resolution.height}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {!isStreaming ? (
                <button
                  onClick={startWebcam}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  <Video className="w-5 h-5" />
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={stopWebcam}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <VideoOff className="w-5 h-5" />
                    Stop
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Capture
                  </button>
                </>
              )}

              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isMirrored
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Toggle mirror mode"
              >
                <FlipHorizontal className="w-5 h-5" />
                Mirror
              </button>

              {isStreaming && (
                <button
                  onClick={() => {
                    stopWebcam()
                    startWebcam()
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                  title="Refresh camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Device Selection */}
            {devices.length > 1 && (
              <div className="flex items-center gap-3">
                <label className="text-slate-400 text-sm">Camera:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="flex-1 max-w-md px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Captured Photos Sidebar */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Captured Photos
              {capturedPhotos.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                  {capturedPhotos.length}
                </span>
              )}
            </h2>

            {capturedPhotos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No photos captured yet</p>
                <p className="text-xs mt-1">Click "Capture" to take a photo</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {capturedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group bg-slate-900 rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Capture ${photo.id}`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-slate-300">
                        {photo.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  )
}
