const {EventStore, UserStore} = require('./index.js');
const chai = require('chai');
const expect = chai.expect;
describe("user aggregate", () => {
    beforeEach(() => EventStore.clearEventStore());
    it("should create a user", () => {
        const event = UserStore.create({ name: "matt" });
        expect(UserStore.find(event.metadata.aggregateId).name).to.equal('matt');
    });
    it("should throw on duplicate user", () => {
        const event = UserStore.create({ name: "matt" });
        expect(() => UserStore.create({ name: "matt" })).to.throw(); 
    }); 
    it("should update a user", () => {
        const event = UserStore.create({ name: "matt" });
        UserStore.update(event.metadata.aggregateId, { name: "matt james" });
        expect(UserStore.find(event.metadata.aggregateId).name).to.equal("matt james");
    });
    it("should delete a user", () => {
        const event = UserStore.create({ name: "matt" });
        UserStore.delete(event.metadata.aggregateId);
        expect(UserStore.find(event.metadata.aggregateId)).to.be.null;
    });
});
describe("event store", () => {
    beforeEach(() => EventStore.clearEventStore());
    it("should save event", () => {
        EventStore.save({a:"b"});
        expect(EventStore.getEvents()).to.have.length(1);
    });
});
