// File to manage 'activities' command
import pc from 'picocolors'
import path from 'node:path'
import { CoachActivityData } from '../types.js'
import { printDataPritty } from '../utils/common_prints.js'
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
        console.log('No activities found.')
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

    // get JSON data
    const data = await read(type)
    const dataJSON = data ? JSON.parse(data) : null

    // order the data by date
    if (dataJSON) {
        dataJSON.sort((a: CoachActivityData, b: CoachActivityData) => {
            const dateA = parseActivityDate(a.date)
            const dateB = parseActivityDate(b.date)
            return dateA.getTime() - dateB.getTime()
        })
    }

    // print
    if (dataJSON) {
        dataJSON.forEach((activity: CoachActivityData, index: number) => {
            printDataPritty(activity, false)
        })
    }
    else console.log('unknown error')
}

// parse date to order by date
function parseActivityDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split(',').map(part => part.trim())
    const [day, month, year] = datePart.split('/').map(Number)
    const [hours, minutes, seconds] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes, seconds)
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