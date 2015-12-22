import ListItemModel from './ListItem/Model';
import 'EventEmitter';

class Model extends EventEmitter {
    constructor() {
        super();
        this.list = [];
        if (localStorage.GroceryList) {
            var list = JSON.parse(localStorage.GroceryList);
            for (var item of list) {
                item = new ListItemModel(this, item.text, item.crossed);
                this.follow(item);
                this.list.push(item);
            }
        }
        this.on('update', this.saveOnUpdate);
    }
    addItem(text) {
        if (!text)
            return;
        var item = new ListItemModel(this, text);
        this.follow(item);
        this.list.push(item);
        this.emit('update');
        return item;
    }
    removeItem(item) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] == item) {
                this.list.splice(i, 1);
                this.unfollow(item);
                this.emit('update');
                break;
            }
        }
    }
    saveOnUpdate() {
        localStorage.setItem("GroceryList", JSON.stringify(this.list));
    }
}
