import fs from 'node:fs'
import ps from 'picocolors'
import path from 'node:path'
import { CoachActivityData } from '../types.js'

const DATA_DIR = path.resolve(process.cwd(), 'data', 'activities')

// save the data if no is already exist on a .json from his type.
export async function save(data: CoachActivityData, debugmode = false) {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
        try {
            fs.mkdirSync(DATA_DIR, { recursive: true })

        } catch (err) {
            if (!debugmode) console.log(ps.bgRed('ERROR CREATING DIRECTORY:'), "Run with --debug to see more details")
            else console.error(ps.bgRed('ERROR CREATING DIRECTORY:'), err)
            return
        }
    }

    // get the activity type
    const activityType = data.activity.toLowerCase().replace(/\s+/g, '_')

    const filePath = path.join(DATA_DIR, `${activityType}.json`);
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

// list the save data of the type
export async function list(debugmode = false): Promise<[] | string[]> {
    // get all activities from data/activities (only name files)
    if (!fs.existsSync(DATA_DIR)) {
        console.log('No activities found.')
        return []
    }

    try {
        return fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'))
        
    } catch (err) {
        if (!debugmode) console.log(ps.bgRed('ERROR READING SAVED DATA:'), "Run with --debug to see more details")
        else console.error(ps.bgRed('ERROR READING SAVED DATA:'), err)
        return []
    }
}

export async function read(type: string, debugmode = false): Promise<string | null> {
    const filePath = path.join(DATA_DIR, `${type}.json`)
    if (!fs.existsSync(filePath)) {
        return `Activity "${type}" not found.`
    }

    try {
        return fs.readFileSync(filePath, 'utf-8') as string

    } catch (err) {
        if (!debugmode) console.log(ps.bgRed('ERROR READING FILE:'), "Run with --debug to see more details")
        else console.error(ps.bgRed('ERROR READING FILE:'), err)
        return null
    }
}

export async function remove(type: string, debugmode = false): Promise<boolean> {
    const filePath = path.join(DATA_DIR, `${type}.json`)
    if (!fs.existsSync(filePath)) {
        if (debugmode) console.log(ps.yellow(`Activity "${type}" not found.`))
        return false
    }

    try {
        fs.unlinkSync(filePath)
        return true

    } catch (err) {
        if (!debugmode) console.log(ps.bgRed('ERROR REMOVING FILE:'), "Run with --debug to see more details")
        else console.error(ps.bgRed('ERROR REMOVING FILE:'), err)
        return false
    }
}