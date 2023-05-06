export class Storage<T> {
	private key!: string;
	private primitive!: boolean;

	private isPrimitive(test: any) {
		return test !== Object(test);
	}

	constructor(key: string, defaultValue: T) {
		this.key = key;
		this.primitive = this.isPrimitive(defaultValue);

		const isExist = !!this.get();
		if (!isExist) {
			const value = this.primitive
				? defaultValue
				: JSON.stringify(defaultValue);
			this.set(value as T);
		}
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

	set(value: T) {
		try {
			if (this.primitive) localStorage.setItem(this.key, value as string);
			else localStorage.setItem(this.key, JSON.stringify(value));
		} catch (err) {}
	}

	remove() {
		localStorage.removeItem(this.key);
	}
}
