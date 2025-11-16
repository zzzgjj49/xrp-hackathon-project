import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Link, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import XRPLService from '../services/xrpl'

export default function WalletConnect() {
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [error, setError] = useState('')
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)

  useEffect(() => {
    // Initialize XRPL service
    const service = new XRPLService()
    setXrplService(service)

    // Check if already connected
    const savedAddress = localStorage.getItem('walletAddress')
    const savedConnection = localStorage.getItem('isWalletConnected')
    if (savedAddress && savedConnection === 'true') {
      setWalletAddress(savedAddress)
      setIsConnected(true)
    }

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  const connectWallet = async () => {
    if (!xrplService) return
    
    setIsConnecting(true)
    setError('')

    try {
      // Connect to XRPL
      await xrplService.connect()
      
      // Mock wallet address for demo
      const mockAddress = 'rN7n7otQD9VcF7mqM7fQ8bW6kKZ7nN3sT'
      
      setWalletAddress(mockAddress)
      setIsConnected(true)
      
      // Save to localStorage
      localStorage.setItem('walletAddress', mockAddress)
      localStorage.setItem('isWalletConnected', 'true')
      
      // Redirect to wallet management after successful connection
      setTimeout(() => {
        navigate('/wallet-management')
      }, 2000)
      
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      setError('ウォレットの接続に失敗しました。もう一度お試しください。')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress('')
    setIsConnected(false)
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('isWalletConnected')
    if (xrplService) {
      xrplService.disconnect()
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={goBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-green-400">ウォレット接続</h1>
            <p className="text-slate-400 text-sm">XRPLウォレットを接続して管理を開始</p>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isConnected ? 'bg-green-500/20' : 'bg-slate-700'
              }`}>
                <Wallet className={`w-6 h-6 ${
                  isConnected ? 'text-green-400' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <h3 className="font-medium">
                  {isConnected ? '接続済み' : '未接続'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isConnected ? 'ウォレットが接続されています' : 'ウォレットが接続されていません'}
                </p>
              </div>
            </div>
            {isConnected && (
              <CheckCircle className="w-6 h-6 text-green-400" />
            )}
          </div>

          {isConnected && walletAddress && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-slate-400 text-sm mb-1">ウォレットアドレス</div>
              <div className="font-mono text-sm break-all">{walletAddress}</div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isConnecting
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg shadow-green-500/25'
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  接続中...
                </>
              ) : (
                <>
                  <Link className="w-5 h-5" />
                  ウォレットを接続
                </>
              )}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              接続を解除
            </button>
          )}

          {/* Demo Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-blue-400 text-sm">
                <p className="font-medium mb-1">デモ用接続</p>
                <p>これはデモ用の接続です。実際のXRPLネットワークに接続します。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isConnected && (
          <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">接続成功！ウォレット管理画面に移動します...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}