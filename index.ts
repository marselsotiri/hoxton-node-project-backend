import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient({
  log: ['error', 'info', 'query', 'warn']
})



app.listen(4000, () => {
    console.log(`Server up: http://localhost:4000`)
  })