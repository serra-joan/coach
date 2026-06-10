import fs from 'node:fs'
import ps from 'picocolors'
import path from 'node:path'
import { CoachActivityData } from '../types.js'

export async function save(data: CoachActivityData, debugmode = false) {
    const dir = path.resolve(process.cwd(), 'data', 'activities')
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true })

        } catch (err) {
            if (!debugmode) console.log(ps.bgRed('ERROR CREATING DIRECTORY:'), "Run with --debug to see more details")
            else console.error(ps.bgRed('ERROR CREATING DIRECTORY:'), err)
            return
        }
    }

    // get the activity type
    const activityType = data.activity.toLowerCase().replace(/\s+/g, '_')

    const filePath = path.join(dir, `${activityType}.json`);
    try {
        // get existing data if exist
        const existing = fs.existsSync(filePath)
            ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CoachActivityData[]
            : [] as CoachActivityData[]

        // check if the activity already exists (same date)
        const alreadyExists = existing.some((activity) => activity.date === data.date)
        if (alreadyExists) {
            if (debugmode) console.log(ps.yellow('Activity already exists, skipping save.'))
            return
        }

        // add new data  and write file
        existing.push(data)
        fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8')

    } catch (err) {
        if (!debugmode) console.log(ps.bgRed('ERROR SAVING DATA:'), "Run with --debug to see more details")
        else console.error(ps.bgRed('ERROR SAVING DATA:'), err)
    }
}