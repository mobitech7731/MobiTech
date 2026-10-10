import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Edit2, UploadCloud, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ApiProductImage } from '../../types';
import { uploadService } from '../../services/uploadService';

// Utility to crop image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // Calculate bounding box of the rotated image
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Resize if too large to save space
  const MAX_SIZE = 800;
  if (canvas.width > MAX_SIZE || canvas.height > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / canvas.width, MAX_SIZE / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = w;
    smallCanvas.height = h;
    const smallCtx = smallCanvas.getContext('2d');
    if (smallCtx) {
      smallCtx.drawImage(canvas, 0, 0, w, h);
      return smallCanvas.toDataURL('image/jpeg', 0.85);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

interface ImageUploaderProps {
  images: (string | ApiProductImage)[];
  onChange: (images: (string | ApiProductImage)[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Image Editor State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{width: number, height: number, x: number, y: number} | null>(null);

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: {width: number, height: number, x: number, y: number}) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    setError('');
    const currentCount = images.length;
    const newFiles = Array.from(files).filter(file => {
      const isImg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isImg) setError('Only JPG, PNG and WEBP are allowed.');
      return isImg;
    });

    if (currentCount + newFiles.length > 5) {
      setError('You can only upload up to 5 images.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = newFiles.map(async (file) => {
        const res = await uploadService.uploadImage(file, file.name);
        if (!res.success) throw new Error(res.message || 'Upload failed');
        return res.data;
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedImages]);
    } catch (err: any) {
      setError(err.message || 'Failed to process image files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
    // reset file input
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  // Reordering logic
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    onChange(newImages);
    setDraggedIndex(null);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const currentImage = images[editingIndex];
      const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.url;
      const croppedImageBase64 = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      
      const resBlob = await fetch(croppedImageBase64);
      const blob = await resBlob.blob();
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

      const uploadRes = await uploadService.uploadImage(file);
      if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
      
      const newImages = [...images];
      newImages[editingIndex] = uploadRes.data;
      onChange(newImages);
      
      setEditingIndex(null);
      setZoom(1);
      setRotation(0);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to crop and upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {images.length < 5 && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
            isUploading ? 'border-primary-dark-teal bg-primary-dark-teal/5 opacity-70 cursor-not-allowed' :
            dragActive ? 'border-primary-dark-teal bg-primary-dark-teal/5 cursor-pointer' : 'border-light-neutral bg-soft-ivory/30 hover:bg-soft-ivory/60 cursor-pointer'
          }`}
          onDragEnter={!isUploading ? handleDrag : undefined}
          onDragLeave={!isUploading ? handleDrag : undefined}
          onDragOver={!isUploading ? handleDrag : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
        >
          <input
            type="file"
            multiple
            disabled={isUploading}
            accept="image/jpeg, image/png, image/webp"
            onChange={handleChange}
            className={`absolute inset-0 w-full h-full opacity-0 ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary-dark-teal mb-3 animate-spin" />
              <p className="text-sm font-medium text-primary-dark mb-1">
                Uploading images...
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-primary-dark/40 mb-3" />
              <p className="text-sm font-medium text-primary-dark mb-1">
                Drag & drop photos here
              </p>
              <p className="text-sm font-medium text-primary-dark mb-1">
                or click to browse
              </p>
              <p className="text-xs text-primary-dark/60">
                JPG, PNG or WEBP ? Up to 5 photos
              </p>
            </>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
          {images.map((img, idx) => {
            const imgUrl = typeof img === 'string' ? img : img.url;
            return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOverItem(e, idx)}
              onDrop={(e) => handleDropItem(e, idx)}
              className={`relative group aspect-square rounded-lg border overflow-hidden bg-white cursor-move ${
                idx === 0 ? 'border-primary-dark-teal ring-2 ring-primary-dark-teal/20' : 'border-light-neutral'
              } ${draggedIndex === idx ? 'opacity-50' : 'opacity-100'}`}
            >
              {/* Badge for primary */}
              {idx === 0 && (
                <div className="absolute top-0 left-0 w-full bg-primary-dark-teal text-white text-[10px] font-bold uppercase tracking-wider py-1 text-center z-10">
                  Main Image
                </div>
              )}
              
              <img 
                src={imgUrl} 
                alt={`Product ${idx + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/images/admin/product-placeholder.svg'; }}
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditingIndex(idx); setZoom(1); setRotation(0); }}
                  className="w-8 h-8 rounded-full bg-white text-primary-dark flex items-center justify-center hover:bg-primary-dark-teal hover:text-white transition-colors"
                  title="Edit image"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                  className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-xl my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-light-neutral flex items-start justify-between bg-white shrink-0">
              <div>
                <h3 className="font-bold text-lg text-primary-dark">Edit Product Image</h3>
                <p className="text-xs text-primary-dark/60 mt-1">Adjust your photo before adding it to the product.</p>
              </div>
              <button 
                onClick={() => setEditingIndex(null)} 
                className="text-primary-dark/40 hover:text-primary-dark transition-colors p-1"
                aria-label="Close image editor"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Image Canvas */}
            <div className="relative h-[45vh] sm:h-[400px] bg-neutral-900 w-full shrink-0">
              <Cropper
                image={typeof images[editingIndex] === 'string' ? images[editingIndex] as string : (images[editingIndex] as ApiProductImage).url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                objectFit="contain"
              />
            </div>
            
            {/* Controls & Actions */}
            <div className="p-4 sm:p-6 bg-white flex flex-col gap-6 shrink-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Zoom Control */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary-dark/50 mb-3 block">Zoom</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setZoom(z => Math.max(1, z - 0.1))}
                      className="text-primary-dark/60 hover:text-primary-dark transition-colors"
                      aria-label="Zoom out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-label="Zoom slider"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-primary-dark-teal h-1.5 bg-light-neutral rounded-lg appearance-none cursor-pointer"
                    />
                    <button 
                      type="button"
                      onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                      className="text-primary-dark/60 hover:text-primary-dark transition-colors"
                      aria-label="Zoom in"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary-dark/50 mb-3 block">Rotation</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setRotation(r => r - 90)}
                      className="text-primary-dark/60 hover:text-primary-dark transition-colors"
                      aria-label="Rotate left 90 degrees"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      aria-label="Rotation slider"
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 accent-primary-dark-teal h-1.5 bg-light-neutral rounded-lg appearance-none cursor-pointer"
                    />
                    <button 
                      type="button"
                      onClick={() => setRotation(r => r + 90)}
                      className="text-primary-dark/60 hover:text-primary-dark transition-colors"
                      aria-label="Rotate right 90 degrees"
                    >
                      <RotateCw size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-light-neutral/40 mt-2">
                <button
                  type="button"
                  onClick={() => { setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-dark/60 hover:text-primary-dark transition-colors w-full sm:w-auto justify-center py-2"
                  aria-label="Reset image"
                >
                  <RefreshCcw size={14} /> Reset
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingIndex(null)}
                    className="w-full sm:w-auto border-light-neutral/80"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={handleSaveEdit}
                    disabled={isUploading}
                    className="w-full sm:w-auto min-w-[120px] justify-center flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Uploading...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
