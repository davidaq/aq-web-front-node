import ListItemModel from './ListItem/Model';

class Model {
    constructor() {
        BoundObject.create(this);
        this.list = BoundObject.create([]);
        if (localStorage.GroceryList) {
            var list = JSON.parse(localStorage.GroceryList);
            for (var item of list) {
                item = new ListItemModel(this, item.text, item.crossed);
                this.list.push(item);
            }
        }
        BoundObject(this.list).listen(() => this.saveOnUpdate());
    }
    addItem(text) {
        if (!text)
            return;
        var item = new ListItemModel(this, text);
        this.list.push(item);
        return item;
    }
    removeItem(item) {
        var pos = this.list.indexOf(item);
        if (pos > -1)
            this.list.splice(pos, 1);
    }
    saveOnUpdate() {
        localStorage.setItem("GroceryList", JSON.stringify(this.list));
    }
}
