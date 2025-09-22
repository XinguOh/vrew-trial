import type { Subtitle } from '../types';

export class SubtitleService {
  /**
   * 자막을 SRT 형식으로 변환
   */
  static convertToSRT(subtitles: Subtitle[]): string {
    return subtitles
      .sort((a, b) => a.startTime - b.startTime)
      .map((subtitle, index) => {
        const startTime = this.formatSRTTime(subtitle.startTime);
        const endTime = this.formatSRTTime(subtitle.endTime);
        
        return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
      })
      .join('\n');
  }

  /**
   * 자막을 VTT 형식으로 변환
   */
  static convertToVTT(subtitles: Subtitle[]): string {
    const header = 'WEBVTT\n\n';
    const content = subtitles
      .sort((a, b) => a.startTime - b.startTime)
      .map(subtitle => {
        const startTime = this.formatVTTTime(subtitle.startTime);
        const endTime = this.formatVTTTime(subtitle.endTime);
        
        return `${startTime} --> ${endTime}\n${subtitle.text}\n`;
      })
      .join('\n');
    
    return header + content;
  }

  /**
   * SRT 형식의 시간 포맷팅 (00:00:00,000)
   */
  private static formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * VTT 형식의 시간 포맷팅 (00:00:00.000)
   */
  private static formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  /**
   * 자막 파일을 다운로드
   */
  static downloadSubtitle(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * SRT 파일로 저장
   */
  static saveAsSRT(subtitles: Subtitle[], filename: string = 'subtitles.srt'): void {
    const content = this.convertToSRT(subtitles);
    this.downloadSubtitle(content, filename, 'text/plain');
  }

  /**
   * VTT 파일로 저장
   */
  static saveAsVTT(subtitles: Subtitle[], filename: string = 'subtitles.vtt'): void {
    const content = this.convertToVTT(subtitles);
    this.downloadSubtitle(content, filename, 'text/vtt');
  }

  /**
   * JSON 파일로 저장 (프로젝트 백업용)
   */
  static saveAsJSON(subtitles: Subtitle[], filename: string = 'subtitles.json'): void {
    const content = JSON.stringify(subtitles, null, 2);
    this.downloadSubtitle(content, filename, 'application/json');
  }

  /**
   * 자막 파일을 로드 (JSON 형식)
   */
  static loadFromJSON(file: File): Promise<Subtitle[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const subtitles = JSON.parse(content);
          
          // 기본 유효성 검사
          if (!Array.isArray(subtitles)) {
            throw new Error('유효하지 않은 자막 파일 형식입니다.');
          }
          
          resolve(subtitles);
        } catch (error) {
          reject(new Error('자막 파일을 읽는 중 오류가 발생했습니다.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      };
      
      reader.readAsText(file);
    });
  }
}
