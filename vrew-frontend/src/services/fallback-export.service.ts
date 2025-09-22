import type { VideoClip } from "../types";

export class FallbackExportService {
  /**
   * FFmpeg가 로드되지 않는 경우 브라우저의 기본 기능을 사용한 간단한 내보내기
   */
  static async exportWithBrowserAPI(clips: VideoClip[]): Promise<{ blob: Blob; filename: string }> {
    if (clips.length === 0) {
      throw new Error('추출할 클립이 없습니다.');
    }

    console.log(`🔄 Fallback 내보내기 시작 - 클립 개수: ${clips.length}`);

    // 단일 클립인 경우 원본 파일을 그대로 제공
    if (clips.length === 1) {
      const clip = clips[0];
      console.log('✅ 단일 클립 - 원본 파일 반환');
      return {
        blob: clip.file,
        filename: `exported_${clip.name}`
      };
    }

    // 여러 클립인 경우 Canvas와 MediaRecorder를 사용한 병합 시도
    try {
      console.log('🎨 Canvas와 MediaRecorder를 사용하여 클립 병합 시도...');
      return await this.mergeClipsWithCanvas(clips);
    } catch (canvasError) {
      console.warn('❌ Canvas 병합 실패:', canvasError);
      
      // Canvas 병합 실패 시 개별 다운로드 제공
      console.log('📁 개별 클립 다운로드로 fallback...');
      this.provideManualDownloadOptions(clips);
      
      // 첫 번째 클립만 반환 (사용자에게 개별 다운로드가 시작됨을 알림)
      const firstClip = clips[0];
      return {
        blob: firstClip.file,
        filename: `exported_${firstClip.name.replace(/\.[^/.]+$/, '')}_and_others_downloaded_separately.mp4`
      };
    }
  }

