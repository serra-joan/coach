// File to manage 'activities' command
import pc from 'picocolors'
import path from 'node:path'
import { read, remove, list } from '../utils/manage_saved_data.js'

export const ALLOWED_ACTIONS = ['list', 'open', 'remove'] as const

export async function activities(action: typeof ALLOWED_ACTIONS[number], type?: string) {
    // is action allowed?
    if (!ALLOWED_ACTIONS.includes(action)) {
        console.error(pc.bgRed(`"${action}" is not a valid action.`),  `Allowed actions are: ${ALLOWED_ACTIONS.join(', ')}`)
        process.exit(0)
    }

    if (action === 'list') await show()
    else if (action === 'open') await open(type);
    else if (action === 'remove') await removeActivity(type)
}

// print a list of all activities saved (the name -> types)
async function show() {
    // get all files in activitiesDir that ends with .json
    let activities = await list()
    if (activities.length === 0) {
        console.log('No activities found for the specified type.')
        return
    }

    // print the list of activities
    console.log('Activities:')
    activities.forEach(activity => {
        const activityName = path.parse(activity).name
        console.log(`- ${activityName}`)
    });
}

// print the file
async function open(type: string | undefined) {
    if (!type) {
        console.error('No activity specified.')
        process.exit(0)
    }

    const data = await read(type)
    console.log(data || 'unknown error')
}

// remove the file
async function removeActivity(type: string | undefined) {
    if (!type) {
        console.error('No activity specified.')
        process.exit(0)
    }

    const response = await remove(type)
    if (response) console.log(`Activity "${type}" removed successfully.`)
    else console.error(`Failed to remove activity "${type}".`)
}