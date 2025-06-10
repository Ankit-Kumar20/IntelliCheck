import express from 'express';
import { tavily } from '@tavily/core';
import OpenAI from 'openai'

import dotenv from 'dotenv'

dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

const app = express();

app.use(express.json())

app.post('/search', async(req, res)=>{
    const { query, search_type } = req.body;
    const response = await tvly.search(query, {searchDepth: search_type, maxResults: 5});
    var contents = [];
    for( let i=0; i<response.results.length; i++){
        contents.push(response.results[i].content)
    }
    console.log(contents.toString());

    const system_prompt = `
        -You are a Symptom Checker assistant. Your sole responsibility is to help users identify potential health conditions based on the symptoms they describe. Use clear, simple language and ask clarifying questions if the symptoms are vague or incomplete. You are not a doctor and cannot diagnose, but you can suggest possible causes and recommend whether they should seek professional medical advice.

        -If the user directly sprecifies the disease, then you reply in a symphathetic manner.

        -At the end you should always tell the patient to seek the advice of a regular professional practioner.

        -If the user asks about anything **outside of symptoms or health-related issues**, respond with: "I'm sorry, that's not my domain. I'm here only to help with health-related symptom checking."

        -Do not attempt to answer questions unrelated to physical or mental health symptoms. Always stay on topic.
    `

    const llm_response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: [
                    { type: 'text', text: system_prompt}
                ]
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: query}
                ]
            }
        ],
        temperature: 0.2
    })

    res.status(201).send(llm_response.choices[0].message.content);
})

app.listen(process.env.PORT, ()=>{
    console.log(`server is ruunning at port ${process.env.PORT}`)
})
