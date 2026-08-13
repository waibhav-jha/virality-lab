import React, { useRef, useState } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { viralityApi } from '../../api/client';
import { Badge } from '../../design-system/Badge';

interface MediaDropzoneProps {
  mediaPath?: string;
  mediaUrl?: string;
  mediaType: string;
  onMediaSelected: (file: File, mediaPath: string, previewUrl: string, mediaType: 'short_video' | 'image') => void;
  onMediaCleared: () => void;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  mediaPath,
  mediaUrl,
  mediaType,
  onMediaSelected,
  onMediaCleared,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|png|jpg|jpeg|webp)$/i)) {
      setErrorMsg('Unsupported format. Provide MP4, MOV, WEBP, PNG, or JPG.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Specimen exceeds 50MB maximum asset limit.');
      return;
    }

    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i);
    const detectedType = isVideo ? 'short_video' : 'image';
    const localPreviewUrl = URL.createObjectURL(file);

    setFileDetails({
      name: file.name,
      size: formatFileSize(file.size),
    });

    setIsUploading(true);
    try {
      const uploadRes = await viralityApi.uploadMedia(file);
      onMediaSelected(file, uploadRes.file_path, localPreviewUrl, detectedType);
    } catch (err: any) {
      console.warn('Staged locally for simulation engine:', err.message);
      onMediaSelected(file, file.name, localPreviewUrl, detectedType);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <div className="flex items-center justify-between font-mono-tech text-[10px] text-[#7E8798] uppercase">
        <label className="font-semibold text-white/80 flex items-center gap-1.5">
          <span>[ATTACH MEDIA SPECIMEN]</span>
        </label>
        <span>VIDEO / IMAGE (MAX 50MB)</span>
      </div>

      {mediaUrl ? (
        <div className="relative bg-white/[0.02] border border-white/15 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-[#07080A] border border-white/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {mediaType === 'short_video' ? (
                <video src={mediaUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex flex-col min-w-0 font-mono-tech">
              <span className="text-xs font-bold text-white truncate">
                {fileDetails?.name || mediaPath?.split(/[\\/]/).pop() || 'specimen_asset.mp4'}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#7E8798]">
                <span className="text-[#D4FF00] font-semibold">
                  {mediaType === 'short_video' ? 'VIDEO SPECIMEN ATTACHED' : 'IMAGE SPECIMEN ATTACHED'}
                </span>
                {fileDetails && (
                  <span>[{fileDetails.size}]</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onMediaCleared}
            className="p-1.5 bg-transparent hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
            title="Remove media specimen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border border-dashed p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative select-none font-mono-tech',
            isDragging
              ? 'border-[#D4FF00] bg-[#D4FF00]/5'
              : 'border-white/15 hover:border-white/30 bg-white/[0.01] hover:bg-white/[0.03]'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {isUploading ? (
            <div className="flex items-center gap-2 text-xs text-[#D4FF00]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>TRANSMITTING MEDIA SPECIMEN...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UploadCloud className="w-4 h-4 text-white/40" />
              <div className="text-left">
                <span className="text-xs text-white font-semibold block">
                  DROP VIDEO / IMAGE OR <span className="text-[#D4FF00] underline">BROWSE</span>
                </span>
                <span className="text-[10px] text-[#5B6474]">
                  Multimodal frame extraction & audio cadence analysis
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 font-mono-tech">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
