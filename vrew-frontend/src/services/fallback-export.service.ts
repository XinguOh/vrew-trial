import type { VideoClip } from "../types";

export class FallbackExportService {
  /**
   * FFmpeg가 로드되지 않는 경우 브라우저의 기본 기능을 사용한 간단한 내보내기
   */
  static async exportWithBrowserAPI(clips: VideoClip[]): Promise<{ blob: Blob; filename: string }> {
    if (clips.length === 0) {
      throw new Error('추출할 클립이 없습니다.');
    }

    // 단일 클립인 경우 원본 파일을 그대로 제공
    if (clips.length === 1) {
      const clip = clips[0];
      return {
        blob: clip.file,
        filename: `exported_${clip.name}`
      };
    }

    // 여러 클립인 경우 Canvas와 MediaRecorder를 사용한 병합 시도
    try {
      console.log('Canvas와 MediaRecorder를 사용하여 클립 병합 시도...');
      return await this.mergeClipsWithCanvas(clips);
    } catch (canvasError) {
      console.warn('Canvas 병합 실패:', canvasError);
      
      // Canvas 병합 실패 시 개별 다운로드 제공
      console.log('개별 클립 다운로드로 fallback...');
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
    
    return new Promise((resolve, reject) => {
      firstVideo.addEventListener('loadedmetadata', async () => {
        try {
          canvas.width = firstVideo.videoWidth;
          canvas.height = firstVideo.videoHeight;
          
          // MediaRecorder 설정
          const stream = canvas.captureStream(30); // 30 FPS
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9'
          });
          
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            URL.revokeObjectURL(firstVideo.src);
            resolve({
              blob,
              filename: `merged_video_${Date.now()}.webm`
            });
          };
          
          // 녹화 시작
          mediaRecorder.start();
          
          // 각 클립을 순차적으로 재생하며 Canvas에 그리기
          await this.playClipsSequentially(clips, ctx, canvas);
          
          // 녹화 종료
          mediaRecorder.stop();
          
        } catch (error) {
          URL.revokeObjectURL(firstVideo.src);
          reject(error);
        }
      });
      
      firstVideo.addEventListener('error', () => {
        URL.revokeObjectURL(firstVideo.src);
        reject(new Error('첫 번째 비디오 로드 실패'));
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
      
      await new Promise<void>((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          video.play();
        });
        
        video.addEventListener('timeupdate', () => {
          // 비디오 프레임을 Canvas에 그리기
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        });
        
        video.addEventListener('ended', () => {
          URL.revokeObjectURL(video.src);
          resolve();
        });
        
        video.addEventListener('error', () => {
          URL.revokeObjectURL(video.src);
          reject(new Error(`클립 ${i + 1} 재생 실패`));
        });
      });
    }
  }

  /**
   * 클립들을 개별적으로 ZIP 파일로 묶어서 내보내기
   */
  static async exportAsZip(clips: VideoClip[]): Promise<{ blob: Blob; filename: string }> {
    // 이 기능은 추후 JSZip 라이브러리를 사용하여 구현할 수 있습니다
    throw new Error('ZIP 내보내기는 아직 구현되지 않았습니다.');
  }

  /**
   * 사용자에게 수동 다운로드 옵션 제공
   */
  static provideManualDownloadOptions(clips: VideoClip[]): void {
    if (clips.length === 0) return;

    const downloadLinks = clips.map((clip, index) => {
      const url = URL.createObjectURL(clip.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clip_${index + 1}_${clip.name}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // 사용자가 클릭할 수 있도록 약간의 지연을 둡니다
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 100);
    });

    console.log('모든 클립을 개별적으로 다운로드 중...');
  }
}
