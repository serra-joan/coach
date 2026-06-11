// File to manage 'activities' command
import pc from 'picocolors'
import path from 'node:path'
import fs from 'node:fs'

export const ALLOWED_ACTIONS = ['list', 'open', 'remove'] as const

export function activities(action: typeof ALLOWED_ACTIONS[number], type?: string) {
    // is action allowed?
    if (!ALLOWED_ACTIONS.includes(action)) {
        console.error(pc.bgRed(`"${action}" is not a valid action.`),  `Allowed actions are: ${ALLOWED_ACTIONS.join(', ')}`)
        process.exit(0)
    }

    if (action === 'list') list()
    else if (action === 'open') open(type);
    else if (action === 'remove') remove(type)
}

// print a list of all activities saved (the name -> types)
function list() {
    // get all activities from data/activities (only name files)
    const activitiesDir = path.join(process.cwd(), 'data', 'activities')
    if (!fs.existsSync(activitiesDir)) {
        console.log('No activities found.')
        return
    }

    // get all files in activitiesDir that ends with .json
    let activities = fs.readdirSync(activitiesDir).filter(file => file.endsWith('.json'))

    // 
    if (activities.length === 0) {
        console.log('No activities found for the specified type.')
        return
    }

    console.log('Activities:')
    activities.forEach(activity => {
        const activityName = path.parse(activity).name
        console.log(`- ${activityName}`)
    });
}

// print the file
function open(type: string | undefined) {
    if (!type) {
        console.error('No activity specified.')
        process.exit(0)
    }

    const filePath = path.join(process.cwd(), 'data', 'activities', `${type}.json`)
    if (!fs.existsSync(filePath)) {
        console.error(`Activity "${type}" not found.`)
        process.exit(0)
    }

    const data = fs.readFileSync(filePath, 'utf-8')
    console.log(data)
}

// remove the file
function remove(type: string | undefined) {
    if (!type) {
        console.error('No activity specified.')
        process.exit(0)
    }

    const filePath = path.join(process.cwd(), 'data', 'activities', `${type}.json`)
    if (!fs.existsSync(filePath)) {
        console.error(`Activity "${type}" not found.`)
        process.exit(0)
    }

    fs.unlinkSync(filePath)
    console.log(`Activity "${type}" removed successfully.`)
}