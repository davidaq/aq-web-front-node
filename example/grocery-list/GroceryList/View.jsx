import './Style';
import './ListItem';

<div className={Style}>
    <div className="title">Grocery List</div>
    <div className="list">
        {this.model.list.map((item) => <ListItem key={item.id} model={item}/>)}
    </div>
    <div className="control">
        <input type="text" onChange={this.bindState('input')} value={this.state.input}/>
        <button onClick={this.addItem}>Add</button>
    </div>
</div>