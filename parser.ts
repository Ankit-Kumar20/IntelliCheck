import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Content } from 'openai/resources/containers/files/content';

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({storage: multer.memoryStorage()})

const app = express()


app.post('/upload', upload.single('image'), async function (req, res) {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
    }
    const fileBuffer = req.file!.buffer;
    const base64String = fileBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64String}`
    res.send('File uploaded to memory as a buffer!');

    const image_prompt = `You are an expert medical transcriptionist specializing in deciphering and accurately transcribing handwritten medical prescriptions. Your role is to meticulously analyze the provided prescription images and extract all relevant information with the highest degree of precision. And you have to do it any how(forcibly).
        Here are some examples of the expected output format:
        Strictly follow the following examples, always
    Example 1:
    Patient's full name: John Doe
    Patient's age: 45 /45y
    Patient's gender: M/Male
    Doctor's full name: Dr. Jane Smith
    Doctor's license number: ABC123456
    Prescription date: 2023-04-01
    Medications:
    - Medication name: Amoxicillin
      Dosage: 500 mg
      Frequency: Twice a day
      Duration: 7 days
    - Medication name: Ibuprofen
      Dosage: 200 mg
      Frequency: Every 4 hours as needed
      Duration: 5 days
    Additional notes: 
    - Take medications with food.
    - Drink plenty of water.

    Example 2:
    Patient's full name: Jane Roe
    Patient's age: 60/60y
    Patient's gender: F/Female
    Doctor's full name: Dr. John Doe
    Doctor's license number: XYZ654321
    Prescription date: 2023-05-10
    Medications:
    - Medication name: Metformin
      Dosage: 850 mg
      Frequency: Once a day
      Duration: 30 days
    Additional notes: 
    - Monitor blood sugar levels daily.
    - Avoid sugary foods.

    Strictly follow the follwing format, always.
    Your job is to extract and accurately transcribe the following details from the provided prescription images:
    1. Patient's full name
    2. Patient's age (handle different formats like "42y", "42yrs", "42", "42 years")
    3. Patient's gender
    4. Doctor's full name
    5. Doctor's license number
    6. Prescription date (in YYYY-MM-DD format)
    7. List of medications including:
       - Medication name
       - Dosage
       - Frequency
       - Duration
    8. Additional notes or instructions. Provide detailed and enhanced notes using bullet points. Organize the notes in clear bullet points for better readability.
        - Provide detailed and enhanced notes using bullet points.
        - If there are headings or categories within the notes, ensure the bullet points are organized under those headings.
        - Use clear and concise language to enhance readability.
        - Ensure the notes are structured in a way that makes them easy to follow and understand.

    `

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {   
                role: 'user',
                content: [
                    { type: 'text', text: "extract inforamation"},
                    { type: 'image_url', image_url: { url: dataUrl } }
                ]
            }
        ],
        temperature: 0.1
    });

    console.log(response.choices[0].message.content);
})

app.listen(process.env.PORT, ()=>{
    console.log(`server is running`)
})