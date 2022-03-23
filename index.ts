import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient({
  log: ['error', 'info', 'query', 'warn']
})

function createToken(id: number) {
  // @ts-ignore
  return jwt.sign({ id: id }, process.env.MY_SECRET, { expiresIn: '3days' })
}

async function getUserFromToken(token: string) {
  // @ts-ignore
  const decodedData = jwt.verify(token, process.env.MY_SECRET)
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decodedData.id }
  })
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantId: user?.id }, { userId: user?.id }] },
    include: { messages: true, partecipant: true, user: true }
  })
  //@ts-ignore
  user.conversations = conversations

  return user
}


app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.send(users)
})

app.post('/conversations', async (req, res) => {

  const token = req.headers.authorization || ''
  const { participantId } = req.body

  try {
    const user = await getUserFromToken(token)

    const conversation = await prisma.conversation.create({
      //@ts-ignore
      data: { participantId: participantId, userId: user.id },
      include: { messages: true, partecipant: true, user: true }
    })
    // @ts-ignore
    user.conversations.push(conversation)
    res.send(user)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }

})

app.post('/messages', async (req, res) => {

  const token = req.headers.authorization || ''
  const { textMessage, conversationId } = req.body


  try {
    // const user = await getUserFromToken(token)
    // @ts-ignore
    const decodedData = jwt.verify(token, process.env.MY_SECRET)


    const message = await prisma.message.create({
      //@ts-ignore
      data: { textMessage: textMessage, userId: decodedData.id, conversationId: conversationId },
    })
    const userUpdated = await getUserFromToken(token)
    res.send(userUpdated)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }

})


app.post('/sign-up', async (req, res) => {
  const { email, password, fullName, phoneNr, profilePhoto, userStatus } = req.body

  try {
    const hash = bcrypt.hashSync(password, 8)
    const user = await prisma.user.create({
      //@ts-ignore
      data: { email: email, password: hash, fullName: fullName, phoneNr: phoneNr, profilePhoto: profilePhoto, userStatus: userStatus }
    })
    //@ts-ignore
    user.conversations = []
    res.send({ user, token: createToken(user.id) })
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.post('/login', async (req, res) => {
  const { email, password, phoneNr } = req.body

  try {
    let user
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email }
      })
    } else {
      user = await prisma.user.findUnique({
        where: { phoneNr: phoneNr }
      })
    }
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ participantId: user?.id }, { userId: user?.id }] },
      include: { messages: true, partecipant: true, user: true }
    })

    //@ts-ignore
    user.conversations = conversations
    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password)

    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) })
    } else {
      throw Error('BOOM!')
    }
  } catch (err) {
    res.status(400).send({ error: 'User/password invalid.' })
  }
})

app.get('/validate', async (req, res) => {
  const token = req.headers.authorization || ''

  try {
    // @ts-ignore
    const user = await getUserFromToken(token)
    res.send(user)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.patch('/status', async (req, res) => {
  const token = req.headers.authorization || ''
  const { userStatus } = req.body

  try {
    // @ts-ignore
    const decodedData = jwt.verify(token, process.env.MY_SECRET)

    const updatedUser = await prisma.user.update({
      // @ts-ignore
      where: { id: decodedData.id },
      data: { userStatus: userStatus }
    })
    const user = await getUserFromToken(token)
    res.send(user)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})



app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})