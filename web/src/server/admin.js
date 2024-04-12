import Event from "./models/event.js";
import sequelize from "./sequelize.js";
import { Op } from "sequelize";

// just a mess..but works for now
export async function getAdminDashboardContent() {

    const eventsByDay = await Event.findAll({
        attributes: [
            [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'eventDay'],
            'action',
            [sequelize.fn('count', sequelize.col('id')), 'count']
        ],
        group: ['eventDay', 'action'],
        order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'DESC'], ["action", 'ASC']],
    });

    let content = "<h1>Admin Dashboard</h1><hr />";

    // top daily
    content += "<h2>Top Daily Events</h2>";
    content += "<table><tr><th>Date</th><th>Action</th><th>Count</th></tr>";

    let lastDate = null;
    eventsByDay.forEach(event => {
        const date = new Date(event.dataValues.eventDay);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        if (formattedDate !== lastDate && lastDate !== null) {
            content += "<tr><td><br /></td><td></td><td></td></tr>";
        }
        content += `<tr><td>${formattedDate}</td><td>${event.action}</td><td>${event.dataValues.count}</td></tr>`;

        lastDate = formattedDate
    });

    content += "</table><hr />"


    // recent guids
    const recentTopGuids = await Event.findAll({
        where: {
            createdAt: {
                [Op.gt]: new Date(new Date() - 36 * 60 * 60 * 1000) // 36 hours ago
            }
        },
        attributes: [
            'guid',
            [sequelize.fn('count', sequelize.col('guid')), 'count']
        ],
        group: 'guid',
        order: [[sequelize.fn('count', sequelize.col('guid')), 'DESC']],
        limit: 30
    });

    content += "<h2>Top GUIDs in Last 36 Hours</h2>";
    content += "<table><tr><th>GUID</th><th>Event Count</th></tr>";

    recentTopGuids.forEach(user => {
        content += `<tr><td>${user.guid}</td><td>${user.dataValues.count}</td></tr>`;
    });

    content += "</table><hr />";

    // New query to get all "data" fields for events in the last 36 hours
    const recentEventData = await Event.findAll({
        where: {
            createdAt: {
                [Op.gt]: new Date(new Date() - 36 * 60 * 60 * 1000) // 36 hours ago
            }
        },
        attributes: ['id', 'guid', 'action', 'data', 'createdAt'], // Include other fields as needed
        order: [['createdAt', 'DESC']], // Ordering by most recent first
    });


    /*
    // event data
    content += "<h2>Event Data in Last 36 Hours</h2>";
    content += "<ul>";

    recentEventData.forEach(event => {
        const date = new Date(event.createdAt);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;

        content += `<li>GUID: ${event.guid}, Action: ${event.action}, Data: ${event.data}, Date: ${formattedDate}</li>`;
    });

    content += "</ul>";
    */


    return content;
}