import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import type { VideoClip } from "../types";
import { FFMPEG_CONFIG } from "../utils";

export class FFmpegService {
  private ffmpeg: FFmpeg;
  private isLoaded = false;
  private isLoading = false;
  private onProgress?: (progress: number) => void;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isLoaded && this.ffmpeg.loaded) return;
    if (this.isLoading) return; // 이미 로딩 중이면 중복 실행 방지

    this.isLoading = true;
    this.onProgress = onProgress;

    try {
      console.log('FFmpeg 초기화 시작...');
      
      // 다양한 CDN과 안정적인 버전들 시도 (순서대로 안정성 우선)
      const cdnUrls = [
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm', // 싱글스레드 안정 버전
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/esm',
        'https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm', // 멀티스레드 안정 버전
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.4/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm', // 최신 싱글스레드
        'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm', // 최신 멀티스레드
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm'
      ];

      let loadSuccess = false;
      let lastError: Error | null = null;

      for (const baseURL of cdnUrls) {
        try {
          console.log(`FFmpeg 로딩 시도: ${baseURL}`);
          
          this.ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg Log:', message);
          });
          
          this.ffmpeg.on('progress', ({ progress }) => {
            this.onProgress?.(Math.round(progress * 100));
          });
          
          // URL 유효성 체크
          const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
          const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
          const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
          
          await this.ffmpeg.load({
            coreURL,
            wasmURL,
            workerURL,
          });
          
          // 로드 후 실제 사용 가능한지 테스트
          if (this.ffmpeg.loaded) {
            loadSuccess = true;
            console.log(`FFmpeg 로드 및 검증 완료: ${baseURL}`);
            break;
          } else {
            throw new Error('FFmpeg 로드는 완료되었지만 사용할 수 없습니다.');
          }
        } catch (error) {
          console.warn(`FFmpeg 로드 실패 (${baseURL}):`, error);
          lastError = error as Error;
          
          // 오류 타입별 상세 로그
          if (error instanceof Error) {
            if (error.message.includes('fetch')) {
              console.warn('네트워크 문제로 인한 FFmpeg 로드 실패');
            } else if (error.message.includes('wasm')) {
              console.warn('WebAssembly 지원 문제로 인한 FFmpeg 로드 실패');
            } else {
              console.warn('알 수 없는 이유로 FFmpeg 로드 실패:', error.message);
            }
          }
          
          // Reset ffmpeg instance if it failed to load, to try with a fresh one
          this.ffmpeg = new FFmpeg();
          continue;
        }
      }

      if (!loadSuccess) {
        throw new Error(`모든 CDN에서 FFmpeg 로드 실패. 마지막 오류: ${lastError?.message}`);
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('FFmpeg 초기화 실패:', error);
      this.isLoaded = false;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  get isFFmpegLoaded(): boolean {
    const serviceLoaded = this.isLoaded;
    const instanceLoaded = this.ffmpeg.loaded;
    console.log(`FFmpeg 상태 체크 - 서비스: ${serviceLoaded}, 인스턴스: ${instanceLoaded}, 로딩중: ${this.isLoading}`);
    return serviceLoaded && instanceLoaded;
  }

  async exportSingleClip(clip: VideoClip): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg.loaded) {
      throw new Error('FFmpeg가 로드되지 않았습니다.');
    }

    const inputData = await fetchFile(clip.file);
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    // 비디오 처리 (품질 최적화)
    await this.ffmpeg.exec([
      '-i', 'input.mp4',
      '-c:v', FFMPEG_CONFIG.videoCodec,
      '-preset', FFMPEG_CONFIG.preset,
      '-crf', FFMPEG_CONFIG.crf,
      '-c:a', FFMPEG_CONFIG.audioCodec,
      '-b:a', FFMPEG_CONFIG.audioBitrate,
      'output.mp4'
    ]);

    const outputData = await this.ffmpeg.readFile('output.mp4');
    const outputBlob = new Blob([outputData], { type: 'video/mp4' });

    // 임시 파일 정리
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile('output.mp4');

    return outputBlob;
  }

  async exportMultipleClips(clips: VideoClip[]): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg.loaded) {
      throw new Error('FFmpeg가 로드되지 않았습니다.');
    }

    // 파일 목록 생성
    const fileListContent = clips.map((_, index) => `file 'input${index}.mp4'`).join('\n');
    await this.ffmpeg.writeFile('filelist.txt', fileListContent);

    // 각 클립을 FFmpeg에 로드
    for (let i = 0; i < clips.length; i++) {
      const inputData = await fetchFile(clips[i].file);
      await this.ffmpeg.writeFile(`input${i}.mp4`, inputData);
    }

    // 클립들을 연결
    await this.ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'filelist.txt',
      '-c:v', FFMPEG_CONFIG.videoCodec,
      '-preset', FFMPEG_CONFIG.preset,
      '-crf', FFMPEG_CONFIG.crf,
      '-c:a', FFMPEG_CONFIG.audioCodec,
      '-b:a', FFMPEG_CONFIG.audioBitrate,
      'output.mp4'
    ]);

    const outputData = await this.ffmpeg.readFile('output.mp4');
    const outputBlob = new Blob([outputData], { type: 'video/mp4' });

    // 임시 파일 정리
    await this.ffmpeg.deleteFile('filelist.txt');
    await this.ffmpeg.deleteFile('output.mp4');
    for (let i = 0; i < clips.length; i++) {
      await this.ffmpeg.deleteFile(`input${i}.mp4`);
    }

    return outputBlob;
  }
}