  /**
   * Canvas와 MediaRecorder를 사용한 클립 병합
   */
  private static async mergeClipsWithCanvas(clips: VideoClip[]): Promise<{ blob: Blob; filename: string }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
    }

    // 첫 번째 비디오의 크기를 기준으로 Canvas 설정
    const firstVideo = document.createElement('video');
    firstVideo.src = URL.createObjectURL(clips[0].file);
    firstVideo.muted = true; // 음소거로 자동 재생 허용
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(firstVideo.src);
        reject(new Error('비디오 로딩 타임아웃'));
      }, 10000); // 10초 타임아웃
      
      firstVideo.addEventListener('loadedmetadata', async () => {
        try {
          clearTimeout(timeout);
          canvas.width = firstVideo.videoWidth;
          canvas.height = firstVideo.videoHeight;
          
          console.log(`📐 Canvas 크기 설정: ${canvas.width}x${canvas.height}`);
          
          // MediaRecorder 설정 (더 호환성 있는 형식들 시도)
          const stream = canvas.captureStream(30); // 30 FPS
          let mediaRecorder: MediaRecorder;
          
          // 지원되는 MIME 타입 확인
          const mimeTypes = [
            'video/webm; codecs=vp9',
            'video/webm; codecs=vp8',
            'video/webm',
            'video/mp4'
          ];
          
          let selectedMimeType = '';
          for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
              selectedMimeType = mimeType;
              break;
            }
          }
          
          if (!selectedMimeType) {
            throw new Error('지원되는 비디오 형식이 없습니다.');
          }
          
          console.log(`🎥 선택된 MIME 타입: ${selectedMimeType}`);
          mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
          
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
              console.log(`📦 데이터 청크 수신: ${event.data.size} bytes`);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: selectedMimeType });
            URL.revokeObjectURL(firstVideo.src);
            console.log(`✅ 병합 완료: ${blob.size} bytes`);
            resolve({
              blob,
              filename: `merged_video_${Date.now()}.${selectedMimeType.includes('webm') ? 'webm' : 'mp4'}`
            });
          };
          
          mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder 오류:', event);
            URL.revokeObjectURL(firstVideo.src);
            reject(new Error('MediaRecorder 오류 발생'));
          };
          
          // 녹화 시작
          mediaRecorder.start(1000); // 1초마다 데이터 수집
          console.log('🎬 녹화 시작');
          
          // 각 클립을 순차적으로 재생하며 Canvas에 그리기
          await this.playClipsSequentially(clips, ctx, canvas);
          
          // 녹화 종료
          mediaRecorder.stop();
          console.log('🛑 녹화 종료');
          
        } catch (error) {
          clearTimeout(timeout);
          URL.revokeObjectURL(firstVideo.src);
          reject(error);
        }
      });
      
      firstVideo.addEventListener('error', (e) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(firstVideo.src);
        reject(new Error(`첫 번째 비디오 로드 실패: ${e}`));
      });
    });
  }

  /**
   * 클립들을 순차적으로 재생하며 Canvas에 그리기
   */
  private static async playClipsSequentially(clips: VideoClip[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): Promise<void> {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const video = document.createElement('video');
      video.src = URL.createObjectURL(clip.file);
      video.muted = true; // 음소거로 자동 재생 허용
      video.crossOrigin = 'anonymous'; // CORS 문제 방지
      
      console.log(`🎬 클립 ${i + 1}/${clips.length} 재생 시작: ${clip.name}`);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(video.src);
          reject(new Error(`클립 ${i + 1} 로딩 타임아웃`));
        }, 15000); // 15초 타임아웃
        
        let isPlaying = false;
        let lastFrameTime = 0;
        
        video.addEventListener('loadedmetadata', () => {
          console.log(`📐 클립 ${i + 1} 메타데이터 로드 완료: ${video.videoWidth}x${video.videoHeight}`);
          video.play().catch(error => {
            console.error(`재생 실패:`, error);
            clearTimeout(timeout);
            URL.revokeObjectURL(video.src);
            reject(new Error(`클립 ${i + 1} 재생 실패: ${error.message}`));
          });
        });
        
        video.addEventListener('play', () => {
          isPlaying = true;
          console.log(`▶️ 클립 ${i + 1} 재생 시작`);
        });
        
        video.addEventListener('timeupdate', () => {
          if (isPlaying && video.currentTime !== lastFrameTime) {
            // 비디오 프레임을 Canvas에 그리기 (비율 유지)
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = canvas.width / canvas.height;
            
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;
            
            if (videoAspect > canvasAspect) {
              // 비디오가 더 넓음 - 높이를 맞추고 좌우에 여백
              drawHeight = canvas.height;
              drawWidth = drawHeight * videoAspect;
              offsetX = (canvas.width - drawWidth) / 2;
            } else {
              // 비디오가 더 높음 - 너비를 맞추고 상하에 여백
              drawWidth = canvas.width;
              drawHeight = drawWidth / videoAspect;
              offsetY = (canvas.height - drawHeight) / 2;
            }
            
            // 배경을 검은색으로 채우기
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 비디오 그리기
            ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
            lastFrameTime = video.currentTime;
          }
        });
        
        video.addEventListener('ended', () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(video.src);
          console.log(`✅ 클립 ${i + 1} 재생 완료`);
          resolve();
        });
        
        video.addEventListener('error', (e) => {
          clearTimeout(timeout);
          URL.revokeObjectURL(video.src);
          console.error(`❌ 클립 ${i + 1} 오류:`, e);
          reject(new Error(`클립 ${i + 1} 재생 실패: ${e}`));
        });
      });
    }
    
    console.log('🎉 모든 클립 재생 완료');
  }

  /**
   * 클립들을 개별적으로 ZIP 파일로 묶어서 내보내기
   */
  static async exportAsZip(_clips: VideoClip[]): Promise<{ blob: Blob; filename: string }> {
    // 이 기능은 추후 JSZip 라이브러리를 사용하여 구현할 수 있습니다
    throw new Error('ZIP 내보내기는 아직 구현되지 않았습니다.');
  }

  /**
   * 사용자에게 수동 다운로드 옵션 제공
   */
  static provideManualDownloadOptions(clips: VideoClip[]): void {
    if (clips.length === 0) return;

    console.log(`📁 개별 다운로드 시작 - ${clips.length}개 클립`);
    
    // 사용자에게 알림
    const message = `⚠️ FFmpeg 로드 실패 및 브라우저 병합 실패로 인해 각 클립을 개별적으로 다운로드합니다.\n\n총 ${clips.length}개 클립이 0.5초 간격으로 다운로드됩니다.`;
    
    if (confirm(message + '\n\n계속하시겠습니까?')) {
      clips.forEach((clip, index) => {
        setTimeout(() => {
          try {
            const link = document.createElement('a');
            link.href = clip.url;
            link.download = `clip_${index + 1}_${clip.name}`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`📥 클립 ${index + 1} 다운로드 시작: ${clip.name}`);
          } catch (error) {
            console.error(`❌ 클립 ${index + 1} 다운로드 실패:`, error);
          }
        }, index * 500); // 0.5초 간격으로 다운로드
      });
      
      // 모든 다운로드 완료 후 URL 정리
      setTimeout(() => {
        clips.forEach(clip => {
          URL.revokeObjectURL(clip.url);
        });
        console.log('🧹 모든 URL 정리 완료');
      }, clips.length * 500 + 1000);
    }
  }
}
