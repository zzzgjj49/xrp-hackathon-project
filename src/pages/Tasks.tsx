import { useState, useEffect, useRef } from 'react'
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import XRPLService from '../services/xrpl'
import { useTranslation } from 'react-i18next'

interface Task {
  id: string
  reward: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'social' | 'development' | 'content'
  deadline: string
  status: 'available' | 'inProgress' | 'submitted' | 'approved' | 'rejected'
}

interface Submission {
  taskId: string
  evidence: string
  status: 'Pending' | 'Approved' | 'Rejected'
  submittedAt: string
  reward?: number
}

interface HistoryApproved {
  taskId: string
  amount: number
  createdAt: string
}

interface HistorySlash {
  orderId: string
  amount: number
  reason: string
  createdAt: string
}

export default function Tasks() {
  const { t, i18n } = useTranslation('common')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [evidence, setEvidence] = useState<string>('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitSectionRef = useRef<HTMLDivElement | null>(null)
  const [approvedHistory, setApprovedHistory] = useState<HistoryApproved[]>([])
  const [slashHistory, setSlashHistory] = useState<HistorySlash[]>([])
  const [acceptedTasks, setAcceptedTasks] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const getText = (key: string) => {
    return t(key)
  }

  

  // Mock tasks data
  const mockTasks: Task[] = [
    {
      id: '1',
      reward: 50,
      difficulty: 'easy',
      category: 'social',
      deadline: '2024-01-15',
      status: 'available'
    },
    {
      id: '2',
      reward: 100,
      difficulty: 'medium',
      category: 'development',
      deadline: '2024-01-20',
      status: 'available'
    },
    {
      id: '3',
      reward: 200,
      difficulty: 'hard',
      category: 'content',
      deadline: '2024-01-25',
      status: 'available'
    },
    {
      id: '4',
      reward: 150,
      difficulty: 'hard',
      category: 'development',
      deadline: '2024-01-18',
      status: 'available'
    }
  ]

  useEffect(() => {
    // Initialize XRPL service
    const service = new XRPLService()
    setXrplService(service)

    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        await service.connect()
        // Mock wallet connection
        setWalletAddress('rN7n7otQD9VcF7mqM7fQ8bW6kKZ7nN3sT')
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect to XRPL:', error)
      }
    }
    
    checkConnection()

    // Load existing submissions from localStorage
    const savedSubmissions = localStorage.getItem('taskSubmissions')
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions))
    }

    const accepted = localStorage.getItem('acceptedTasks')
    if (accepted) {
      try {
        const arr: string[] = JSON.parse(accepted)
        setAcceptedTasks(new Set(arr))
      } catch {}
    }

    const openId = localStorage.getItem('openSubmitFor')
    if (openId) {
      const found = mockTasks.find(t => t.id === openId)
      if (found) {
        setSelectedTask(found)
        setTimeout(() => {
          submitSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 0)
      }
      localStorage.removeItem('openSubmitFor')
    }

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-600/20'
      case 'medium': return 'text-yellow-400 bg-yellow-600/20'
      case 'hard': return 'text-red-400 bg-red-600/20'
      default: return 'text-slate-400 bg-slate-600/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-blue-400'
      case 'inProgress': return 'text-yellow-400'
      case 'submitted': return 'text-purple-400'
      case 'approved': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-400" />
      case 'Pending': return <Clock className="w-5 h-5 text-yellow-400" />
      default: return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const handleSubmitTask = async () => {
    if (!selectedTask || !evidence.trim()) {
      alert(t('error.taskSelectEvidence'))
      return
    }

    if (!walletAddress) {
      alert(t('error.connectWallet'))
      return
    }

    setIsSubmitting(true)

    try {
      // Mock submission - in real app, this would upload to IPFS and create XRPL transaction
      const newSubmission: Submission = {
        taskId: selectedTask.id,
        evidence: evidence,
        status: 'Pending',
        submittedAt: new Date().toISOString()
      }

      // Save to localStorage
      const updatedSubmissions = [...submissions, newSubmission]
      setSubmissions(updatedSubmissions)
      localStorage.setItem('taskSubmissions', JSON.stringify(updatedSubmissions))

      // Update task status
      selectedTask.status = 'submitted'

      alert(t('tasks.submit'))
      
      // Reset form
      setSelectedTask(null)
      setEvidence('')
    } catch (error) {
      console.error('Submit failed:', error)
      alert(t('error.taskSubmitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }



  const goToSubmit = (task: Task) => {
    setSelectedTask(task)
    setTimeout(() => {
      submitSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const acceptTask = (task: Task) => {
    const saved = localStorage.getItem('acceptedTasks')
    const arr = saved ? JSON.parse(saved) as string[] : []
    if (!arr.includes(task.id)) arr.push(task.id)
    localStorage.setItem('acceptedTasks', JSON.stringify(arr))
    setAcceptedTasks(prev => new Set([...Array.from(prev), task.id]))
    navigate(`/tasks/${task.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">タスク</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-green-400">利用可能なタスク</h2>
            <div className="space-y-4">
              {mockTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-slate-800 rounded-xl p-6 border transition-all cursor-pointer ${
                    selectedTask?.id === task.id
                      ? 'border-green-500 bg-slate-700'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold">
                      {task.id === '1' ? 'ソーシャルメディアエンゲージメント' :
                       task.id === '2' ? 'バグ報告とフィードバック' :
                       task.id === '3' ? '技術記事の作成' :
                       task.id === '4' ? 'スマートコントラクトの監査' : 'タスク'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty === 'easy' ? '簡単' :
                         task.difficulty === 'medium' ? '中等度' :
                         task.difficulty === 'hard' ? '困難' : task.difficulty}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'available' ? '利用可能' :
                         task.status === 'inProgress' ? '進行中' :
                         task.status === 'submitted' ? '提出済み' :
                         task.status === 'approved' ? '承認済み' :
                         task.status === 'rejected' ? '拒否済み' : task.status}
                      </span>
                      {acceptedTasks.has(task.id) && (
                        <span className="text-sm font-medium text-green-400">承諾済み</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4">
                    {task.id === '1' ? 'Twitter、Discord、Telegramでプロジェクトを宣伝。500以上のインプレッションと50以上のエンゲージメントを達成。' :
                     task.id === '2' ? 'バグを見つけ、詳細な再現手順とスクリーンショットを含む報告書を提出。' :
                     task.id === '3' ? 'XRPLステーキングメカニズムに関する技術記事を作成。Mediumに公開し200以上のビューを獲得。' :
                     task.id === '4' ? 'スマートコントラクトのコード監査を実施し、セキュリティレポートを提出。' : 'タスクの詳細'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>💰 {task.reward} ポイント</span>
                      <span>📁 {task.category === 'social' ? 'ソーシャル' :
                            task.category === 'development' ? '開発' :
                            task.category === 'content' ? 'コンテンツ' :
                            task.category === 'bug' ? 'バグ' : task.category}</span>
                      <span>📅 期限: {task.deadline}</span>
                    </div>
                    {selectedTask?.id === task.id && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {selectedTask?.id === task.id && (
                    <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <h4 className="font-medium mb-3 text-green-400">タスク詳細</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-800 rounded-lg p-3">
                          <span className="text-slate-400 mr-2">ポイント:</span>
                          <span className="text-white">{task.reward}</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <span className="text-white">{getText(`difficulty.${task.difficulty}`)}</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <span className="text-white">{getText(`category.${task.category}`)}</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <span className="text-slate-400 mr-2">期限:</span>
                          <span className="text-white">{task.deadline}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <button
                          onClick={() => acceptTask(task)}
                          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          承諾する
                        </button>
                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          詳細を見る
                        </button>
                        <button
                          onClick={() => goToSubmit(task)}
                          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          提出する
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Submission */}
          <div className="space-y-6" ref={submitSectionRef}>
            {/* Submit Task */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 text-green-400">タスク提出</h2>
              
              {selectedTask ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h3 className="font-bold mb-2">
                      {selectedTask.id === '1' ? 'ソーシャルメディアエンゲージメント' :
                       selectedTask.id === '2' ? 'バグ報告とフィードバック' :
                       selectedTask.id === '3' ? '技術記事の作成' :
                       selectedTask.id === '4' ? 'スマートコントラクトの監査' : 'タスク'}
                    </h3>
                    <p className="text-sm text-slate-300 mb-2">
                      {selectedTask.id === '1' ? 'Twitter、Discord、Telegramでプロジェクトを宣伝。500以上のインプレッションと50以上のエンゲージメントを達成。' :
                       selectedTask.id === '2' ? 'バグを見つけ、詳細な再現手順とスクリーンショットを含む報告書を提出。' :
                       selectedTask.id === '3' ? 'XRPLステーキングメカニズムに関する技術記事を作成。Mediumに公開し200以上のビューを獲得。' :
                       selectedTask.id === '4' ? 'スマートコントラクトのコード監査を実施し、セキュリティレポートを提出。' : 'タスクの詳細'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>💰 {selectedTask.reward} ポイント</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty === 'easy' ? '簡単' :
                         selectedTask.difficulty === 'medium' ? '中等度' :
                         selectedTask.difficulty === 'hard' ? '困難' : selectedTask.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">証明資料</label>
                    <textarea
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder="タスクの完了を証明する情報を入力してください"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">クリックしてファイルをアップロード</p>
                      <p className="text-xs text-slate-500">画像またはPDF、最大10MB</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitTask}
                    disabled={!walletAddress || isSubmitting || !evidence.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? '提出中...' : '提出する'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">タスクを選択して提出を開始してください</p>
              )}
            </div>

          {/* Recent Submissions */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400">最近の提出</h2>
              
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(-5).reverse().map((submission, index) => {
                    const task = mockTasks.find(t => t.id === submission.taskId)
                    return (
                      <div key={index} className="bg-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">
                            {task ? (
                              task.id === '1' ? 'ソーシャルメディアエンゲージメント' :
                              task.id === '2' ? 'バグ報告とフィードバック' :
                              task.id === '3' ? '技術記事の作成' :
                              task.id === '4' ? 'スマートコントラクトの監査' : 'タスク'
                            ) : '不明なタスク'}
                          </h4>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                          {submission.reward && (
                            <span className="text-green-400">+{submission.reward} ポイント</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">提出はまだありません</p>
              )}
            </div>
          </div>

          {/* Task History */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400">履歴</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">承認済み</h3>
                {approvedHistory.length > 0 ? (
                  <div className="space-y-2">
                    {approvedHistory.map((h, idx) => (
                      <div key={idx} className="bg-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                        <span className="text-slate-300">
                          {h.taskId === '1' ? 'ソーシャルメディアエンゲージメント' :
                           h.taskId === '2' ? 'バグ報告とフィードバック' :
                           h.taskId === '3' ? '技術記事の作成' :
                           h.taskId === '4' ? 'スマートコントラクトの監査' : 'タスク'}
                        </span>
                        <span className="text-green-400">+{Number(h.amount)} ポイント</span>
                        <span className="text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">承認済みの提出はまだありません</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">スラッシュ履歴</h3>
                {slashHistory.length > 0 ? (
                  <div className="space-y-2">
                    {slashHistory.map((s, idx) => (
                      <div key={idx} className="bg-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                        <span className="text-slate-300">{s.reason}</span>
                        <span className="text-red-400">-{Number(s.amount)}</span>
                        <span className="text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">スラッシュ履歴はありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}