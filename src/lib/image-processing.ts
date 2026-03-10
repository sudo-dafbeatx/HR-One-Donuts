import sharp from 'sharp';

type ImagePreset = 'product' | 'avatar' | 'banner';

interface ProcessingOptions {
  maxWidth: number;
  maxHeight: number | null;
  quality: number;
  fit: keyof sharp.FitEnum;
  maxFileSize: number;
}

interface ProcessedResult {
  buffer: Buffer;
  size: number;
  width: number;
  height: number;
}

const PRESETS: Record<ImagePreset, ProcessingOptions> = {
  product: {
    maxWidth: 1000,
    maxHeight: null,
    quality: 75,
    fit: 'inside',
    maxFileSize: 500 * 1024,
  },
  avatar: {
    maxWidth: 256,
    maxHeight: 256,
    quality: 80,
    fit: 'cover',
    maxFileSize: 200 * 1024,
  },
  banner: {
    maxWidth: 1920,
    maxHeight: null,
    quality: 75,
    fit: 'inside',
    maxFileSize: 500 * 1024,
  },
};

export async function processImage(
  inputBuffer: Buffer,
  preset: ImagePreset
): Promise<ProcessedResult> {
  const options = PRESETS[preset];

  const resizeOptions: sharp.ResizeOptions = {
    width: options.maxWidth,
    height: options.maxHeight ?? undefined,
    fit: options.fit,
    withoutEnlargement: true,
  };

  let quality = options.quality;
  let processed = await sharp(inputBuffer)
    .resize(resizeOptions)
    .webp({ quality })
    .toBuffer();

  while (processed.length > options.maxFileSize && quality > 30) {
    quality -= 5;
    processed = await sharp(inputBuffer)
      .resize(resizeOptions)
      .webp({ quality })
      .toBuffer();
  }

  const metadata = await sharp(processed).metadata();

  return {
    buffer: processed,
    size: processed.length,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
