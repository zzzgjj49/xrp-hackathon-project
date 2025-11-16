import { useState, useEffect } from 'react'
import { Wallet, Coins, Trophy, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import XRPLService from '../services/xrpl'

interface DashboardStats {
  totalStaked: number
  totalPoints: number
  taskCompletionRate: number
  yieldRate: number
}

export default function Dashboard() {
  const { t, i18n } = useTranslation('common')
  const [stats, setStats] = useState<DashboardStats>({
    totalStaked: 0,
    totalPoints: 0,
    taskCompletionRate: 0,
    yieldRate: 0
  })
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)
  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    // Initialize XRPL service
    const service = new XRPLService()
    setXrplService(service)

    // Load saved wallet state from localStorage
    const savedAddress = localStorage.getItem('walletAddress')
    const savedConnection = localStorage.getItem('isWalletConnected')
    if (savedAddress && savedConnection === 'true') {
      setWalletAddress(savedAddress)
      setIsConnected(true)
      // Load user stats if wallet is connected
      loadUserStats(savedAddress)
    }

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.language)
    }
    
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  // Listen for wallet state changes from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'walletAddress' || e.key === 'isWalletConnected') {
        const savedAddress = localStorage.getItem('walletAddress')
        const savedConnection = localStorage.getItem('isWalletConnected')
        
        if (savedAddress && savedConnection === 'true') {
          setWalletAddress(savedAddress)
          setIsConnected(true)
          loadUserStats(savedAddress)
        } else {
          setWalletAddress('')
          setIsConnected(false)
          setStats({
            totalStaked: 0,
            totalPoints: 0,
            taskCompletionRate: 0,
            yieldRate: 0
          })
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const connectWallet = async () => {
    // Navigate to admin page for wallet management
    window.location.href = '/admin'
  }

  const loadUserStats = async (address: string) => {
    try {
      const resp = await fetch(`/api/points/${address}`)
      const data = await resp.json()

      if (resp.ok && data.success) {
        setStats({
          totalStaked: 1500,
          totalPoints: data.totalPoints,
          taskCompletionRate: 85,
          yieldRate: 5.2
        })
      } else {
        // Fallback to mock
        setStats({
          totalStaked: 1500,
          totalPoints: 2750,
          taskCompletionRate: 85,
          yieldRate: 5.2
        })
      }
    } catch (e) {
      console.error('Failed to load points:', e)
      setStats({
        totalStaked: 1500,
        totalPoints: 2750,
        taskCompletionRate: 85,
        yieldRate: 5.2
      })
    }
  }

  const quickStake = async (amount: number, duration: number) => {
    // Check if wallet is connected by looking for wallet address
    if (!walletAddress) {
      alert(t('error.connectWallet'))
      return
    }

    try {
      // Mock staking - in real app, this would create actual XRPL transaction
      console.log(`Staking ${amount} XRP for ${duration} days`)
      alert(t('error.stakingFailed'))
      
      // Update stats to reflect successful stake
      setStats(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + amount
      }))
    } catch (error) {
      console.error('Stake failed:', error)
      alert(t('error.stakingFailed'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">XRPタスクプラットフォーム</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-8 h-8 text-green-400" />
              <span className="text-sm text-slate-400">総ステーク量</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalStaked.toLocaleString()} XRP</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-yellow-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="text-sm text-slate-400">総ポイント</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-slate-400">タスク完了率</span>
            </div>
            <div className="text-2xl font-bold">{stats.taskCompletionRate}%</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-slate-400">利回り</span>
            </div>
            <div className="text-2xl font-bold">{stats.yieldRate}%</div>
          </div>
        </div>

        {/* Quick Stake Card */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-xl font-bold mb-6 text-green-400">クイックステーク</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => quickStake(100, 7)}
              disabled={!walletAddress}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed p-4 rounded-lg text-center transition-colors transform hover:scale-105"
            >
              <div className="text-lg font-bold">100 XRP</div>
              <div className="text-sm text-green-200">7 日間</div>
              <div className="text-xs text-green-300 mt-1">~2.5% APY</div>
            </button>
            <button
              onClick={() => quickStake(500, 30)}
              disabled={!walletAddress}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed p-4 rounded-lg text-center transition-colors transform hover:scale-105"
            >
              <div className="text-lg font-bold">500 XRP</div>
              <div className="text-sm text-green-200">30 日間</div>
              <div className="text-xs text-green-300 mt-1">~5% APY</div>
            </button>
            <button
              onClick={() => quickStake(1000, 90)}
              disabled={!walletAddress}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed p-4 rounded-lg text-center transition-colors transform hover:scale-105"
            >
              <div className="text-lg font-bold">1000 XRP</div>
              <div className="text-sm text-green-200">90 日間</div>
              <div className="text-xs text-green-300 mt-1">~10% APY</div>
            </button>
          </div>
          
          {!walletAddress && (
            <p className="text-center text-slate-400 mt-4 text-sm">
              ウォレットを接続してステークを開始
            </p>
          )}
        </div>
      </div>
    </div>
  )
}