export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private timeoutId: NodeJS.Timeout | null = null
  private maxRecordingTime = 30 // 最大录音时间（秒）

  // 开始录音
  async startRecording(): Promise<void> {
    try {
      // 请求麦克风访问权限
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 创建媒体录制器
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      // 设置事件处理程序
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // 开始录音
      this.mediaRecorder.start()

      // 设置30秒后自动停止
      this.timeoutId = setTimeout(() => {
        if (this.isRecording()) {
          this.stopRecording()
        }
      }, this.maxRecordingTime * 1000)
    } catch (error) {
      console.error("开始录音时出错:", error)
      throw error
    }
  }

  // 停止录音并返回音频URL
  stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("没有正在进行的录音"))
        return
      }

      // 清除超时定时器
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }

      this.mediaRecorder.onstop = () => {
        // 创建音频Blob
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })

        // 为音频Blob创建URL
        const audioUrl = URL.createObjectURL(audioBlob)

        // 停止所有流轨道
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop())
          this.stream = null
        }

        resolve(audioUrl)
      }

      // 停止录音
      this.mediaRecorder.stop()
    })
  }

  // 检查是否正在录音
  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === "recording"
  }

  // 获取最大录音时间
  getMaxRecordingTime(): number {
    return this.maxRecordingTime
  }
}

export default new AudioRecorder()

