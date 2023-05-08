export class Storage<T> {
	private key!: string;
	private primitive!: boolean;

	private isPrimitive(test: any) {
		return test !== Object(test);
	}

	private initialize(defaultValue: T): any {
		if (typeof window === "undefined") {
			setTimeout(() => this.initialize(defaultValue), 100);
			return;
		}

		const isExist = !!this.get();
		if (!isExist) {
			const value = this.isPrimitive(defaultValue)
				? JSON.stringify(defaultValue)
				: defaultValue;
			this.set(value as T);
		}
	}

	constructor(key: string, defaultValue: T) {
		this.key = key;
		this.primitive = this.isPrimitive(defaultValue);
		this.initialize(defaultValue);
	}

	get() {
		try {
			const data = localStorage.getItem(this.key);
			if (this.primitive) return data as T;
			return JSON.parse(data!) as T;
		} catch (err) {
			return null;
		}
	}

	set(value: T): void;
	set(setter: (prevValue: T) => T): void;
	set(valueOrSetter: any) {
		let value = valueOrSetter;
		if (typeof valueOrSetter === "function") {
			value = valueOrSetter(this.get()!);
		}
		try {
			if (this.primitive) localStorage.setItem(this.key, value as string);
			else localStorage.setItem(this.key, JSON.stringify(value));
		} catch (err) {}
	}

	remove() {
		localStorage.removeItem(this.key);
	}
}
