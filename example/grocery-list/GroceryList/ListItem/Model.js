var counter = 0;

class Model {
    constructor(parent, text, crossed=false) {
        BoundObject.create(this);
        this.id = counter++;
        this.parent = parent;
        this.text = text;
        this.crossed = crossed;
    }
    cross() {
        this.crossed = true;
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