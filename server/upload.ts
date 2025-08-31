import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const filesDir = path.join(uploadsDir, 'files');

async function ensureDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(filesDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

ensureDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const dest = isImage ? imagesDir : filesDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueId = nanoid();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  let rawMime: string = file.mimetype || '';
  let baseMime = rawMime.split(';')[0].trim();

  // Infer mime from extension if missing or generic
  if (!baseMime && file.originalname) {
    if (file.originalname.endsWith('.webm')) baseMime = 'audio/webm';
    else if (file.originalname.endsWith('.ogg')) baseMime = 'audio/ogg';
    else if (file.originalname.endsWith('.mp3')) baseMime = 'audio/mpeg';
  }

  const allowedExact = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents / archives
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed'
  ]);

  const isAudio = baseMime.startsWith('audio/');
  const isVideoWebm = baseMime === 'video/webm'; // some browsers emit video/webm for audio-only

  if (allowedExact.has(baseMime) || isAudio || isVideoWebm) {
    console.log('[upload] Accepting file', {
      original: file.originalname,
      mimetype: rawMime,
      normalized: baseMime,
      size: file.size
    });
    return cb(null, true);
  }

  const err: any = new Error('File type not allowed');
  err.status = 400;
  console.warn('[upload] Rejected file type:', { rawMime, baseMime, name: file.originalname });
  return cb(err, false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Image processing function
export async function processImage(filePath: string): Promise<string> {
  try {
    const processedPath = filePath.replace(/\.[^/.]+$/, '_processed.webp');
    
    await sharp(filePath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(processedPath);
    
    // Delete original file
    await fs.unlink(filePath);
    
    return processedPath;
  } catch (error) {
    console.error('Error processing image:', error);
    return filePath; // Return original if processing fails
  }
}

// File metadata extraction
export function getFileMetadata(file: Express.Multer.File) {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    uploadDate: new Date().toISOString(),
    isImage: file.mimetype.startsWith('image/')
  };
}
