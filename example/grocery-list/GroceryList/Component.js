import './View';
import './Model';

class Component extends View {
    componentWillMount() {
        this.model = new Model();
    }
    addItem() {
        this.model.addItem(this.state.input);
        this.setState({input:''});
    }
}