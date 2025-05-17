import UploadRepository from '../repositories/upload.repository';
import fs from 'fs/promises';

type UploadTask = {
  uploadId: string;
  filepath: string;
};

const uploadQueue: UploadTask[] = [];

// Tambahkan task ke queue
export const enqueueFileProcessing = (uploadId: string, filepath: string) => {
  uploadQueue.push({ uploadId, filepath });
  console.log(`[QUEUE] Task enqueued for upload ID: ${uploadId}`);
};

// Worker yang memproses 1 file per 2 detik
setInterval(async () => {
  if (uploadQueue.length === 0) return;

  const task = uploadQueue.shift();
  if (!task) return;

  console.log(`[QUEUE] Processing upload ID: ${task.uploadId}`);

  try {
    // Simulasi proses file, misalnya validasi isi file atau resize, dsb
    await fs.access(task.filepath); // pastikan file ada

    // Tandai status upload sebagai SUCCESS
    await UploadRepository.updateStatus(task.uploadId, 'SUCCESS');
    console.log(`[QUEUE] Upload ID ${task.uploadId} processed successfully`);
  } catch (error) {
    console.error(`[QUEUE] Failed to process upload ID ${task.uploadId}`, error);
    await UploadRepository.updateStatus(task.uploadId, 'FAILED');
  }
}, 2000); // proses tiap 2 detik