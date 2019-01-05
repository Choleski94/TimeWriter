import EventReducer from "../event-processing/event-reducer";
import EventStoreRepair from "./event-store-repair";
import EventStoreState from "./event-store-state";
import EventStoreCleanup from "./event-store-cleanup";
import EventStoreValidation from "./event-store-validation";

export default class EventStore {
	constructor(history) {
		this._chain = history;

		this._eventReducer = new EventReducer();
		this._eventStoreRepair = new EventStoreRepair();
		this._eventStoreState = new EventStoreState();
		this._eventStoreCleanup = new EventStoreCleanup();
		this._eventStoreValidation = new EventStoreValidation();
	}

	_reduceChain(event) {
		return [
			...this._chain,
			{
				event,
				state: null
			}
		];
	}

	add(event) {
		if (!this._eventStoreValidation.canAddEvent(this._chain, event))
			return false;

		const newChain = this._reduceChain(event)

		this._eventStoreRepair.fix(newChain);
		this._eventStoreState.updateCurrentState(newChain);
		this._eventStoreCleanup.cleanup(newChain);

		this._chain = newChain;

		return true;
	}

	get history() {
		return this._chain;
	}

	get state() {
		return this._chain[this._chain.length - 1].state;
	}
}