import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Wallet, Trophy, Coins, TrendingUp, Users, Zap, Star, ArrowRight, Play, Shield, Award, BarChart3, Globe, Clock, Target } from 'lucide-react'

export default function Home() {
  const { t } = useTranslation('common')
  const [animatedStats, setAnimatedStats] = useState({ users: 0, staked: 0, tasks: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)

  // Mock data for enhanced content
  const stats = { users: 12543, staked: 2847560, tasks: 8921 }
  const features = [
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "エキサイティングな挑戦",
      desc: "多様なタスクに参加して報酬を獲得",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      title: "高速取引",
      desc: "XRPLの高速な取引で即座に報酬受領",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-400" />,
      title: "安全なプロトコル",
      desc: "ブロックチェーン技術で資産を保護",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const steps = [
    { number: 1, title: "ウォレット接続", desc: "XRPLウォレットを接続" },
    { number: 2, title: "XRPをステーク", desc: "柔軟な期間でXRPをステーク" },
    { number: 3, title: "タスク完了", desc: "挑戦的なタスクを完了" },
    { number: 4, title: "報酬獲得", desc: "XRPとポイントの報酬を獲得" }
  ]

  // Animation effect for stats
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, key: keyof typeof animatedStats) => {
      const startTime = Date.now()
      const animate = () => {
        const currentTime = Date.now()
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const currentValue = Math.floor(start + (end - start) * progress)
        setAnimatedStats(prev => ({ ...prev, [key]: currentValue }))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }

    animateValue(0, stats.users, 2000, 'users')
    animateValue(0, stats.staked, 2500, 'staked')
    animateValue(0, stats.tasks, 1800, 'tasks')
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">XRPL パワード</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent animate-pulse">
              XRPL ステーキング革命
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              XRPをステークして報酬を獲得し、エキサイティングなタスクに参加してボーナスを得ましょう。
              ブロックチェーン技術で資産を安全に管理します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/stake"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                今すぐ始める
              </Link>
              <Link
                to="/tasks"
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                タスクを見る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{animatedStats.users.toLocaleString()}</div>
            <div className="text-green-400 text-sm font-medium">アクティブユーザー</div>
            <div className="text-slate-400 text-xs mt-1">+12.5% from last month</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-8 h-8 text-blue-400" />
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{animatedStats.staked.toLocaleString()}</div>
            <div className="text-blue-400 text-sm font-medium">総ステークXRP</div>
            <div className="text-slate-400 text-xs mt-1">+8.3% APY average</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-purple-400" />
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{animatedStats.tasks.toLocaleString()}</div>
            <div className="text-purple-400 text-sm font-medium">完了タスク</div>
            <div className="text-slate-400 text-xs mt-1">+15.2% this week</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">なぜ私たちを選ぶのか？</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            革新的な機能と確固たるセキュリティで、最高のステーキング体験を提供します
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 transition-all duration-500 hover:scale-105 ${
                currentSlide === index ? 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/20' : 'hover:border-slate-600'
              }`}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 mx-auto`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">始め方</h2>
            <p className="text-slate-400 text-lg">4つの簡単なステップで始められます</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transform -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Original 3 features with enhanced styling */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-green-500/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">XRP をステーク</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              柔軟な期間でXRPをステークし、魅力的な利回りを獲得しましょう。複数のプールから選択可能。
            </p>
            <div className="flex items-center text-green-400 font-medium">
              <span>詳しく見る</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">タスクを完了</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              エキサイティングなタスクに参加し、証拠を提出して審査を通過すると、ボーナスポイントを獲得できます。
            </p>
            <div className="flex items-center text-yellow-400 font-medium">
              <span>タスクを見る</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">XRPL ウォレット</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              XRPLテストネットに安全に接続し、資産を管理します。プライベートキーは完全に保護されます。
            </p>
            <div className="flex items-center text-blue-400 font-medium">
              <span>ウォレットを管理</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ参加して報酬を獲得しましょう！
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            数千人のユーザーが既に参加し、XRPをステークして報酬を獲得しています。
            あなたもこの機会をお見逃しなく。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/stake"
              className="bg-white text-green-600 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              今すぐ始める
            </Link>
            <Link
              to="/wallet-connect"
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              ウォレットを接続
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-slate-400 text-sm">稼働時間</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">&lt;3s</div>
              <div className="text-slate-400 text-sm">平均取引時間</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-slate-400 text-sm">サポート</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-slate-400 text-sm">安全確実</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}