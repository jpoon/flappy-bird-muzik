export class RingBuffer {
    private _size: number; 
    private _store: number[] = [];

    constructor(size: number) {
        this._size = size;
    }

    push(val: number) {
        if (this._store.length >= this._size) {
            this.pop();
        }
        this._store.push(val);
    }

    pop(): number {
        return this._store.shift();
    }

    average(): number {
        var sum = 0;
        for (const i of this._store) {
            sum += i;
        }

        return sum / this._store.length;
    }
}