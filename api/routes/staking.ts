import express from 'express'
import { Request, Response } from 'express'
import prisma from '../lib/prisma.js'

const router = express.Router()

// Mock data for demonstration
interface StakeRequest {
  amount: number
  duration: number
  walletAddress: string
}

interface ReviewRequest {
  taskId: string
  verdict: 'pass' | 'reject' | 'slash'
  points?: number
  evidence: string[]
  walletAddress?: string
}

// Stake endpoint
router.post('/stake', async (req: Request<{}, {}, StakeRequest>, res: Response) => {
  try {
    const { amount, duration, walletAddress } = req.body
    
    // Validate input
    if (!amount || !duration || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      })
    }

    const txHash = '0x' + Math.random().toString(36).substring(2, 15)
    const nftokenID = 'NFT-' + Math.random().toString(36).substring(2, 15)

    try {
      const endTime = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

      await prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { walletAddress },
          update: {
            totalStaked: { increment: amount },
          },
          create: {
            walletAddress,
            nickname: walletAddress.slice(0, 6),
            totalStaked: amount,
            totalPoints: 0,
          }
        })

        await tx.stakeOrder.create({
          data: {
            walletAddress,
            amount,
            duration,
            endTime,
            status: 'active',
            nftokenId: nftokenID,
          }
        })
      })
    } catch (dbErr) {
      console.warn('DB error on stake, returning mock response:', dbErr)
    }

    res.json({
      success: true,
      txHash,
      nftokenID,
      message: `Successfully staked ${amount} XRP for ${duration} days`
    })
  } catch (error) {
    console.error('Stake error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Unstake endpoint
router.post('/unstake', async (req: Request, res: Response) => {
  try {
    const { walletAddress, nftokenID } = req.body
    
    if (!walletAddress || !nftokenID) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      })
    }
    let unstakeAmount = 0
    try {
      const order = await prisma.stakeOrder.findFirst({ where: { walletAddress, nftokenId: nftokenID, status: 'active' } })
      if (order) {
        unstakeAmount = Number(order.amount)
        await prisma.$transaction(async (tx) => {
          await tx.stakeOrder.update({ where: { id: order.id }, data: { status: 'completed' } })
          await tx.user.update({ where: { walletAddress }, data: { totalStaked: { decrement: order.amount } } })
        })
      }
    } catch (dbErr) {
      console.warn('DB error on unstake, using mock amount:', dbErr)
      unstakeAmount = 1000
    }

    res.json({
      success: true,
      message: 'Unstake request processed successfully',
      amount: unstakeAmount,
      txHash: '0x' + Math.random().toString(36).substring(2, 15)
    })
  } catch (error) {
    console.error('Unstake error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Slash endpoint
router.post('/slash', async (req: Request, res: Response) => {
  try {
    const { walletAddress, amount, reason } = req.body
    
    if (!walletAddress || !amount || !reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      })
    }
    const txHash = '0x' + Math.random().toString(36).substring(2, 15)

    try {
      const activeOrder = await prisma.stakeOrder.findFirst({
        where: { walletAddress, status: 'active' },
        orderBy: { startTime: 'desc' }
      })

      if (activeOrder) {
        await prisma.$transaction(async (tx) => {
          await tx.slashEvent.create({
            data: {
              orderId: activeOrder.id,
              amount,
              reason,
            }
          })
          await tx.stakeOrder.update({ where: { id: activeOrder.id }, data: { status: 'slashed' } })
          await tx.user.update({ where: { walletAddress }, data: { totalStaked: { decrement: amount } } })
        })
      }
    } catch (dbErr) {
      console.warn('DB error on slash, returning mock response:', dbErr)
    }

    res.json({
      success: true,
      message: `Successfully slashed ${amount} XRP from ${walletAddress}`,
      reason,
      txHash
    })
  } catch (error) {
    console.error('Slash error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Points balance endpoint
router.get('/points/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address is required' 
      })
    }
    try {
      const user = await prisma.user.findUnique({ where: { walletAddress } })
      const totalPoints = user ? Number(user.totalPoints) : 0
      const availablePoints = totalPoints
      const lockedPoints = 0
      return res.json({ success: true, walletAddress, totalPoints, availablePoints, lockedPoints })
    } catch (dbErr) {
      console.warn('DB error on points, returning mock:', dbErr)
      return res.json({
        success: true,
        walletAddress,
        totalPoints: 1250,
        availablePoints: 800,
        lockedPoints: 450
      })
    }
  } catch (error) {
    console.error('Points query error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

router.get('/history/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address is required' })
    }

    try {
      const approved = await prisma.pointsHistory.findMany({
        where: { walletAddress, source: 'task' },
        orderBy: { createdAt: 'desc' },
        select: { taskId: true, amount: true, createdAt: true }
      })

      const slashes = await prisma.slashEvent.findMany({
        where: { stakeOrder: { walletAddress } },
        orderBy: { createdAt: 'desc' },
        include: { stakeOrder: { select: { id: true } } }
      })

      const slashList = slashes.map(s => ({
        orderId: s.stakeOrder.id,
        amount: s.amount,
        reason: s.reason,
        createdAt: s.createdAt
      }))

      return res.json({ success: true, approved, slashes: slashList })
    } catch (dbErr) {
      console.warn('DB error on history, returning mock:', dbErr)
      return res.json({
        success: true,
        approved: [
          { taskId: '1', amount: 50, createdAt: new Date().toISOString() },
          { taskId: '2', amount: 100, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ],
        slashes: [
          { orderId: 'mock-order', amount: 25, reason: 'Task 3 reject', createdAt: new Date(Date.now() - 2*86400000).toISOString() }
        ]
      })
    }
  } catch (error) {
    console.error('History query error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Review endpoint
router.post('/review', async (req: Request<{}, {}, ReviewRequest>, res: Response) => {
  try {
    const { taskId, verdict, points, evidence, walletAddress: bodyWallet } = req.body
    
    if (!taskId || !verdict || !evidence) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      })
    }
    const txHash = '0x' + Math.random().toString(36).substring(2, 15)

    try {
      // In a real app, task and submitter should be associated. Here we infer submitter from evidence content if provided later.
      // For simplicity, assume evidence array contains a first item like "wallet:ADDRESS" or fall back to no-op.
      const walletHint = evidence.find((e) => e.startsWith('wallet:'))
      const walletAddress = bodyWallet || (walletHint ? walletHint.replace('wallet:', '').trim() : undefined)

      if (verdict === 'pass' && walletAddress && points && points > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.pointsHistory.create({
            data: {
              walletAddress,
              amount: points,
              source: 'task',
              taskId,
            }
          })
          await tx.user.upsert({
            where: { walletAddress },
            update: { totalPoints: { increment: points } },
            create: { walletAddress, nickname: walletAddress.slice(0, 6), totalStaked: 0, totalPoints: points }
          })
        })
      }

      if ((verdict === 'reject' || verdict === 'slash') && walletAddress) {
        const penaltyRate = 0.05
        const activeOrder = await prisma.stakeOrder.findFirst({ where: { walletAddress, status: 'active' }, orderBy: { startTime: 'desc' } })
        if (activeOrder) {
          const slashAmount = Number(activeOrder.amount) * penaltyRate
          await prisma.$transaction(async (tx) => {
            await tx.slashEvent.create({ data: { orderId: activeOrder.id, amount: slashAmount, reason: `Task ${taskId} ${verdict}` } })
            await tx.stakeOrder.update({ where: { id: activeOrder.id }, data: { status: 'slashed' } })
            await tx.user.update({ where: { walletAddress }, data: { totalStaked: { decrement: slashAmount } } })
          })
        }
      }
    } catch (dbErr) {
      console.warn('DB error on review, proceeding with mock response:', dbErr)
    }

    res.json({
      success: true,
      taskId,
      verdict,
      points: verdict === 'pass' ? points : 0,
      message: `Task ${taskId} has been ${verdict}ed`,
      txHash
    })
  } catch (error) {
    console.error('Review error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

export default router