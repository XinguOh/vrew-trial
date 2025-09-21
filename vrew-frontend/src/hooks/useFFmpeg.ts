import { useState, useEffect } from 'react';
import { FFmpegService, FallbackExportService } from '../services';
import type { VideoClip, ExportProgress } from '../types';

export function useFFmpeg() {
  const [ffmpegService] = useState(() => new FFmpegService());
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [ffmpegError, setFFmpegError] = useState<string | null>(null);
  const [exportState, setExportState] = useState<ExportProgress>({
    isExporting: false,
    progress: 0
  });

  useEffect(() => {
    const initializeFFmpeg = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !isFFmpegLoaded) {
        try {
          console.log(`FFmpeg 초기화 시도 ${retryCount + 1}/${maxRetries}`);
          setFFmpegError(null);
          
          await ffmpegService.initialize((progress) => {
            setExportState(prev => ({ ...prev, progress }));
          });
          
          // 초기화 후 실제 테스트 수행
          console.log('🧪 FFmpeg 초기화 후 테스트 시작...');
          const testResult = await ffmpegService.testFFmpeg();
          if (!testResult) {
            throw new Error('FFmpeg 초기화는 완료되었지만 실제 작동 테스트에 실패했습니다.');
          }
          
          setIsFFmpegLoaded(true);
          console.log('✅ FFmpeg 초기화 및 테스트 성공!');
          break;
        } catch (error) {
          retryCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`FFmpeg 초기화 실패 (시도 ${retryCount}/${maxRetries}):`, errorMessage);
          
          if (retryCount >= maxRetries) {
            setFFmpegError(`FFmpeg 로드 실패: ${errorMessage}. 브라우저를 새로고침하거나 다른 브라우저를 시도해보세요.`);
          } else {
            // 재시도 전 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    };

    initializeFFmpeg();
  }, [ffmpegService, isFFmpegLoaded]);

  // FFmpeg 로딩 상태 주기적 체크
  useEffect(() => {
    if (isFFmpegLoaded) return; // 이미 로드된 상태면 체크하지 않음

    const interval = setInterval(() => {
      const actuallyLoaded = ffmpegService.isFFmpegLoaded;
      console.log(`FFmpeg 상태 체크 - 훅 상태: ${isFFmpegLoaded}, 서비스 상태: ${actuallyLoaded}`);
      
      if (actuallyLoaded && !isFFmpegLoaded) {
        console.log('FFmpeg 상태 동기화: 실제로 로드됨');
        setIsFFmpegLoaded(true);
        setFFmpegError(null);
      }
    }, 2000); // 2초로 늘려서 로그 스팸 방지 // 1초마다 체크

    return () => clearInterval(interval);
  }, [ffmpegService, isFFmpegLoaded]);

  const exportVideo = async (clips: VideoClip[]) => {
    // 실제 FFmpeg 서비스 상태를 다시 확인
    const actuallyLoaded = ffmpegService.isFFmpegLoaded;
    
    console.log(`영상 추출 시도 - 훅 상태: ${isFFmpegLoaded}, 서비스 상태: ${actuallyLoaded}, 클립 개수: ${clips.length}`);
    
    // 상태 동기화 문제 해결: 서비스 상태가 true면 훅 상태도 업데이트
    if (actuallyLoaded && !isFFmpegLoaded) {
      console.log('🔄 상태 동기화: 서비스가 로드됨, 훅 상태 업데이트');
      setIsFFmpegLoaded(true);
      setFFmpegError(null);
    }
    
    if (!actuallyLoaded) {
      console.error('FFmpeg 로드 상태 확인 실패 - 서비스 상태가 false');
      throw new Error('FFmpeg가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 실제 FFmpeg 테스트 실행
    console.log('🧪 FFmpeg 실제 작동 테스트 시작...');
    const testResult = await ffmpegService.testFFmpeg();
    if (!testResult) {
      console.error('FFmpeg 테스트 실패');
      throw new Error('FFmpeg가 로드되었지만 실제로 작동하지 않습니다. 페이지를 새로고침하고 다시 시도해주세요.');
    }
    console.log('✅ FFmpeg 테스트 통과');
    
    if (clips.length === 0) {
      throw new Error('추출할 클립이 없습니다.');
    }

    setExportState({ isExporting: true, progress: 0 });

    try {
      let outputBlob: Blob;
      let filename: string;

      if (clips.length === 1) {
        outputBlob = await ffmpegService.exportSingleClip(clips[0]);
        filename = `exported_${clips[0].name.replace(/\.[^/.]+$/, '')}.mp4`;
      } else {
        outputBlob = await ffmpegService.exportMultipleClips(clips);
        filename = `exported_combined_video_${Date.now()}.mp4`;
      }

      return { blob: outputBlob, filename };
    } finally {
      setExportState({ isExporting: false, progress: 0 });
    }
  };

    // FFmpeg 없이도 사용할 수 있는 fallback 내보내기
    const exportVideoFallback = async (clips: VideoClip[]) => {
      console.log('FFmpeg fallback 내보내기 시작');
      setExportState({ isExporting: true, progress: 50 });

      try {
        const result = await FallbackExportService.exportWithBrowserAPI(clips);
        setExportState({ isExporting: false, progress: 100 });
        return result;
      } catch (error) {
        setExportState({ isExporting: false, progress: 0 });
        throw error;
      }
    };

    // FFmpeg 재시도 함수
    const retryFFmpegInitialization = async () => {
      console.log('🔄 FFmpeg 재시도 요청');
      setFFmpegError(null);
      setIsFFmpegLoaded(false);
      
      try {
        // 새로운 FFmpeg 서비스 인스턴스 생성
        const newFFmpegService = new FFmpegService();
        
        await newFFmpegService.initialize((progress) => {
          setExportState(prev => ({ ...prev, progress }));
        });
        
        // 재시도 후 실제 테스트 수행
        console.log('🧪 FFmpeg 재시도 후 테스트 시작...');
        const testResult = await newFFmpegService.testFFmpeg();
        if (!testResult) {
          throw new Error('FFmpeg 재시도는 완료되었지만 실제 작동 테스트에 실패했습니다.');
        }
        
        // 성공 시 기존 서비스 교체
        Object.assign(ffmpegService, newFFmpegService);
        setIsFFmpegLoaded(true);
        console.log('✅ FFmpeg 재시도 및 테스트 성공!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setFFmpegError(`FFmpeg 재시도 실패: ${errorMessage}`);
        console.error('❌ FFmpeg 재시도 실패:', error);
      }
    };

    return {
      isFFmpegLoaded,
      ffmpegError,
      exportState,
      exportVideo,
      exportVideoFallback,
      retryFFmpegInitialization
    };
}
