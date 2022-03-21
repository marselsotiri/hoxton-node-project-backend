import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const messages: Prisma.MessageCreateInput[] = [
    {
        textMessage: "Hello Geri",
        user: { connect: { id: 1 } },
        convesation: { connect: { id: 1 } }
    },
    {
        textMessage: "Hello Marsel",
        user: { connect: { id: 2 } },
        convesation: { connect: { id: 1 } }
    }
]


const users: Prisma.UserCreateInput[] = [
    {
        email: "marsel@email.com",
        fullName: "Marsel Sotiri",
        password: bcrypt.hashSync('marsel'),
        phoneNr: "+355665412132",
        profilePhoto: "https://media-exp1.licdn.com/dms/image/C4E03AQEZZ5esifXyGA/profile-displayphoto-shrink_200_200/0/1610048591945?e=1648684800&v=beta&t=3EHUvjMGuJjYp12KFgNxfAmsXHii03Q0XBRN3IQ1Lao",
        userStatus: "working"
    },
    {
        email: "geri@email.com",
        fullName: "Geri Luga",
        password: bcrypt.hashSync('geri'),
        phoneNr: "+355665414132",
        profilePhoto: "https://www.pngitem.com/pimgs/m/78-786293_1240-x-1240-0-avatar-profile-icon-png.png",
        userStatus: "working"
    },
    {
        email: "visard@email.com",
        fullName: "Visard Visi",
        password: bcrypt.hashSync('visi'),
        phoneNr: "+355665414534",
        profilePhoto: "https://www.pngitem.com/pimgs/m/78-786293_1240-x-1240-0-avatar-profile-icon-png.png",
        userStatus: "working"

    },
    {
        email: "egon@email.com",
        fullName: "Egon Loli",
        password: bcrypt.hashSync('egon'),
        phoneNr: "+355665417865",
        profilePhoto: "https://www.pngitem.com/pimgs/m/78-786293_1240-x-1240-0-avatar-profile-icon-png.png",
        userStatus: "working"
    }

]

const conversations: Prisma.ConversationCreateInput[] = [
    {
        user: { connect: { id: 1 } },
        partecipant: { connect: { id: 2 } }
    }
]

async function createStuff() {

    for (const user of users) {
        await prisma.user.create({ data: user })
    }

    for (const conversation of conversations) {
        await prisma.conversation.create({ data: conversation })
    }

    for (const message of messages) {
        await prisma.message.create({ data: message })
    }


}

createStuff()