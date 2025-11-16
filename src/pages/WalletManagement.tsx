import { useState, useEffect } from 'react'
import { Wallet, Plus, Trash2, Edit3, CheckCircle, XCircle, Link, Unlink, Copy, ExternalLink, TrendingUp, TrendingDown, Activity, PieChart, BarChart3, QrCode, Download, RefreshCw, Eye, EyeOff } from 'lucide-react'
import XRPLService from '../services/xrpl'
import { useTranslation } from 'react-i18next'

interface WalletInfo {
  id: string
  address: string
  label: string
  isConnected: boolean
  balance?: number
  createdAt: string
  lastUsed?: string
  transactions?: number
  dailyChange?: number
  weeklyChange?: number
}

export default function WalletManagement() {
  const { t } = useTranslation('common')
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletInfo | null>(null)
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [newWalletLabel, setNewWalletLabel] = useState('')
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  // Mock wallet data
  const mockWallets: WalletInfo[] = [
    {
      id: '1',
      address: 'rN7n7otQD9VcF7mqM7fQ8bW6kKZ7nN3sT',
      label: 'メインウォレット',
      isConnected: true,
      balance: 1250.50,
      createdAt: '2024-01-01T10:00:00Z',
      lastUsed: '2024-01-15T14:30:00Z',
      transactions: 156,
      dailyChange: 2.5,
      weeklyChange: 12.3
    },
    {
      id: '2',
      address: 'rAbCdEfGhIjKlMnOpQrStUvWxYz',
      label: 'ステーキングウォレット',
      isConnected: false,
      balance: 850.75,
      createdAt: '2024-01-05T15:20:00Z',
      transactions: 89,
      dailyChange: -1.2,
      weeklyChange: 8.7
    },
    {
      id: '3',
      address: 'rXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ',
      label: 'トレーディングウォレット',
      isConnected: true,
      balance: 345.20,
      createdAt: '2024-01-10T09:15:00Z',
      lastUsed: '2024-01-16T11:45:00Z',
      transactions: 234,
      dailyChange: 5.8,
      weeklyChange: -3.4
    }
  ]

  useEffect(() => {
    // Initialize XRPL service
    const service = new XRPLService()
    setXrplService(service)

    // Load saved wallets from localStorage
    const savedWallets = localStorage.getItem('adminWallets')
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets))
    } else {
      // Use mock data if no saved wallets
      setWallets(mockWallets)
      localStorage.setItem('adminWallets', JSON.stringify(mockWallets))
    }

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  const addWallet = async () => {
    if (!newWalletAddress.trim() || !newWalletLabel.trim()) {
      alert(t('walletManagement.validation.required'))
      return
    }

    // Validate XRP address format (basic validation)
    if (!newWalletAddress.startsWith('r') || newWalletAddress.length < 25) {
      alert(t('walletManagement.validation.invalidAddress'))
      return
    }

    setIsProcessing(true)

    try {
      const newWallet: WalletInfo = {
        id: Date.now().toString(),
        address: newWalletAddress.trim(),
        label: newWalletLabel.trim(),
        isConnected: false,
        createdAt: new Date().toISOString()
      }

      const updatedWallets = [...wallets, newWallet]
      setWallets(updatedWallets)
      localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))

      // Reset form
      setNewWalletAddress('')
      setNewWalletLabel('')
      setShowAddModal(false)

      alert(t('walletManagement.success.added'))
    } catch (error) {
      console.error('Failed to add wallet:', error)
      alert(t('walletManagement.error.addFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const connectWallet = async (walletId: string) => {
    if (!xrplService) return

    setIsProcessing(true)

    try {
      await xrplService.connect()
      
      const updatedWallets = wallets.map(wallet =>
        wallet.id === walletId
          ? { ...wallet, isConnected: true, lastUsed: new Date().toISOString() }
          : wallet
      )
      
      setWallets(updatedWallets)
      localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))
      
      alert(t('walletManagement.success.connected'))
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert(t('walletManagement.error.connectFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const disconnectWallet = async (walletId: string) => {
    if (!xrplService) return

    setIsProcessing(true)

    try {
      await xrplService.disconnect()
      
      const updatedWallets = wallets.map(wallet =>
        wallet.id === walletId
          ? { ...wallet, isConnected: false }
          : wallet
      )
      
      setWallets(updatedWallets)
      localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))
      
      alert(t('walletManagement.success.disconnected'))
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      alert(t('walletManagement.error.disconnectFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const deleteWallet = async (walletId: string) => {
    if (!confirm(t('walletManagement.confirm.delete'))) {
      return
    }

    const updatedWallets = wallets.filter(wallet => wallet.id !== walletId)
    setWallets(updatedWallets)
    localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))
    
    alert(t('walletManagement.success.deleted'))
  }

  const editWallet = (wallet: WalletInfo) => {
    setEditingWallet(wallet)
    setNewWalletLabel(wallet.label)
    setShowEditModal(true)
  }

  const updateWallet = async () => {
    if (!editingWallet || !newWalletLabel.trim()) {
      alert(t('walletManagement.validation.required'))
      return
    }

    const updatedWallets = wallets.map(wallet =>
      wallet.id === editingWallet.id
        ? { ...wallet, label: newWalletLabel.trim() }
        : wallet
    )
    
    setWallets(updatedWallets)
    localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))
    
    setShowEditModal(false)
    setEditingWallet(null)
    setNewWalletLabel('')
    
    alert(t('walletManagement.success.updated'))
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    alert(t('walletManagement.success.copied'))
  }

  const openInExplorer = (address: string) => {
    window.open(`https://livenet.xrpl.org/accounts/${address}`, '_blank')
  }

  const generateQRCode = (address: string) => {
    setShowQR(address)
  }

  const exportWalletData = () => {
    const dataStr = JSON.stringify(wallets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ウォレット_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const refreshBalances = async () => {
    setIsProcessing(true)
    // Simulate balance refresh
    setTimeout(() => {
      const updatedWallets = wallets.map(wallet => ({
        ...wallet,
        balance: wallet.balance ? wallet.balance + (Math.random() - 0.5) * 10 : undefined
      }))
      setWallets(updatedWallets)
      localStorage.setItem('adminWallets', JSON.stringify(updatedWallets))
      setIsProcessing(false)
      alert(t('walletManagement.success.balancesUpdated'))
    }, 1500)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-slate-400'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp
    if (change < 0) return TrendingDown
    return Activity
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ウォレット管理
                </h1>
                <p className="text-slate-400 text-sm">XRPウォレットを管理・監視</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshBalances}
                disabled={isProcessing}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                更新
              </button>
              <button
                onClick={exportWalletData}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                エクスポート
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/25"
              >
                <Plus className="w-5 h-5" />
                ウォレット追加
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-sm">{showBalances ? '残高表示' : '残高非表示'}</span>
              </button>
              <div className="flex items-center gap-2">
                {['24h', '7d', '30d'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe as any)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-slate-400">
              総額: {showBalances ? `${wallets.reduce((sum, w) => sum + (w.balance || 0), 0).toFixed(2)} XRP` : '****'}
            </div>
          </div>
        </div>

        {/* Performance Chart Section */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">パフォーマンス概要</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                1日
              </button>
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">
                1週間
              </button>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                1ヶ月
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">最高残高</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {showBalances ? `${Math.max(...wallets.map(w => w.balance || 0)).toFixed(2)}` : '****'}
              </div>
              <div className="text-xs text-slate-500">XRP</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">平均残高</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {showBalances ? `${(wallets.reduce((sum, w) => sum + (w.balance || 0), 0) / wallets.length).toFixed(2)}` : '****'}
              </div>
              <div className="text-xs text-slate-500">XRP</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">最活発ウォレット</span>
                <PieChart className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {wallets.reduce((max, w) => (w.transactions || 0) > (max.transactions || 0) ? w : max).label}
              </div>
              <div className="text-xs text-slate-500">
                {wallets.reduce((max, w) => (w.transactions || 0) > (max.transactions || 0) ? w : max).transactions} 取引
              </div>
            </div>
          </div>
          
          {/* Mock Chart */}
          <div className="mt-6 bg-slate-900/30 rounded-lg p-6">
            <div className="flex items-end justify-between h-32 gap-2">
              {[65, 80, 45, 90, 70, 85, 60, 75, 95, 55].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all duration-500 hover:from-green-400 hover:to-emerald-300"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    {index + 1}日
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">総ウォレット数</span>
            </div>
            <div className="text-3xl font-bold mb-2">{wallets.length}</div>
            <div className="text-xs text-slate-500">
              {wallets.filter(w => w.isConnected).length} 接続中
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-slate-400">接続済み</span>
            </div>
            <div className="text-3xl font-bold mb-2">{wallets.filter(w => w.isConnected).length}</div>
            <div className="text-xs text-slate-500">
              {Math.round((wallets.filter(w => w.isConnected).length / wallets.length) * 100)}% 接続率
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Link className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">総残高</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {showBalances ? `${wallets.reduce((sum, w) => sum + (w.balance || 0), 0).toFixed(2)}` : '****'}
            </div>
            <div className="text-xs text-slate-500">XRP</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-sm text-slate-400">総取引数</span>
            </div>
            <div className="text-3xl font-bold mb-2">{wallets.reduce((sum, w) => sum + (w.transactions || 0), 0)}</div>
            <div className="text-xs text-slate-500">
              平均 {Math.round(wallets.reduce((sum, w) => sum + (w.transactions || 0), 0) / wallets.length)} / ウォレット
            </div>
          </div>
        </div>

        {/* Enhanced Wallets List */}
        <div className="grid gap-4 mb-8">
          {wallets.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center text-slate-400 border border-slate-700">
              <Wallet className="w-20 h-20 mx-auto mb-6 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">ウォレットがありません</h3>
              <p className="text-slate-500 mb-6">XRPウォレットを追加して管理を開始しましょう</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 mx-auto"
              >
                <Plus className="w-5 h-5" />
                最初のウォレットを追加
              </button>
            </div>
          ) : (
            wallets.map((wallet) => (
              <div key={wallet.id} className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 hover:scale-[1.02] overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        wallet.isConnected 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : 'bg-slate-700 border border-slate-600'
                      }`}>
                        <Wallet className={`w-6 h-6 ${wallet.isConnected ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-white">{wallet.label}</h3>
                          {wallet.isConnected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-500/30">
                              <CheckCircle className="w-3 h-3" />
                              接続済み
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full border border-slate-600">
                              <XCircle className="w-3 h-3" />
                              未接続
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                          <span className="font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}</span>
                          <button
                            onClick={() => copyAddress(wallet.address)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="アドレスをコピー"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openInExplorer(wallet.address)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="エクスプローラーで表示"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => generateQRCode(wallet.address)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="QRコードを生成"
                          >
                            <QrCode className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editWallet(wallet)}
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWallet(wallet.id)}
                        className="bg-slate-600 hover:bg-red-600 p-2 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        <Link className="w-3 h-3" />
                        <span>残高</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {showBalances ? `${wallet.balance?.toFixed(2) || '0.00'}` : '****'}
                      </div>
                      <div className="text-xs text-slate-500">XRP</div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        <Activity className="w-3 h-3" />
                        <span>取引数</span>
                      </div>
                      <div className="text-lg font-bold text-white">{wallet.transactions || 0}</div>
                      <div className="text-xs text-slate-500">回</div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        {wallet.dailyChange && wallet.dailyChange !== 0 ? (
                          <div className={`flex items-center gap-1 ${getChangeColor(wallet.dailyChange)}`}>
                            {wallet.dailyChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>24h変動</span>
                          </div>
                        ) : (
                          <>
                            <Activity className="w-3 h-3" />
                            <span>24h変動</span>
                          </>
                        )}
                      </div>
                      <div className={`text-lg font-bold ${getChangeColor(wallet.dailyChange || 0)}`}>
                        {wallet.dailyChange ? `${wallet.dailyChange > 0 ? '+' : ''}${wallet.dailyChange.toFixed(1)}%` : '0.0%'}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        {wallet.weeklyChange && wallet.weeklyChange !== 0 ? (
                          <div className={`flex items-center gap-1 ${getChangeColor(wallet.weeklyChange)}`}>
                            {wallet.weeklyChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>7日変動</span>
                          </div>
                        ) : (
                          <>
                            <Activity className="w-3 h-3" />
                            <span>7日変動</span>
                          </>
                        )}
                      </div>
                      <div className={`text-lg font-bold ${getChangeColor(wallet.weeklyChange || 0)}`}>
                        {wallet.weeklyChange ? `${wallet.weeklyChange > 0 ? '+' : ''}${wallet.weeklyChange.toFixed(1)}%` : '0.0%'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {wallet.lastUsed ? `最終使用: ${new Date(wallet.lastUsed).toLocaleDateString()}` : '未使用'}
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet.isConnected ? (
                        <button
                          onClick={() => disconnectWallet(wallet.id)}
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm"
                        >
                          <Unlink className="w-4 h-4" />
                          切断
                        </button>
                      ) : (
                        <button
                          onClick={() => connectWallet(wallet.id)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm"
                        >
                          <Link className="w-4 h-4" />
                          接続
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Wallet Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-400">ウォレット追加</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ウォレットラベル
                  </label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    placeholder="例: メインウォレット"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ウォレットアドレス
                  </label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder="rで始まるXRPアドレスを入力"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={addWallet}
                  disabled={isProcessing || !newWalletAddress.trim() || !newWalletLabel.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  {isProcessing ? t('common.processing') : t('walletManagement.add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Wallet Modal */}
        {showEditModal && editingWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-400">ウォレット編集</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('walletManagement.walletLabel')}
                  </label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    placeholder={t('walletManagement.walletLabel.placeholder')}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('walletManagement.walletAddress')}
                  </label>
                  <input
                    type="text"
                    value={editingWallet.address}
                    disabled
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={updateWallet}
                  disabled={isProcessing || !newWalletLabel.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  {isProcessing ? t('common.processing') : t('walletManagement.update')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-400">QRコード</h3>
                <button
                  onClick={() => setShowQR(null)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg mb-4 inline-block">
                  <div className="w-48 h-48 bg-gradient-to-br from-green-500 to-blue-500 rounded flex items-center justify-center text-white font-bold text-lg">
                    QR-{showQR.slice(-6)}
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4 font-mono break-all">{showQR}</p>
                <button
                  onClick={() => copyAddress(showQR)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
                >
                  <Copy className="w-4 h-4" />
                  アドレスをコピー
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}