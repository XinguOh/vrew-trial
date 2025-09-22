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
      
      // 로컬 파일 우선, 그 다음 CDN 시도
      const cdnUrls = [
        // 로컬 파일 (CORS 문제 없음)
        '/ffmpeg',
        
        // 안정적인 CDN들 (멀티스레드 우선 - 더 안정적)
        'https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm',
        'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm',
        'https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/esm',
        
        // 싱글스레드 버전들
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm',
        
        // 대체 CDN들
        'https://esm.sh/@ffmpeg/core-mt@0.12.4/dist/esm',
        'https://esm.sh/@ffmpeg/core-mt@0.12.6/dist/esm',
        'https://esm.sh/@ffmpeg/core@0.12.4/dist/esm',
        'https://esm.sh/@ffmpeg/core@0.12.6/dist/esm'
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
          
          // 타임아웃과 함께 URL 유효성 체크 (더 긴 타임아웃)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('타임아웃: FFmpeg 로딩이 너무 오래 걸립니다 (60초)')), 60000)
          );
          
          const loadPromise = (async () => {
            console.log(`📦 FFmpeg 파일 다운로드 시작: ${baseURL}`);
            
            // 로컬 파일인지 CDN인지 확인
            const isLocal = baseURL.startsWith('/');
            
            try {
              const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
              console.log(`✅ Core JS 다운로드 완료: ${coreURL.substring(0, 50)}...`);
              
              const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
              console.log(`✅ WASM 다운로드 완료: ${wasmURL.substring(0, 50)}...`);
              
              // Worker 파일은 멀티스레드 버전에서만 필요
              let workerURL: string | undefined;
              if (baseURL.includes('core-mt') || isLocal) {
                try {
                  workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
                  console.log(`✅ Worker JS 다운로드 완료: ${workerURL.substring(0, 50)}...`);
                } catch (workerError) {
                  console.warn(`⚠️ Worker JS 다운로드 실패, 싱글스레드 모드로 진행: ${workerError}`);
                  workerURL = undefined;
                }
              }
              
              console.log(`🚀 FFmpeg 로드 시작...`);
              await this.ffmpeg.load({
                coreURL,
                wasmURL,
                workerURL,
              });
              console.log(`✅ FFmpeg 로드 완료!`);
            } catch (fileError) {
              console.error(`❌ 파일 다운로드 실패 (${baseURL}):`, fileError);
              throw fileError;
            }
          })();
          
          await Promise.race([loadPromise, timeoutPromise]);
          
          // 로드 후 실제 사용 가능한지 테스트
          if (this.ffmpeg.loaded) {
            loadSuccess = true;
            console.log(`✅ FFmpeg 로드 및 검증 완료: ${baseURL}`);
            break;
          } else {
            throw new Error('FFmpeg 로드는 완료되었지만 사용할 수 없습니다.');
          }
        } catch (error) {
          console.warn(`❌ FFmpeg 로드 실패 (${baseURL}):`, error);
          lastError = error as Error;
          
          // 오류 타입별 상세 로그
          if (error instanceof Error) {
            if (error.message.includes('fetch') || error.message.includes('network')) {
              console.warn('🌐 네트워크 문제로 인한 FFmpeg 로드 실패');
            } else if (error.message.includes('wasm') || error.message.includes('WebAssembly')) {
              console.warn('🔧 WebAssembly 지원 문제로 인한 FFmpeg 로드 실패');
            } else if (error.message.includes('타임아웃')) {
              console.warn('⏰ 타임아웃으로 인한 FFmpeg 로드 실패');
            } else {
              console.warn('❓ 알 수 없는 이유로 FFmpeg 로드 실패:', error.message);
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
    const canExecute = this.ffmpeg.canExecute;
    
    console.log(`FFmpeg 상태 체크 - 서비스: ${serviceLoaded}, 인스턴스: ${instanceLoaded}, 실행가능: ${canExecute}, 로딩중: ${this.isLoading}`);
    
    // 더 엄격한 체크: 모든 조건이 true여야 함
    return serviceLoaded && instanceLoaded && canExecute && !this.isLoading;
  }
  
  // FFmpeg가 실제로 작동하는지 테스트하는 메서드
  async testFFmpeg(): Promise<boolean> {
    try {
      if (!this.isLoaded || !this.ffmpeg.loaded) {
        console.log('❌ FFmpeg 테스트 실패: 로드되지 않음');
        return false;
      }
      
      // 더 간단한 테스트: 파일 시스템 접근 테스트
      await this.ffmpeg.writeFile('test.txt', 'test');
      await this.ffmpeg.deleteFile('test.txt');
      console.log('✅ FFmpeg 테스트 성공');
      return true;
    } catch (error) {
      console.error('❌ FFmpeg 테스트 실패:', error);
      return false;
    }
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

  async exportMultipleClips(clips: VideoClip[], fastMode: boolean = false): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg.loaded) {
      throw new Error('FFmpeg가 로드되지 않았습니다.');
    }

    console.log(`🎬 다중 클립 처리 시작 - 클립 수: ${clips.length}, 빠른 모드: ${fastMode}`);

    // 파일 목록 생성
    const fileListContent = clips.map((_, index) => `file 'input${index}.mp4'`).join('\n');
    await this.ffmpeg.writeFile('filelist.txt', fileListContent);

    // 각 클립을 FFmpeg에 로드
    for (let i = 0; i < clips.length; i++) {
      const inputData = await fetchFile(clips[i].file);
      await this.ffmpeg.writeFile(`input${i}.mp4`, inputData);
    }

    if (fastMode) {
      // 빠른 모드: 합치기만 (재인코딩 없음)
      console.log('⚡ 빠른 모드: 합치기만 수행 (재인코딩 없음)');
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy',  // 스트림 복사 (재인코딩 없음)
        'output.mp4'
      ]);
    } else {
      // 고품질 모드: 합치기 + 인코딩
      console.log('🎨 고품질 모드: 합치기 + 인코딩 수행');
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c:v', FFMPEG_CONFIG.videoCodec,    // 비디오 재인코딩
        '-preset', FFMPEG_CONFIG.preset,
        '-crf', FFMPEG_CONFIG.crf,
        '-c:a', FFMPEG_CONFIG.audioCodec,    // 오디오 재인코딩
        '-b:a', FFMPEG_CONFIG.audioBitrate,
        'output.mp4'
      ]);
    }

    const outputData = await this.ffmpeg.readFile('output.mp4');
    const outputBlob = new Blob([outputData], { type: 'video/mp4' });

    // 임시 파일 정리
    await this.ffmpeg.deleteFile('filelist.txt');
    await this.ffmpeg.deleteFile('output.mp4');
    for (let i = 0; i < clips.length; i++) {
      await this.ffmpeg.deleteFile(`input${i}.mp4`);
    }

    console.log(`✅ 다중 클립 처리 완료 - 크기: ${outputBlob.size} bytes`);
    return outputBlob;
  }
}
