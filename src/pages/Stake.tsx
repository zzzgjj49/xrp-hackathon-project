import { useState, useEffect } from 'react'
import { Coins, Clock, Calculator } from 'lucide-react'
import XRPLService from '../services/xrpl'
import { useTranslation } from 'react-i18next'

export default function Stake() {
  const { t } = useTranslation('common')
  const [amount, setAmount] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [estimatedRewards, setEstimatedRewards] = useState<number>(0)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [xrplService, setXrplService] = useState<XRPLService | null>(null)
  const [isStaking, setIsStaking] = useState(false)

  // Mock staking data
  const stakingOptions = [
    { duration: 7, apy: 2.5, multiplier: 1 },
    { duration: 30, apy: 5.0, multiplier: 1.2 },
    { duration: 90, apy: 10.0, multiplier: 1.5 },
    { duration: 180, apy: 15.0, multiplier: 2.0 }
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

    return () => {
      if (service) {
        service.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    calculateEstimatedRewards()
  }, [amount, duration])

  const calculateEstimatedRewards = () => {
    const amountNum = parseFloat(amount) || 0
    const option = stakingOptions.find(opt => opt.duration === duration)
    if (option && amountNum > 0) {
      const rewards = (amountNum * option.apy * duration) / (100 * 365)
      setEstimatedRewards(rewards)
    } else {
      setEstimatedRewards(0)
    }
  }

  const handleStake = async () => {
    // Check if wallet is connected by looking for wallet address
    if (!walletAddress) {
      alert(t('error.connectWallet'))
      return
    }

    const amountNum = parseFloat(amount)
    if (!amount || amountNum <= 0) {
      alert(t('error.enterAmount'))
      return
    }

    if (!xrplService) {
      alert(t('error.xrplNotReady'))
      return
    }

    setIsStaking(true)

    try {
      // Call backend stake API
      const resp = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, duration, walletAddress })
      })
      const data = await resp.json()

      if (resp.ok && data.success) {
        alert(`Successfully staked ${amount} XRP for ${duration} days!\nTransaction Hash: ${data.txHash}\n${t('stake.nextGoTasks')}`)
        setAmount('')
        setDuration(30)
      } else {
        alert(data.error || 'Staking failed. Please try again.')
      }
    } catch (error) {
      console.error('Stake failed:', error)
      alert(t('error.stakingFailed'))
    } finally {
      setIsStaking(false)
    }
  }



  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">ステーク</h1>
        </div>

        {/* Wallet Info */}
        {isConnected && (
          <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">ウォレット</p>
                <p className="font-mono">{walletAddress}</p>
              </div>
              <div className="text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Form */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
              <Coins className="w-6 h-6" />
              ステーク詳細
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">ステーク量</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ステークするXRP量を入力"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">期間</label>
                <div className="grid grid-cols-2 gap-3">
                  {stakingOptions.map((option) => (
                    <button
                      key={option.duration}
                      onClick={() => setDuration(option.duration)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        duration === option.duration
                          ? 'border-green-500 bg-green-600/20 text-green-400'
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{option.duration} 日間</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">{option.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStake}
                disabled={!walletAddress || isStaking || !amount || parseFloat(amount) <= 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isStaking ? 'ステーク中...' : 'ステークする'}
              </button>
            </div>
          </div>

          {/* Estimated Rewards */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              推定報酬
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">ステーク量</div>
                <div className="text-2xl font-bold text-white">{amount || '0'} XRP</div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">期間</div>
                <div className="text-2xl font-bold text-white">{duration} 日間</div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">APY</div>
                <div className="text-2xl font-bold text-green-400">
                  {stakingOptions.find(opt => opt.duration === duration)?.apy || 0}%
                </div>
              </div>

              <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
                <div className="text-sm text-green-300 mb-1">推定報酬</div>
                <div className="text-3xl font-bold text-green-400">
                  {estimatedRewards.toFixed(2)} XRP
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  ~{((estimatedRewards / (parseFloat(amount) || 1)) * 100).toFixed(2)}% リターン
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="font-medium mb-2 text-yellow-400">重要事項</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>{t('stake.notes.1')}</li>
                <li>{t('stake.notes.2')}</li>
                <li>{t('stake.notes.3')}</li>
                <li>{t('stake.notes.4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}