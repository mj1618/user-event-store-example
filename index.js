let events = [];
let seq = 1;
const EventStore = {
    save: e => events.push(e),
    getEvents: () => events,
    clearEventStore: () => events = [],
    filter: fn => events.filter(fn),
};
module.exports.EventStore = EventStore;

const UserStore = {
    delete: () => EventStore.clearEventStore(),
    delete1: aggregateId => {
        const events = EventStore.filter(e => e.metadata.aggregateId===aggregateId);
        const event = {
            metadata: {
                aggregateType: "USER_AGGREGATE",
                aggregateId,
                id: Math.random(),
                eventType: "deleted",
                timestamp: (new Date()).getTime(),
                sequence_id: seq++,
                version: events[events.length-1].metadata.version + 1,
            },
        };
        EventStore.save(event);
        return event;
    },
    create: userData => {
        if( EventStore.filter(e => e.data.name===userData.name).length>0 )throw new Error('user exists');
        const event = {
            metadata: {
                aggregateType: "USER_AGGREGATE",
                aggregateId: Math.random(),
                id: Math.random(),
                eventType: "created",
                timestamp: (new Date()).getTime(),
                sequence_id: seq++,
                version: 1,
            },
            data: userData,
        };
        EventStore.save(event);
        return event;
    },
    update: (aggregateId, userData) => {
        const events = EventStore.filter(e => e.metadata.aggregateId===aggregateId);
        const event = {
            metadata: {
                aggregateId,
                aggregateType: "USER_AGGREGATE",
                id: Math.random(),
                sequence_id: seq++,
                timestamp: (new Date()).getTime(),
                version: events[events.length-1].metadata.version + 1,
                eventType: "updated",
            },
            data: userData,
        };
        EventStore.save(event);
        return event;
    }, 
    find: aggregateId => {
        const events = EventStore.filter(e => e.metadata.aggregateId===aggregateId);
        return events.reduce(UserStore.processEvent, {data:null}).data;
    },
    processEvent: (state, event) => {
        if(event.metadata.eventType==='created'){
            if(state.data!=null) throw new Error("user exists");
            return event;
        } else if(event.metadata.eventType==="updated"){
            return {
                metadata: event.metadata,
                data: Object.assign({}, state.data, event.data),
            };
        } else if(event.metadata.eventType==="deleted"){
            return {
                metadata: event.metadata,
                data: null,
            };
        } else throw new Error("undefined eventType");
    },
};
module.exports.UserStore = UserStore;
