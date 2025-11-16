import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'


type Difficulty = 'easy' | 'medium' | 'hard'
type Category = 'social' | 'development' | 'content'

interface TaskData {
  id: string
  reward: number
  difficulty: Difficulty
  category: Category
  deadline: string
}

const TASKS: TaskData[] = [
  { id: '1', reward: 50, difficulty: 'easy', category: 'social', deadline: '2024-01-15' },
  { id: '2', reward: 100, difficulty: 'medium', category: 'development', deadline: '2024-01-20' },
  { id: '3', reward: 200, difficulty: 'hard', category: 'content', deadline: '2024-01-25' },
  { id: '4', reward: 150, difficulty: 'hard', category: 'development', deadline: '2024-01-18' },
]

export default function TaskDetail() {

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskData | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const found = TASKS.find(x => x.id === (id || '')) || null
    setTask(found)
    const saved = localStorage.getItem('acceptedTasks')
    const arr = saved ? JSON.parse(saved) as string[] : []
    setAccepted(arr.includes(id || ''))
  }, [id])

  const accept = () => {
    const saved = localStorage.getItem('acceptedTasks')
    const arr = saved ? JSON.parse(saved) as string[] : []
    if (!arr.includes(id || '')) arr.push(id || '')
    localStorage.setItem('acceptedTasks', JSON.stringify(arr))
    setAccepted(true)
  }

  const startNow = () => {
    localStorage.setItem('openSubmitFor', id || '')
    navigate('/tasks')
  }

  const back = () => navigate('/tasks')

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">不明なタスク</h1>
          <button onClick={back} className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">戻る</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-400">{task.id === '1' ? 'ソーシャルメディアエンゲージメント' : task.id === '2' ? 'バグ報告とフィードバック' : task.id === '3' ? '技術記事の作成' : task.id === '4' ? 'スマートコントラクトの監査' : 'タスク'}</h1>
          <button onClick={back} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg">戻る</button>
        </div>

        <p className="text-slate-300 mb-6">{task.id === '1' ? 'Twitter、Discord、TelegramでXRPLプロジェクトについてのポストを作成・共有し、エンゲージメントを獲得してください。' : task.id === '2' ? 'XRPLエコシステムにおけるバグを特定し、詳細なレポートを提出してください。' : task.id === '3' ? 'XRPL技術に関する教育記事を作成し、コミュニティと共有してください。' : task.id === '4' ? 'スマートコントラクトのコードを監査し、セキュリティ問題を特定してください。' : 'タスクの説明'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 mb-1">ポイント</div>
            <div className="text-2xl font-bold">{task.reward}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 mb-1">難易度</div>
            <div className="text-2xl font-bold">{task.difficulty === 'easy' ? '簡単' : task.difficulty === 'medium' ? '中等度' : task.difficulty === 'hard' ? '困難' : '不明'}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 mb-1">カテゴリ</div>
            <div className="text-2xl font-bold">{task.category === 'social' ? 'ソーシャル' : task.category === 'development' ? '開発' : task.category === 'content' ? 'コンテンツ' : '不明'}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 mb-1">期限</div>
            <div className="text-2xl font-bold">{task.deadline}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            disabled={accepted}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${accepted ? 'bg-slate-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {accepted ? '受諾済み' : 'タスクを受諾'}
          </button>
          <button
            onClick={startNow}
            className="px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700"
          >
            '今すぐ開始'
          </button>
        </div>
      </div>
    </div>
  )
}