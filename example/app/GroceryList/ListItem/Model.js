import 'EventEmitter';

var counter = 0;

class Model extends EventEmitter {
    constructor(parent, text, crossed=false) {
        super();
        this.id = counter++;
        this.parent = parent;
        this.text = text;
        this.crossed = crossed;
    }
    cross() {
        this.crossed = true;
        this.emit('update');
    }
    remove() {
        this.parent.removeItem(this);
    }
    toJSON() {
        return {
            text: this.text,
            crossed: this.crossed
        };
    }
}