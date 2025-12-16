import dotenv from "dotenv"
dotenv.config()

import express from "express"
import Stripe from "stripe"
import cors from "cors"
import fs from "fs"

const app = express()
app.listen(8080)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const stripe = new Stripe(process.env.STRIPE_KEY)

app.post("/generate-payment-link", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "red shirt"
                    },
                    unit_amount: (req.body.amount * 100)
                },
                quantity: 1
            }],
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel"
        })

        res.json({url: session.url})
        
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

app.post("/webhook", (req, res) => {
    try {
        const paymentData = JSON.stringify(req.body, null, 2)
        fs.writeFileSync("payment.json", paymentData)
        res.json({message: "Request received from stripe"})
        
    } catch (err) {
        console.log(err)
    }
})
