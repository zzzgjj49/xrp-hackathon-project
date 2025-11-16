import { useState, useEffect } from 'react'
import { Shield, Users, TrendingUp, Settings, AlertTriangle, CheckCircle, XCircle, Wallet, Link, Unlink, CreditCard } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import XRPLService from '../services/xrpl'
import { useTranslation } from 'react-i18next'

interface ReviewTask {
  id: string
  taskId: string
  userAddress: string
  evidence: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

interface SystemStats {
  pendingReviews: number
  distributedPoints: number
  slashes: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

interface SystemSettings {
  minimumStakeAmount: number
  slashPenaltyRate: number
  baseAPY: number
  emergencyPause: boolean
}

export default function Admin() {
  const { t } = useTranslation('common')
  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>([])
  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null)
  const [verdict, setVerdict] = useState<'approve' | 'reject' | ''>('')
  const [rewardPoints, setRewardPoints] = useState<number>(0)
  const [stats, setStats] = useState<SystemStats>({
    pendingReviews: 3,
    distributedPoints: 1250,
    slashes: 2,
    systemHealth: 'healthy'
  })
  const [settings, setSettings] = useState<SystemSettings>({
    minimumStakeAmount: 100,
    slashPenaltyRate: 5,
    baseAPY: 5.0,
    emergencyPause: false
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Wallet management states
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  // Mock review tasks data
  const mockReviewTasks: ReviewTask[] = [
    {
      id: '1',
      taskId: 'task-1',
      userAddress: 'rN7n7otQD9VcF7mqM7fQ8bW6kKZ7nN3sT',
      evidence: 'ソーシャルメディアでのエンゲージメントを完了しました。500以上のインプレッションと50以上のインタラクション達成。Twitterリンク: https://twitter.com/example/status/123',
      status: 'pending',
      submittedAt: '2024-01-10T10:30:00Z'
    },
    {
      id: '2',
      taskId: 'task-2',
      userAddress: 'rAbCdEfGhIjKlMnOpQrStUvWxYz',
      evidence: '詳細な再現手順とスクリーンショットを含むバグレポートを提出しました。問題はステーキングコントラクトに影響しています。',
      status: 'pending',
      submittedAt: '2024-01-09T14:20:00Z'
    },
    {
      id: '3',
      taskId: 'task-3',
      userAddress: 'rXyZaBcDeFgHiJkLmNoPqRsTuVw',
      evidence: 'XRPLステーキングメカニズムについてのコミュニティ記事を作成しました。Mediumに公開され、200以上のビュー獲得。',
      status: 'pending',
      submittedAt: '2024-01-08T16:45:00Z'
    }
  ]

  useEffect(() => {
    // Initialize XRPL service
    const service = new XRPLService()
    setXrplService(service)

    // Check if user is admin (mock)
    setIsAdmin(true)

    // Load review tasks
    setReviewTasks(mockReviewTasks)

    // Load saved wallet state
    const savedAddress = localStorage.getItem('walletAddress')
    const savedConnection = localStorage.getItem('isWalletConnected')
    if (savedAddress && savedConnection === 'true') {
      setWalletAddress(savedAddress)
      setIsWalletConnected(true)
    }

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  // Wallet management functions
  const connectWallet = () => {
    setShowWalletModal(true)
  }

  const handleManualConnect = async () => {
    if (!xrplService || !manualAddress.trim()) return

    try {
      await xrplService.connect()
      
      // Validate XRP address format (basic validation)
      if (!manualAddress.startsWith('r') || manualAddress.length < 25) {
        alert(t('wallet.modal.address.invalid'))
        return
      }
      
      setWalletAddress(manualAddress.trim())
      setIsWalletConnected(true)
      setShowWalletModal(false)
      
      // Save to localStorage for persistence
      localStorage.setItem('walletAddress', manualAddress.trim())
      localStorage.setItem('isWalletConnected', 'true')
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert(t('error.connectWallet'))
    }
  }

  const handleBrowserWalletConnect = async () => {
    if (!xrplService) return

    try {
      await xrplService.connect()
      
      // Check for browser wallet extension (mock implementation)
      if (typeof window !== 'undefined' && (window as any).xumm) {
        // Mock XUMM wallet connection
        const mockAddress = 'r' + Math.random().toString(36).substr(2, 33).toUpperCase()
        setWalletAddress(mockAddress)
        setIsWalletConnected(true)
        setShowWalletModal(false)
        
        // Save to localStorage for persistence
        localStorage.setItem('walletAddress', mockAddress)
        localStorage.setItem('isWalletConnected', 'true')
        
      } else {
        alert(t('wallet.modal.extension.notFound'))
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert(t('error.connectWallet'))
    }
  }

  const disconnectWallet = async () => {
    if (!xrplService) return

    try {
      await xrplService.disconnect()
      setWalletAddress('')
      setIsWalletConnected(false)
      
      // Clear from localStorage
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('isWalletConnected')
      
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      alert(t('error.disconnectWallet'))
    }
  }

  const handleReviewTask = async () => {
    if (!selectedTask || !verdict) {
      alert('Please select a task and verdict')
      return
    }

    setIsProcessing(true)

    try {
      // Call backend review API
      const apiVerdict = verdict === 'approve' ? 'pass' : 'reject'
      const resp = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.taskId,
          verdict: apiVerdict,
          points: apiVerdict === 'pass' ? rewardPoints : 0,
          evidence: [selectedTask.evidence],
          walletAddress: selectedTask.userAddress
        })
      })

      const data = await resp.json()

      if (resp.ok && data.success) {
        // Update task status
        const updatedTasks: ReviewTask[] = reviewTasks.map(task =>
          task.id === selectedTask.id
            ? { ...task, status: verdict === 'approve' ? 'approved' : 'rejected' }
            : task
        )
        setReviewTasks(updatedTasks)

        // Update stats
        if (verdict === 'approve') {
          setStats(prev => ({
            ...prev,
            pendingReviews: Math.max(prev.pendingReviews - 1, 0),
            distributedPoints: prev.distributedPoints + rewardPoints
          }))
        } else {
          setStats(prev => ({
            ...prev,
            pendingReviews: Math.max(prev.pendingReviews - 1, 0)
          }))
        }

        alert(`Task ${verdict}d successfully! ${verdict === 'approve' ? `${rewardPoints} points awarded.` : ''}`)

        // Reset form
        setSelectedTask(null)
        setVerdict('')
        setRewardPoints(0)
      } else {
        alert(data.error || 'Review failed. Please try again.')
      }
    } catch (error) {
      console.error('Review failed:', error)
      alert('Review failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />
      default: return null
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">アクセス拒否</h1>
          <p className="text-slate-400">このページへのアクセス権限がありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">管理パネル</h1>
          <div className="flex items-center gap-4">
            {/* Wallet Management Link */}
            <RouterLink
              to="/admin/wallets"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              ウォレット管理
            </RouterLink>
            
            {/* Wallet Status */}
            <div className="flex items-center gap-2">
              {isWalletConnected ? (
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-red-400 hover:text-red-300 text-xs"
                    title="接続を解除"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  接続
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {getHealthIcon(stats.systemHealth)}
              <span className={`font-medium ${getHealthColor(stats.systemHealth)}`}>
                システム {stats.systemHealth === 'healthy' ? '正常' : stats.systemHealth === 'warning' ? '警告' : '異常'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-slate-400">保留中のレビュー</span>
            </div>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-sm text-slate-400">配布済みポイント</span>
            </div>
            <div className="text-2xl font-bold">{stats.distributedPoints.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="text-sm text-slate-400">総スラッシュ数</span>
            </div>
            <div className="text-2xl font-bold">{stats.slashes}</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Settings className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-slate-400">システムステータス</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(stats.systemHealth)}`}>
              {stats.systemHealth === 'healthy' ? '正常' : stats.systemHealth === 'warning' ? '警告' : '異常'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Review */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400">タスクレビュー</h2>
            
            {selectedTask ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold">タスク #{selectedTask.taskId}</h3>
                    <span className="text-sm text-slate-400">
                      {new Date(selectedTask.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">ユーザー: {selectedTask.userAddress}</p>
                  <p className="text-sm text-slate-300">証明: {selectedTask.evidence}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">審査結果</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVerdict('approve')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        verdict === 'approve'
                          ? 'border-green-500 bg-green-600/20 text-green-400'
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                      承認
                    </button>
                    <button
                      onClick={() => setVerdict('reject')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        verdict === 'reject'
                          ? 'border-red-500 bg-red-600/20 text-red-400'
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <XCircle className="w-4 h-4 mx-auto mb-1" />
                      拒否
                    </button>
                  </div>
                </div>

                {verdict === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">報酬ポイント</label>
                    <input
                      type="number"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      placeholder="報酬ポイントを入力"
                      min="0"
                    />
                  </div>
                )}

                <button
                  onClick={handleReviewTask}
                  disabled={!verdict || isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {isProcessing ? '処理中...' : 'レビューを提出'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 bg-slate-700 rounded-lg border cursor-pointer transition-all ${
                      selectedTask?.id === task.id
                        ? 'border-green-500 bg-slate-600'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">タスク #{task.taskId}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        task.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {task.status === 'pending' ? '保留中' :
                         task.status === 'approved' ? '承認済み' : '拒否'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">ユーザー: {task.userAddress.slice(0, 20)}...</p>
                    <p className="text-sm text-slate-300 line-clamp-2">証明: {task.evidence}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      提出日: {new Date(task.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Settings */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400">{t('admin.systemStatus')}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">最小ステーク量</label>
                <input
                  type="number"
                  value={settings.minimumStakeAmount}
                  onChange={(e) => setSettings(prev => ({ ...prev, minimumStakeAmount: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">スラッシュ率</label>
                <input
                  type="number"
                  value={settings.slashPenaltyRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, slashPenaltyRate: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">基本APY</label>
                <input
                  type="number"
                  value={settings.baseAPY}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseAPY: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium">一時停止</label>
                  <p className="text-xs text-slate-400">緊急時にシステムを一時停止します</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, emergencyPause: !prev.emergencyPause }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emergencyPause ? 'bg-red-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.emergencyPause ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition-colors">
                設定を保存
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-400">ウォレット接続</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Manual Address Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    手動でアドレスを入力
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="XRPアドレスを入力"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={handleManualConnect}
                    disabled={!manualAddress.trim()}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                  >
                    接続
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">または</span>
                  </div>
                </div>
                
                {/* Browser Extension */}
                <div>
                  <button
                    onClick={handleBrowserWalletConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    ブラウザウォレット
                  </button>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    XummやGemなどのブラウザ拡張機能をサポート
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}