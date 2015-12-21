<div className={["item",this.model.crossed?'crossed':'']}>
    {this.model.text}
    <div className="cross" if={!this.model.crossed} onClick={this.model.cross}/>
    <div className="remove" if={this.model.crossed} onClick={this.model.remove}/>
</div>