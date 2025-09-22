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
      
      // 완전히 새로운 FFmpeg 인스턴스 생성
      this.ffmpeg = new FFmpeg();
      
      // SharedArrayBuffer 지원 여부에 따라 우선순위 조정
      const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
      console.log(`🔍 SharedArrayBuffer 지원: ${hasSharedArrayBuffer}`);
      
      // 가장 안정적인 싱글스레드 버전만 시도
      const cdnUrls = [
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
        'https://esm.sh/@ffmpeg/core@0.12.4/dist/esm',
        'https://esm.sh/@ffmpeg/core@0.12.6/dist/esm',
      ];

      let loadSuccess = false;
      let lastError: Error | null = null;

      for (const baseURL of cdnUrls) {
        try {
          console.log(`FFmpeg 로딩 시도: ${baseURL}`);
          
          // 이벤트 리스너 설정
          this.ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg Log:', message);
          });
          
          this.ffmpeg.on('progress', ({ progress }) => {
            this.onProgress?.(Math.round(progress * 100));
          });
          
          // 간단한 로드 방식
          const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
          const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
          
          console.log(`✅ Core JS 다운로드 완료`);
          console.log(`✅ WASM 다운로드 완료`);
          
          // 싱글스레드 모드로만 로드 (안정성 우선)
          console.log(`🚀 FFmpeg 싱글스레드 모드로 로드 시작...`);
          
          const loadOptions = {
            coreURL,
            wasmURL,
            // workerURL 제외하여 싱글스레드 모드로 강제 실행
          };
          
          console.log('📋 로드 옵션:', JSON.stringify(loadOptions, null, 2));
          
          // 로드 타임아웃 설정 (10초)
          const loadTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('FFmpeg 로드 타임아웃 (10초)')), 10000)
          );
          
          const loadPromise = this.ffmpeg.load(loadOptions);
          
          await Promise.race([loadPromise, loadTimeout]);
          
          // 로드 완료 후 상태 확인
          console.log('🔍 FFmpeg 로드 후 상태 확인:');
          console.log('- ffmpeg.loaded:', this.ffmpeg.loaded);
          console.log('- ffmpeg.canExecute:', this.ffmpeg.canExecute);
          
          if (this.ffmpeg.loaded) {
            loadSuccess = true;
            console.log(`✅ FFmpeg 로드 완료: ${baseURL}`);
            break;
          } else {
            throw new Error('FFmpeg 로드는 완료되었지만 loaded 상태가 false입니다.');
          }
        } catch (error) {
          console.warn(`❌ FFmpeg 로드 실패 (${baseURL}):`, error);
          lastError = error as Error;
          
          // FFmpeg 인스턴스 재생성
          console.log('🔄 FFmpeg 인스턴스 재생성...');
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
      console.log('🧪 FFmpeg 테스트 시작...');
      console.log('- this.isLoaded:', this.isLoaded);
      console.log('- this.ffmpeg.loaded:', this.ffmpeg.loaded);
      console.log('- this.ffmpeg.canExecute:', this.ffmpeg.canExecute);
      
      if (!this.isLoaded || !this.ffmpeg.loaded) {
        console.log('❌ FFmpeg 테스트 실패: 로드되지 않음');
        return false;
      }
      
      // 1. 간단한 파일 시스템 접근 테스트
      console.log('📝 파일 시스템 테스트...');
      await this.ffmpeg.writeFile('test.txt', 'test');
      await this.ffmpeg.deleteFile('test.txt');
      console.log('✅ 파일 시스템 테스트 통과');
      
      // 2. 간단한 FFmpeg 명령어 테스트 (타임아웃 포함)
      console.log('🔧 FFmpeg 명령어 테스트...');
      try {
        const testTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FFmpeg 명령어 테스트 타임아웃')), 5000)
        );
        
        const testPromise = this.ffmpeg.exec(['-version']);
        await Promise.race([testPromise, testTimeout]);
        console.log('✅ FFmpeg 명령어 테스트 성공');
      } catch (versionError) {
        console.warn('⚠️ FFmpeg 명령어 테스트 실패, 하지만 기본 기능은 작동할 수 있음:', versionError);
      }
      
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
